// Shipping service - mock implementation with tracking events

interface TrackingEvent {
  date: string;
  location: string;
  status: string;
  description: string;
}

interface ShipmentInfo {
  trackingNumber: string;
  carrier: string;
  status: string;
  estimatedDelivery: string;
  events: TrackingEvent[];
}

const mockShipments: Record<string, ShipmentInfo> = {
  'TRK-US-20240115-001': {
    trackingNumber: 'TRK-US-20240115-001',
    carrier: 'FedEx',
    status: 'Delivered',
    estimatedDelivery: '2024-01-20',
    events: [
      { date: '2024-01-20 14:30', location: 'New York, NY', status: 'Delivered', description: 'Package delivered to front door' },
      { date: '2024-01-20 08:15', location: 'New York, NY', status: 'Out for Delivery', description: 'Package is out for delivery' },
      { date: '2024-01-19 22:00', location: 'Newark, NJ', status: 'In Transit', description: 'Arrived at local facility' },
      { date: '2024-01-18 10:00', location: 'Memphis, TN', status: 'In Transit', description: 'Departed FedEx hub' },
      { date: '2024-01-15 16:00', location: 'San Francisco, CA', status: 'Shipped', description: 'Package picked up' },
    ],
  },
  'TRK-US-20240118-002': {
    trackingNumber: 'TRK-US-20240118-002',
    carrier: 'UPS',
    status: 'In Transit',
    estimatedDelivery: '2024-01-25',
    events: [
      { date: '2024-01-20 06:00', location: 'Chicago, IL', status: 'In Transit', description: 'Arrived at UPS facility' },
      { date: '2024-01-19 14:00', location: 'Denver, CO', status: 'In Transit', description: 'Departed UPS facility' },
      { date: '2024-01-18 09:00', location: 'San Francisco, CA', status: 'Shipped', description: 'Package picked up' },
    ],
  },
  'TRK-UK-20240120-003': {
    trackingNumber: 'TRK-UK-20240120-003',
    carrier: 'DHL',
    status: 'In Transit',
    estimatedDelivery: '2024-02-01',
    events: [
      { date: '2024-01-22 12:00', location: 'London, UK', status: 'Customs', description: 'Package is clearing customs' },
      { date: '2024-01-21 08:00', location: 'Frankfurt, DE', status: 'In Transit', description: 'Arrived at DHL hub' },
      { date: '2024-01-20 16:00', location: 'San Francisco, CA', status: 'Shipped', description: 'International shipment dispatched' },
    ],
  },
};

export function trackShipment(trackingNumber: string) {
  const shipment = mockShipments[trackingNumber];

  if (!shipment) {
    return {
      success: false,
      message: `Tracking number ${trackingNumber} not found. Please verify the tracking number.`,
    };
  }

  return {
    success: true,
    shipment,
  };
}
