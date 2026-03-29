export interface OrderItem {
  sku: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  orderId: string;
  email: string;
  items: OrderItem[];
  status: "Processing" | "Shipped" | "Delivered" | "Cancelled";
  trackingNumber: string | null;
  orderDate: string;
  estimatedDelivery: string | null;
  shippingAddress: string;
  total: number;
}

export interface Warranty {
  serialNumber: string;
  productSku: string;
  productName: string;
  purchaseDate: string;
  warrantyExpiry: string;
  coverageType: "Standard" | "Extended";
  status: "Active" | "Expired";
}
