// Function calling tool definitions for OpenAI API
// Tools are scoped by agent role to prevent tool hallucination

import { ChatCompletionTool } from 'openai/resources/chat/completions';

// --- Individual Tool Definitions ---

const checkOrderStatus: ChatCompletionTool = {
  type: 'function',
  function: {
    name: 'check_order_status',
    description: 'Check the status of a customer order by order ID. Returns order details including status, items, shipping info, and estimated delivery.',
    parameters: {
      type: 'object',
      properties: {
        order_id: {
          type: 'string',
          description: 'The order ID, e.g., ORD-2024-1001',
        },
        email: {
          type: 'string',
          description: 'Customer email for verification (optional)',
        },
      },
      required: ['order_id'],
    },
  },
};

const checkWarrantyStatus: ChatCompletionTool = {
  type: 'function',
  function: {
    name: 'check_warranty_status',
    description: 'Check the warranty status of a product by its serial number. Returns warranty details including coverage period and status.',
    parameters: {
      type: 'object',
      properties: {
        serial_number: {
          type: 'string',
          description: 'Product serial number, e.g., SN-LPX1-2024-001',
        },
      },
      required: ['serial_number'],
    },
  },
};

const getProductPrice: ChatCompletionTool = {
  type: 'function',
  function: {
    name: 'get_product_price',
    description: 'Get the current price and availability of a product by SKU ID.',
    parameters: {
      type: 'object',
      properties: {
        sku_id: {
          type: 'string',
          description: 'Product SKU, e.g., LPX1-001',
        },
      },
      required: ['sku_id'],
    },
  },
};

const createReturnTicket: ChatCompletionTool = {
  type: 'function',
  function: {
    name: 'create_return_ticket',
    description: 'Create a return/refund ticket for an order. Returns a ticket ID and next steps.',
    parameters: {
      type: 'object',
      properties: {
        order_id: {
          type: 'string',
          description: 'The order ID to return, e.g., ORD-2024-1001',
        },
        reason: {
          type: 'string',
          enum: ['defective', 'wrong_item', 'not_as_described', 'changed_mind', 'other'],
          description: 'Reason for return',
        },
        description: {
          type: 'string',
          description: 'Detailed description of the issue',
        },
      },
      required: ['order_id', 'reason'],
    },
  },
};

const getProductRecommendations: ChatCompletionTool = {
  type: 'function',
  function: {
    name: 'get_product_recommendations',
    description: 'Get product recommendations based on use case and budget.',
    parameters: {
      type: 'object',
      properties: {
        use_case: {
          type: 'string',
          description: 'What the customer needs the product for, e.g., "programming", "gaming", "music", "fitness"',
        },
        budget_max: {
          type: 'number',
          description: 'Maximum budget in USD',
        },
      },
      required: ['use_case'],
    },
  },
};

const trackShipment: ChatCompletionTool = {
  type: 'function',
  function: {
    name: 'track_shipment',
    description: 'Track a shipment by tracking number. Returns tracking events and current status.',
    parameters: {
      type: 'object',
      properties: {
        tracking_number: {
          type: 'string',
          description: 'Shipment tracking number, e.g., TRK-US-20240115-001',
        },
      },
      required: ['tracking_number'],
    },
  },
};

// --- Scoped Tool Sets ---

export const salesTools: ChatCompletionTool[] = [
  getProductPrice,
  getProductRecommendations,
];

export const supportTools: ChatCompletionTool[] = [
  checkOrderStatus,
  checkWarrantyStatus,
  createReturnTicket,
  trackShipment,
];

// All tools (backward compatibility)
export const functionTools: ChatCompletionTool[] = [
  ...supportTools,
  ...salesTools,
];
