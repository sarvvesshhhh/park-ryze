/**
 * Geospatial Proximity & Smart Parking Recommendation Engine
 * Park Ryze Architecture
 */

import { ParkingLot, VehicleCategory } from '../types';

export interface RankedParkingLot extends ParkingLot {
  distanceKm: number;
  driveTimeMins: number;
  walkTimeMins: number;
  recommendationScore: number; // 0 - 100
  badge?: 'Best Match' | 'Closest Walk' | 'Best Value' | 'High Availability';
}

/**
 * Calculates great-circle distance between two coordinates in kilometers using the Haversine formula
 */
export function calculateHaversineDistanceKm(
  coord1: [number, number], // [lat, lng]
  coord2: [number, number]  // [lat, lng]
): number {
  const [lat1, lon1] = coord1;
  const [lat2, lon2] = coord2;

  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 10) / 10; // 1 decimal place e.g. 1.2 km
}

/**
 * Estimates driving time in minutes based on Mumbai urban traffic speeds (~22 km/h avg)
 */
export function estimateDriveTimeMins(distanceKm: number): number {
  if (distanceKm <= 0.2) return 1;
  const avgSpeedKmh = 22; // urban Mumbai speed
  const mins = Math.ceil((distanceKm / avgSpeedKmh) * 60) + 2; // +2 mins for traffic lights/gate queues
  return Math.max(2, mins);
}

/**
 * Estimates walking time in minutes (~4.5 km/h walking speed)
 */
export function estimateWalkTimeMins(distanceKm: number): number {
  const walkSpeedKmh = 4.5;
  return Math.max(1, Math.ceil((distanceKm / walkSpeedKmh) * 60));
}

/**
 * Multi-Factor Smart Parking Ranking Algorithm
 * Evaluates lots based on:
 * - Proximity (45% weight)
 * - Availability Ratio (30% weight)
 * - Price Competitiveness (25% weight)
 */
export function rankParkingLots(
  lots: ParkingLot[],
  referenceCoords: [number, number], // User location or searched destination [lat, lng]
  radiusKm: number = 5.0,
  vehicleType: VehicleCategory = 'car'
): RankedParkingLot[] {
  // 1. Filter by vehicle compatibility and calculate distances
  const mapped = lots
    .filter((lot) => lot.supportedVehicles.includes(vehicleType))
    .map((lot) => {
      const distanceKm = calculateHaversineDistanceKm(referenceCoords, lot.coordinates);
      const driveTimeMins = estimateDriveTimeMins(distanceKm);
      const walkTimeMins = estimateWalkTimeMins(distanceKm);
      return {
        ...lot,
        distanceKm,
        driveTimeMins,
        walkTimeMins,
      };
    });

  // Filter within radius (if radiusKm > 0)
  const withinRadius = radiusKm > 0 ? mapped.filter((l) => l.distanceKm <= radiusKm) : mapped;
  // If nothing within radius, return nearest 3 lots so user is never stranded
  const pool = withinRadius.length > 0 ? withinRadius : [...mapped].sort((a, b) => a.distanceKm - b.distanceKm).slice(0, 3);

  if (pool.length === 0) return [];

  // Compute maximums for normalization
  const maxDist = Math.max(...pool.map((l) => l.distanceKm), radiusKm || 1);
  const maxPrice = Math.max(...pool.map((l) => l.hourlyRate), 100);

  // 2. Score each lot (0 to 100)
  const scoredLots: RankedParkingLot[] = pool.map((lot) => {
    // Proximity factor (closer = higher)
    const proximityScore = Math.max(0, 1 - lot.distanceKm / maxDist);

    // Availability factor (more available bays = higher)
    const availabilityScore =
      lot.totalBays > 0 ? lot.availableBays / lot.totalBays : 0;

    // Price factor (cheaper = higher)
    const priceScore = Math.max(0, 1 - lot.hourlyRate / maxPrice);

    // Weighted combination
    const composite =
      0.45 * proximityScore + 0.30 * availabilityScore + 0.25 * priceScore;

    const recommendationScore = Math.round(composite * 100);

    return {
      ...lot,
      recommendationScore,
    };
  });

  // 3. Sort by recommendationScore descending
  scoredLots.sort((a, b) => b.recommendationScore - a.recommendationScore);

  // 4. Assign badges to standout options
  if (scoredLots.length > 0) {
    // Best match is the highest scoring
    scoredLots[0].badge = 'Best Match';

    // Find closest walking distance if not already best match
    const closest = [...scoredLots].sort((a, b) => a.distanceKm - b.distanceKm)[0];
    if (closest && closest.id !== scoredLots[0].id) {
      closest.badge = 'Closest Walk';
    }

    // Find most economical
    const cheapest = [...scoredLots].sort((a, b) => a.hourlyRate - b.hourlyRate)[0];
    if (cheapest && !cheapest.badge) {
      cheapest.badge = 'Best Value';
    }

    // Find highest availability
    const highestAvail = [...scoredLots].sort((a, b) => b.availableBays - a.availableBays)[0];
    if (highestAvail && !highestAvail.badge && highestAvail.availableBays >= 4) {
      highestAvail.badge = 'High Availability';
    }
  }

  return scoredLots;
}
