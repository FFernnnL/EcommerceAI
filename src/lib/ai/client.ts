// OpenAI SDK client configuration for Volcengine endpoint

import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.ARK_API_KEY || '',
  baseURL: process.env.ARK_BASE_URL || 'https://ark.cn-beijing.volces.com/api/coding/v3',
});

export const MODEL_ID = process.env.ARK_MODEL || 'DeepSeek-V3.2';

export default client;
