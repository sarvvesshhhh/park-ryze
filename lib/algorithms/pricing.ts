/**
 * Dynamic Pricing & Fare Matrix Engine
 * Park Ryze Architecture
 */

import { VehicleCategory } from '../types';

export interface PricingBreakdown {
  baseHourlyRate: number;
  vehicleMultiplier: number;
  vehicleCategory: VehicleCategory;
  effectiveHourlyRate: number;
  durationHours: number;
  subtotal: number;
  durationDiscountAmount: number;
  durationDiscountPercent: number;
  surgeMultiplier: number;
  surgeAmount: number;
  surgeStatus: 'saver' | 'standard' | 'high-demand';
  platformFee: number;
  totalFare: number;
  savingsVsStreetParking: number; // Est. 40-50% savings over BMC street tow zones
}

export function calculateDynamicPrice(
  baseLotRate: number,
  durationHours: number,
  vehicleCategory: VehicleCategory = 'car',
  totalBays: number = 16,
  availableBays: number = 4
): PricingBreakdown {
  // 1. Vehicle Category Multiplier
  let vehicleMultiplier = 1.0;
  if (vehicleCategory === 'two-wheeler') {
    vehicleMultiplier = 0.40; // 60% cheaper for bikes/scooters
  } else {
    vehicleMultiplier = 1.00;
  }

  // 2. Real-time Occupancy Surge Multiplier
  const occupancyRate = totalBays > 0 ? (totalBays - availableBays) / totalBays : 0.7;
  let surgeMultiplier = 1.0;
  let surgeStatus: 'saver' | 'standard' | 'high-demand' = 'standard';

  if (occupancyRate >= 0.80) {
    surgeMultiplier = 1.20; // 20% surge due to high cluster demand
    surgeStatus = 'high-demand';
  } else if (occupancyRate < 0.40) {
    surgeMultiplier = 0.90; // 10% saver discount for off-peak bays
    surgeStatus = 'saver';
  }

  // 3. Effective Hourly Rate (adjusted for vehicle & surge)
  const adjustedRateBeforeDiscount = baseLotRate * vehicleMultiplier * surgeMultiplier;
  const effectiveHourlyRate = Math.round(adjustedRateBeforeDiscount);

  // 4. Duration Tier Discounts
  let durationDiscountPercent = 0;
  if (durationHours >= 8) {
    durationDiscountPercent = 30; // 30% discount for all-day commuter passes
  } else if (durationHours >= 4) {
    durationDiscountPercent = 15; // 15% discount for half-day passes
  } else if (durationHours >= 2) {
    durationDiscountPercent = 5; // 5% discount for 2 hrs
  }

  const rawSubtotal = effectiveHourlyRate * durationHours;
  const durationDiscountAmount = Math.round((rawSubtotal * durationDiscountPercent) / 100);
  const subtotal = rawSubtotal - durationDiscountAmount;

  // Surge calculation display
  const standardFare = Math.round(baseLotRate * vehicleMultiplier * durationHours);
  const surgeAmount = Math.max(0, rawSubtotal - standardFare);

  // Fixed Platform & RFID/Fastag sync fee
  const platformFee = 5;
  const totalFare = Math.max(10, subtotal + platformFee);

  // Estimated street parking / valet comparison in Mumbai (usually ₹100 - ₹150/hr)
  const streetParkingEquivalent = Math.round(120 * durationHours * (vehicleCategory === 'two-wheeler' ? 0.4 : 1));
  const savingsVsStreetParking = Math.max(0, streetParkingEquivalent - totalFare);

  return {
    baseHourlyRate: baseLotRate,
    vehicleMultiplier,
    vehicleCategory,
    effectiveHourlyRate,
    durationHours,
    subtotal,
    durationDiscountAmount,
    durationDiscountPercent,
    surgeMultiplier,
    surgeAmount,
    surgeStatus,
    platformFee,
    totalFare,
    savingsVsStreetParking,
  };
}
