// POST /api/chat - Multi-agent AI chat with Router, ReAct reasoning, and scoped tools

import { NextRequest } from 'next/server';
import client, { MODEL_ID } from '@/lib/ai/client';
import { ROUTER_PROMPT, buildSalesPrompt, buildSupportPrompt, buildGeneralPrompt } from '@/lib/ai/system-prompt';
import { salesTools, supportTools } from '@/lib/ai/function-schemas';
import { executeFunction } from '@/lib/ai/function-executor';
import { retrieve, formatContext } from '@/lib/rag/retriever';
import { ChatCompletionMessageParam, ChatCompletionTool } from 'openai/resources/chat/completions';
import { IntentType } from '@/types/chat';

export const runtime = 'nodejs';
export const maxDuration = 60;

// --- Stage 1: Router Agent - Intent Classification ---

async function classifyIntent(query: string): Promise<IntentType> {
  try {
    const response = await client.chat.completions.create({
      model: MODEL_ID,
      messages: [
        { role: 'system', content: ROUTER_PROMPT },
        { role: 'user', content: query },
      ],
      temperature: 0,
      max_tokens: 10,
      stream: false,
    });

    const result = (response.choices[0]?.message?.content || '').trim().toUpperCase();

    if (result.includes('SALES')) return 'SALES';
    if (result.includes('SUPPORT')) return 'SUPPORT';
    return 'GENERAL';
  } catch (error) {
    console.warn('Router classification failed, defaulting to GENERAL:', error);
    return 'GENERAL';
  }
}

// --- Stage 2: Agent Config Resolution ---

function resolveAgent(
  intent: IntentType,
  query: string
): { systemPrompt: string; tools: ChatCompletionTool[] | undefined } {
  if (intent === 'SALES') {
    const results = retrieve(query, 3, ['product_spec', 'faq']);
    const ctx = formatContext(results);
    return { systemPrompt: buildSalesPrompt(ctx), tools: salesTools };
  }

  if (intent === 'SUPPORT') {
    const results = retrieve(query, 3, ['troubleshooting', 'policy', 'faq']);
    const ctx = formatContext(results);
    return { systemPrompt: buildSupportPrompt(ctx), tools: supportTools };
  }

  // GENERAL: no tools, no RAG
  return { systemPrompt: buildGeneralPrompt(), tools: undefined };
}

// --- Main Handler ---

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages } = body as { messages: { role: string; content: string }[] };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'Messages are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Extract last user message for routing and RAG
    const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user');
    const query = lastUserMessage?.content || '';

    // Stage 1: Classify intent via Router Agent
    const intent = await classifyIntent(query);
    console.log(`[Router] Intent: ${intent} | Query: "${query.slice(0, 80)}"`);

    // Stage 2: Resolve agent config (prompt + tools + scoped RAG)
    const { systemPrompt, tools } = resolveAgent(intent, query);

    // Prepare conversation messages (limit to last 10 exchanges)
    const recentMessages = messages.slice(-20);
    const apiMessages: ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      ...recentMessages.map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    ];

    // Function calling loop (only if agent has tools)
    let currentMessages = [...apiMessages];

    if (tools) {
      let functionCallCount = 0;
      const MAX_FUNCTION_CALLS = 5;

      while (functionCallCount < MAX_FUNCTION_CALLS) {
        const response = await client.chat.completions.create({
          model: MODEL_ID,
          messages: currentMessages,
          tools,
          stream: false,
        });

        const choice = response.choices[0];
        const message = choice.message;

        // Check if there are tool calls
        if (message.tool_calls && message.tool_calls.length > 0) {
          // Add assistant message with tool calls
          currentMessages.push({
            role: 'assistant',
            content: message.content || '',
            tool_calls: message.tool_calls,
          });

          // Execute each tool call
          for (const toolCall of message.tool_calls) {
            if (toolCall.type !== 'function') continue;

            const functionName = toolCall.function.name;
            let args: Record<string, unknown> = {};

            try {
              args = JSON.parse(toolCall.function.arguments);
            } catch {
              args = {};
            }

            console.log(`[${intent} Agent] Calling: ${functionName}(${JSON.stringify(args)})`);
            const result = await executeFunction(functionName, args);

            currentMessages.push({
              role: 'tool',
              tool_call_id: toolCall.id,
              content: result,
            });
          }

          functionCallCount++;
          continue;
        }

        // No tool calls - break to streaming
        break;
      }
    }

    // Final streaming response
    const streamResponse = await client.chat.completions.create({
      model: MODEL_ID,
      messages: currentMessages,
      stream: true,
    });

    // Create SSE stream with <think> tag filtering
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          let buffer = '';
          let insideThink = false;

          for await (const chunk of streamResponse) {
            const delta = chunk.choices[0]?.delta;
            if (!delta?.content) continue;

            buffer += delta.content;

            // Process buffer to filter out <think>...</think> blocks
            while (buffer.length > 0) {
              if (insideThink) {
                const closeIdx = buffer.indexOf('</think>');
                if (closeIdx !== -1) {
                  // Found closing tag, discard everything up to and including </think>
                  buffer = buffer.slice(closeIdx + 8);
                  insideThink = false;
                } else {
                  // Still inside think block, keep tail in case </think> is split
                  if (buffer.length > 8) {
                    buffer = buffer.slice(-8);
                  }
                  break;
                }
              } else {
                const openIdx = buffer.indexOf('<think>');
                if (openIdx !== -1) {
                  // Send content before <think> to client
                  const beforeThink = buffer.slice(0, openIdx);
                  if (beforeThink) {
                    const data = JSON.stringify({ content: beforeThink });
                    controller.enqueue(encoder.encode(`data: ${data}\n\n`));
                  }
                  buffer = buffer.slice(openIdx + 7);
                  insideThink = true;
                } else {
                  // No <think> tag found; hold back tail in case tag is split across chunks
                  if (buffer.length > 7) {
                    const toSend = buffer.slice(0, -7);
                    buffer = buffer.slice(-7);
                    if (toSend) {
                      const data = JSON.stringify({ content: toSend });
                      controller.enqueue(encoder.encode(`data: ${data}\n\n`));
                    }
                  }
                  break;
                }
              }
            }
          }

          // Flush remaining buffer (only if not inside a think block)
          if (buffer && !insideThink) {
            const data = JSON.stringify({ content: buffer });
            controller.enqueue(encoder.encode(`data: ${data}\n\n`));
          }

          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          const errorData = JSON.stringify({ error: String(error) });
          controller.enqueue(encoder.encode(`data: ${errorData}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
