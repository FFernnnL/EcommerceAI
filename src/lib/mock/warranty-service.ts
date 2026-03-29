// Warranty service - mock implementation

import warrantiesData from '@/data/warranties.json';
import { Warranty } from '@/types/order';

const warranties = warrantiesData as unknown as Warranty[];

export function checkWarrantyStatus(serialNumber: string) {
  const warranty = warranties.find((w) => w.serialNumber === serialNumber);

  if (!warranty) {
    return {
      success: false,
      message: `No warranty found for serial number ${serialNumber}. Please verify your serial number.`,
    };
  }

  const now = new Date();
  const expirationDate = new Date(warranty.warrantyExpiry);
  const isActive = expirationDate > now;
  const daysRemaining = Math.ceil(
    (expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  return {
    success: true,
    warranty: {
      serialNumber: warranty.serialNumber,
      productName: warranty.productName,
      purchaseDate: warranty.purchaseDate,
      expirationDate: warranty.warrantyExpiry,
      status: isActive ? 'Active' : 'Expired',
      daysRemaining: isActive ? daysRemaining : 0,
      coverageType: warranty.coverageType,
    },
  };
}
