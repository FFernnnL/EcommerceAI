// Order service - mock implementation

import ordersData from '@/data/orders.json';
import { Order } from '@/types/order';

const orders = ordersData as unknown as Order[];

export function checkOrderStatus(orderId: string, email?: string) {
  const order = orders.find((o) => o.orderId === orderId);

  if (!order) {
    return {
      success: false,
      message: `Order ${orderId} not found. Please check the order ID and try again.`,
    };
  }

  if (email && order.email.toLowerCase() !== email.toLowerCase()) {
    return {
      success: false,
      message: 'Email does not match our records for this order.',
    };
  }

  return {
    success: true,
    order: {
      id: order.orderId,
      status: order.status,
      items: order.items.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      })),
      total: order.total,
      trackingNumber: order.trackingNumber || null,
      estimatedDelivery: order.estimatedDelivery || null,
      orderDate: order.orderDate,
    },
  };
}
