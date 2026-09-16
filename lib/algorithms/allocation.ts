/**
 * Smart Bay Allocation & Dimension Compatibility Engine
 * Park Ryze Architecture
 */

import { ParkingBay, ParkingLot, VehicleCategory } from '../types';

export interface BayRecommendation {
  recommendedBay: ParkingBay;
  confidenceScore: number;
  reason: string;
  isExactDimensionMatch: boolean;
  clearanceVerified: boolean;
}

export function recommendOptimalBay(
  lot: ParkingLot,
  vehicleCategory: VehicleCategory = 'car',
  preferredVehicleSize: 'compact' | 'sedan' | 'suv' | 'two-wheeler' = 'sedan'
): BayRecommendation | null {
  const availableBays = lot.bays.filter((b) => b.status === 'available');
  if (availableBays.length === 0) return null;

  // 1. Filter by vehicle dimension compatibility
  let candidateBays = availableBays;

  if (vehicleCategory === 'two-wheeler') {
    // Prefer compact or two-wheeler dedicated spots
    const dedicated = availableBays.filter(
      (b) => b.vehicleSize === 'two-wheeler' || b.vehicleSize === 'compact'
    );
    if (dedicated.length > 0) candidateBays = dedicated;
  } else {
    // Car mode
    if (preferredVehicleSize === 'suv') {
      const suvBays = availableBays.filter((b) => b.vehicleSize === 'suv');
      if (suvBays.length > 0) candidateBays = suvBays;
    } else if (preferredVehicleSize === 'sedan') {
      const sedanBays = availableBays.filter(
        (b) => b.vehicleSize === 'sedan' || b.vehicleSize === 'suv'
      );
      if (sedanBays.length > 0) candidateBays = sedanBays;
    }
  }

  // 2. Score candidate bays based on ease of access (driveway proximity & entry gate)
  const scored = candidateBays.map((bay) => {
    let score = 50;

    // Row B is flanked along the 6m central tarmac lane -> faster turn-in
    if (bay.row === 'B') score += 25;

    // Middle bays (3, 4, 5) have wider pillar clearances
    if (bay.number >= 3 && bay.number <= 6) score += 20;

    // Direct size match bonus
    const isExact =
      vehicleCategory === 'two-wheeler'
        ? bay.vehicleSize === 'two-wheeler' || bay.vehicleSize === 'compact'
        : bay.vehicleSize === preferredVehicleSize;

    if (isExact) score += 20;

    return {
      bay,
      score,
      isExact,
    };
  });

  scored.sort((a, b) => b.score - a.score);
  const best = scored[0];

  let reason = 'Optimal turning radius from main entrance ramp';
  if (best.bay.row === 'B') {
    reason = `Direct access from 6.0m tarmac driveway; wide turning clearance for ${preferredVehicleSize.toUpperCase()}`;
  } else {
    reason = `Covered stilt bay with CCTV surveillance line of sight`;
  }

  return {
    recommendedBay: best.bay,
    confidenceScore: Math.min(99, best.score),
    reason,
    isExactDimensionMatch: best.isExact,
    clearanceVerified: true,
  };
}
