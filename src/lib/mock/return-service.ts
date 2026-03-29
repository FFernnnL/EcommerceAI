// Return service - mock implementation

import ordersData from '@/data/orders.json';
import { Order } from '@/types/order';

const orders = ordersData as unknown as Order[];

export function createReturnTicket(orderId: string, reason: string, description?: string) {
  const order = orders.find((o) => o.orderId === orderId);

  if (!order) {
    return {
      success: false,
      message: `Order ${orderId} not found. Please check the order ID.`,
    };
  }

  if (order.status === 'Cancelled') {
    return {
      success: false,
      message: 'This order has already been cancelled and cannot be returned.',
    };
  }

  if (order.status === 'Processing') {
    return {
      success: false,
      message: 'This order is still processing. You can cancel it instead of returning.',
    };
  }

  // Check if within 30-day return window
  const orderDate = new Date(order.orderDate);
  const now = new Date();
  const daysSinceOrder = Math.ceil(
    (now.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysSinceOrder > 30) {
    return {
      success: false,
      message: `The 30-day return window has expired for this order (ordered ${daysSinceOrder} days ago).`,
    };
  }

  const ticketId = `RTN-${Date.now().toString(36).toUpperCase()}`;

  return {
    success: true,
    ticket: {
      ticketId,
      orderId: order.orderId,
      reason,
      description: description || 'No additional details provided',
      status: 'Pending Review',
      estimatedRefund: order.total,
      nextSteps: [
        'Your return request has been submitted and is pending review.',
        'You will receive an email with a prepaid return shipping label within 24 hours.',
        'Pack the item in its original packaging and drop it off at any authorized shipping location.',
        'Refund will be processed within 5-7 business days after we receive the item.',
      ],
    },
  };
}
