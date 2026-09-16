export type VehicleCategory = 'car' | 'two-wheeler';

export type BayStatus = 'available' | 'occupied' | 'reserved';

export interface ParkingBay {
  id: string; // e.g. "A-01"
  row: 'A' | 'B';
  number: number;
  status: BayStatus;
  vehicleSize: 'compact' | 'sedan' | 'suv' | 'two-wheeler';
  occupiedPlate?: string;
}

export interface ParkingLot {
  id: string;
  name: string;
  subTitle: string;
  type: 'residential' | 'commercial';
  address: string;
  locality: string;
  coordinates: [number, number]; // [lat, lng]
  hourlyRate: number; // in INR ₹
  totalBays: number;
  availableBays: number;
  clearance: string; // e.g. "2.1m Clearance"
  cctv: boolean;
  verifiedSociety: boolean;
  securityGateNotes: string;
  entryGate: string; // e.g. "Gate 2 (West Wing)"
  hostName: string;
  hostPhone: string;
  levelName: string; // e.g. "Stilt Level 0"
  supportedVehicles: VehicleCategory[];
  bays: ParkingBay[];
}

export interface ActivePass {
  id: string;
  reservationHash: string;
  lotId: string;
  lotName: string;
  levelName: string;
  address: string;
  bayId: string;
  vehiclePlate: string;
  vehicleCategory: VehicleCategory;
  startTime: number; // timestamp ms
  endTime: number; // timestamp ms
  durationHours: number;
  hourlyRate: number;
  platformFee: number;
  totalPaid: number;
  entryGate: string;
  gateInstructions: string;
  hostName: string;
  hostPhone: string;
  status: 'active' | 'extended' | 'completed';
}

export interface RouteStep {
  instruction: string;
  distanceMeters: number;
  durationSeconds: number;
  maneuverType: string;
  modifier?: string;
  location: [number, number]; // [lng, lat]
}

export interface NavigationRoute {
  coordinates: [number, number][]; // [[lng, lat], ...]
  distanceKm: number;
  durationMins: number;
  steps: RouteStep[];
  destinationName: string;
  gateName: string;
  originName?: string;
  startCoords?: [number, number]; // [lat, lng]
  destinationCoords?: [number, number]; // [lat, lng]
}

export interface HostBookingRequest {
  id: string;
  driverName: string;
  bayId: string;
  tower: string;
  vehiclePlate: string;
  vehicleModel: string;
  timeSlot: string;
  duration: string;
  payout: number;
  status: 'pending' | 'accepted' | 'declined';
  receivedAt: string;
}
