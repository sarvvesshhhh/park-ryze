import { create } from 'zustand';
import { ParkingLot, ActivePass, HostBookingRequest, VehicleCategory, NavigationRoute } from './types';
import { INITIAL_PARKING_LOTS, INITIAL_HOST_REQUESTS } from './mockData';
import { fetchTurnByTurnRoute } from './routing';
import { rankParkingLots, calculateHaversineDistanceKm, RankedParkingLot } from './algorithms/proximity';
import { calculateDynamicPrice, PricingBreakdown } from './algorithms/pricing';
import { recommendOptimalBay, BayRecommendation } from './algorithms/allocation';
import { SimulationState, createInitialSimulation, advanceSimulationStep } from './algorithms/simulation';

interface ParkingStore {
  // Theme Mode (Stitch MCP spec: Dark / Light)
  themeMode: 'dark' | 'light';
  toggleThemeMode: () => void;

  // Navigation & Location
  userLocation: [number, number]; // [lat, lng] (Real GPS)
  startLocation: [number, number]; // [lat, lng] (Active Route Origin)
  startLocationName: string; // e.g. "My GPS Location", "NMIMS Vile Parle"
  isCustomStartPoint: boolean;
  
  // Destination / Park Location (Custom or Lot)
  destinationLocation: [number, number] | null; // [lat, lng]
  destinationName: string;
  isCustomDestination: boolean;

  isLocating: boolean;
  watchGpsActive: boolean;
  gpsWatchId: number | null;
  
  setUserLocation: (coords: [number, number]) => void;
  setCustomStartPoint: (coords: [number, number], name?: string) => Promise<void>;
  setDestinationPoint: (coords: [number, number], name?: string, gateName?: string) => Promise<void>;
  resetToGpsLocation: () => Promise<void>;
  detectUserLocation: () => void;
  toggleWatchGps: () => void;
  recalculateCurrentRoute: () => Promise<void>;

  // Search & Filter with Algorithmic Radius
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  vehicleType: VehicleCategory;
  setVehicleType: (type: VehicleCategory) => void;
  radiusKm: number;
  setRadiusKm: (radius: number) => void;
  sortBy: 'recommendation' | 'distance' | 'price' | 'availability';
  setSortBy: (sort: 'recommendation' | 'distance' | 'price' | 'availability') => void;

  // Parking lots data
  parkingLots: ParkingLot[];
  selectedLotId: string | null;
  selectedBayId: string | null;
  isDrawerOpen: boolean;
  
  // Computed Algorithmic Selectors
  getRankedLots: () => RankedParkingLot[];
  getCurrentPricing: () => PricingBreakdown;
  getOptimalBayRecommendation: () => BayRecommendation | null;

  // Selection & Booking controls
  selectedDurationHours: number;
  userVehiclePlate: string;
  setSelectedDurationHours: (hours: number) => void;
  setUserVehiclePlate: (plate: string) => void;
  selectLot: (lotId: string) => void;
  closeDrawer: () => void;
  selectBay: (bayId: string) => void;

  // Active Gate Pass & Lifecycle
  activePass: ActivePass | null;
  isPassModalOpen: boolean;
  openPassModal: () => void;
  closePassModal: () => void;
  bookCurrentSelection: () => void;
  extendActivePass: (additionalMinutes?: number) => void;
  completeActivePass: () => void;

  // Turn-by-Turn GPS Navigation & Simulation
  mapboxToken: string;
  setMapboxToken: (token: string) => void;
  isNavigating: boolean;
  isCalculatingRoute: boolean;
  activeRoute: NavigationRoute | null;
  currentStepIndex: number;
  startNavigationTo: (destinationCoords: [number, number], destinationName: string, gateName: string) => Promise<void>;
  stopNavigation: () => void;
  nextStep: () => void;
  prevStep: () => void;

  // Driving Simulation Engine
  simulation: SimulationState | null;
  startSimulation: () => void;
  pauseSimulation: () => void;
  resumeSimulation: () => void;
  stopSimulation: () => void;
  setSimulationSpeed: (speed: 1 | 2 | 5) => void;
  stepSimulation: () => void;

  // Host Dashboard
  hostRequests: HostBookingRequest[];
  autoCheckIn: boolean;
  acceptHostRequest: (id: string) => void;
  declineHostRequest: (id: string) => void;
  toggleAutoCheckIn: () => void;
  addNewHostListing: (listing: {
    societyName: string;
    tower: string;
    bayNumber: string;
    hourlyRate: number;
    compatibility: string[];
  }) => void;
}

export const useParkingStore = create<ParkingStore>((set, get) => ({
  // Theme Mode
  themeMode:
    typeof window !== 'undefined'
      ? (localStorage.getItem('park_ryze_theme') as 'dark' | 'light') || 'dark'
      : 'dark',

  toggleThemeMode: () => {
    const nextTheme = get().themeMode === 'dark' ? 'light' : 'dark';
    if (typeof window !== 'undefined') {
      localStorage.setItem('park_ryze_theme', nextTheme);
      if (nextTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
    set({ themeMode: nextTheme });
  },

  // Locations (Default centered at Vile Parle West, Mumbai)
  userLocation: [19.1031, 72.8372],
  startLocation: [19.1031, 72.8372],
  startLocationName: 'My GPS Location',
  isCustomStartPoint: false,

  destinationLocation: [19.1042, 72.8351],
  destinationName: 'Gulmohar Heights CHS',
  isCustomDestination: false,

  isLocating: false,
  watchGpsActive: false,
  gpsWatchId: null,

  setUserLocation: (coords) =>
    set((state) => ({
      userLocation: coords,
      startLocation: state.isCustomStartPoint ? state.startLocation : coords,
    })),

  setCustomStartPoint: async (coords, name = 'Custom Start Pin') => {
    set({
      startLocation: coords,
      startLocationName: name,
      isCustomStartPoint: true,
    });
    const { destinationLocation, destinationName } = get();
    if (destinationLocation) {
      await get().startNavigationTo(destinationLocation, destinationName, 'Security Gate');
    }
  },

  setDestinationPoint: async (coords, name = 'Custom Parking Destination', gateName = 'Main Gate') => {
    set({
      destinationLocation: coords,
      destinationName: name,
      isCustomDestination: true,
    });
    await get().startNavigationTo(coords, name, gateName);
  },

  resetToGpsLocation: async () => {
    const { userLocation, destinationLocation, destinationName } = get();
    set({
      startLocation: userLocation,
      startLocationName: 'My GPS Location',
      isCustomStartPoint: false,
    });
    if (destinationLocation) {
      await get().startNavigationTo(destinationLocation, destinationName, 'Main Gate');
    }
  },
  
  detectUserLocation: () => {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      set({ isLocating: true });
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords: [number, number] = [position.coords.latitude, position.coords.longitude];
          const isCustom = get().isCustomStartPoint;
          set({
            userLocation: coords,
            startLocation: isCustom ? get().startLocation : coords,
            startLocationName: isCustom ? get().startLocationName : 'My GPS Location',
            isLocating: false,
          });
        },
        (error) => {
          console.warn('Geolocation warning/denied:', error.message);
          set({ isLocating: false });
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }
  },

  toggleWatchGps: () => {
    const { watchGpsActive, gpsWatchId } = get();
    if (watchGpsActive && gpsWatchId !== null) {
      if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
        navigator.geolocation.clearWatch(gpsWatchId);
      }
      set({ watchGpsActive: false, gpsWatchId: null });
    } else {
      if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
        set({ isLocating: true });
        const id = navigator.geolocation.watchPosition(
          (pos) => {
            const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
            const updates: any = {
              userLocation: coords,
              watchGpsActive: true,
              gpsWatchId: id,
              isLocating: false,
            };
            if (!get().isCustomStartPoint) {
              updates.startLocation = coords;
            }
            set(updates);
          },
          (err) => {
            console.warn('watchPosition error:', err.message);
            set({ isLocating: false });
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
        );
      }
    }
  },

  recalculateCurrentRoute: async () => {
    const { startLocation, activeRoute, mapboxToken, startLocationName } = get();
    if (!activeRoute || !activeRoute.destinationCoords) return;
    set({ isCalculatingRoute: true });

    try {
      const updatedRoute = await fetchTurnByTurnRoute(
        startLocation,
        activeRoute.destinationCoords,
        activeRoute.destinationName,
        activeRoute.gateName,
        mapboxToken,
        startLocationName
      );

      set({
        activeRoute: updatedRoute,
        isCalculatingRoute: false,
        simulation: updatedRoute ? createInitialSimulation(updatedRoute) : null,
      });
    } catch (err) {
      console.error('Recalculate route error:', err);
      set({ isCalculatingRoute: false });
    }
  },

  // Search & Algorithmic Filtering
  searchQuery: '',
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  vehicleType: 'car',
  setVehicleType: (vehicleType) => set({ vehicleType }),
  radiusKm: 5.0, // Default 5 km search radius
  setRadiusKm: (radiusKm) => set({ radiusKm }),
  sortBy: 'recommendation',
  setSortBy: (sortBy) => set({ sortBy }),

  parkingLots: INITIAL_PARKING_LOTS,
  selectedLotId: null,
  selectedBayId: 'B-03',
  isDrawerOpen: false,

  // Algorithmic Selectors
  getRankedLots: () => {
    const { parkingLots, startLocation, destinationLocation, isCustomDestination, radiusKm, vehicleType, sortBy, searchQuery } = get();
    // Reference coords: if destination is set, find lots closest to destination; otherwise closest to start
    const refCoords = isCustomDestination && destinationLocation ? destinationLocation : startLocation;
    
    let ranked = rankParkingLots(parkingLots, refCoords, radiusKm, vehicleType);

    // If search query is provided, filter by name/locality/address
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      ranked = ranked.filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          l.locality.toLowerCase().includes(q) ||
          l.address.toLowerCase().includes(q)
      );
    }

    // Sort accordingly
    if (sortBy === 'distance') {
      ranked.sort((a, b) => a.distanceKm - b.distanceKm);
    } else if (sortBy === 'price') {
      ranked.sort((a, b) => a.hourlyRate - b.hourlyRate);
    } else if (sortBy === 'availability') {
      ranked.sort((a, b) => b.availableBays - a.availableBays);
    }

    return ranked;
  },

  getCurrentPricing: () => {
    const { selectedLotId, parkingLots, selectedDurationHours, vehicleType } = get();
    const lot = parkingLots.find((l) => l.id === selectedLotId) || parkingLots[0];
    return calculateDynamicPrice(
      lot.hourlyRate,
      selectedDurationHours,
      vehicleType,
      lot.totalBays,
      lot.availableBays
    );
  },

  getOptimalBayRecommendation: () => {
    const { selectedLotId, parkingLots, vehicleType } = get();
    const lot = parkingLots.find((l) => l.id === selectedLotId);
    if (!lot) return null;
    return recommendOptimalBay(lot, vehicleType);
  },

  selectedDurationHours: 2,
  userVehiclePlate: 'MH 02 AB 4521',
  setSelectedDurationHours: (selectedDurationHours) => set({ selectedDurationHours }),
  setUserVehiclePlate: (userVehiclePlate) => set({ userVehiclePlate: userVehiclePlate.toUpperCase() }),

  selectLot: (lotId) => {
    const lot = get().parkingLots.find((l) => l.id === lotId);
    if (lot) {
      // Find optimal bay recommendation for this lot
      const rec = recommendOptimalBay(lot, get().vehicleType);
      const defaultBay = rec ? rec.recommendedBay.id : (lot.bays.find((b) => b.status === 'available')?.id || 'B-03');

      set({
        selectedLotId: lotId,
        selectedBayId: defaultBay,
        isDrawerOpen: true,
        destinationLocation: lot.coordinates,
        destinationName: lot.name,
        isCustomDestination: false,
      });
    } else {
      set({
        selectedLotId: lotId,
        isDrawerOpen: true,
      });
    }
  },

  closeDrawer: () => set({ isDrawerOpen: false }),
  selectBay: (selectedBayId) => set({ selectedBayId }),

  activePass: null,
  isPassModalOpen: false,
  openPassModal: () => set({ isPassModalOpen: true }),
  closePassModal: () => set({ isPassModalOpen: false }),

  // End-to-End Booking with Dynamic Pricing and Host Synchronization
  bookCurrentSelection: () => {
    const { selectedLotId, selectedBayId, parkingLots, selectedDurationHours, userVehiclePlate, vehicleType, autoCheckIn, hostRequests } = get();
    const lot = parkingLots.find((l) => l.id === selectedLotId) || parkingLots[0];
    const bayId = selectedBayId || 'B-03';
    
    // Algorithmic dynamic pricing
    const pricing = calculateDynamicPrice(
      lot.hourlyRate,
      selectedDurationHours,
      vehicleType,
      lot.totalBays,
      lot.availableBays
    );

    const now = Date.now();
    const endTime = now + selectedDurationHours * 60 * 60 * 1000;
    const hash = `PR-${lot.id.substring(0, 3).toUpperCase()}-${bayId}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newPass: ActivePass = {
      id: `pass-${Date.now()}`,
      reservationHash: hash,
      lotId: lot.id,
      lotName: lot.name,
      levelName: lot.levelName,
      address: lot.address,
      bayId: bayId,
      vehiclePlate: userVehiclePlate || 'MH 02 AB 4521',
      vehicleCategory: vehicleType,
      startTime: now,
      endTime: endTime,
      durationHours: selectedDurationHours,
      hourlyRate: pricing.effectiveHourlyRate,
      platformFee: pricing.platformFee,
      totalPaid: pricing.totalFare,
      entryGate: lot.entryGate,
      gateInstructions: lot.securityGateNotes,
      hostName: lot.hostName,
      hostPhone: lot.hostPhone,
      status: 'active',
      savings: pricing.savingsVsStreetParking,
      discountPercent: pricing.durationDiscountPercent,
    };

    // Update parking lots (mark bay occupied)
    const updatedLots = parkingLots.map((l) => {
      if (l.id === lot.id) {
        return {
          ...l,
          availableBays: Math.max(0, l.availableBays - 1),
          bays: l.bays.map((b) => (b.id === bayId ? { ...b, status: 'occupied' as const, occupiedPlate: userVehiclePlate } : b)),
        };
      }
      return l;
    });

    // Synchronize to Host Dashboard: dispatch real request
    const newHostRequest: HostBookingRequest = {
      id: `req-${Date.now()}`,
      driverName: 'Verified Driver',
      bayId: bayId,
      tower: lot.levelName,
      vehiclePlate: userVehiclePlate || 'MH 02 AB 4521',
      vehicleModel: vehicleType === 'two-wheeler' ? 'Ather 450X EV' : 'Honda City',
      timeSlot: `Today, ${new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      duration: `${selectedDurationHours} Hours`,
      payout: Math.round(pricing.totalFare * 0.85), // 85% host payout
      status: autoCheckIn ? 'accepted' : 'pending',
      receivedAt: 'Just now',
      lotId: lot.id,
    };

    set({
      activePass: newPass,
      isDrawerOpen: false,
      isPassModalOpen: true,
      parkingLots: updatedLots,
      hostRequests: [newHostRequest, ...hostRequests],
    });
  },

  extendActivePass: (additionalMinutes = 30) => {
    const { activePass } = get();
    if (!activePass) return;

    const additionalMs = additionalMinutes * 60 * 1000;
    const extraFare = Math.round((activePass.hourlyRate * additionalMinutes) / 60);

    set({
      activePass: {
        ...activePass,
        endTime: activePass.endTime + additionalMs,
        durationHours: activePass.durationHours + additionalMinutes / 60,
        totalPaid: activePass.totalPaid + extraFare,
        status: 'extended',
      },
    });
  },

  completeActivePass: () => {
    const { activePass, parkingLots } = get();
    if (!activePass) return;

    const updatedLots = parkingLots.map((l) => {
      if (l.id === activePass.lotId) {
        return {
          ...l,
          availableBays: l.availableBays + 1,
          bays: l.bays.map((b) => (b.id === activePass.bayId ? { ...b, status: 'available' as const, occupiedPlate: undefined } : b)),
        };
      }
      return l;
    });

    set({
      activePass: null,
      isPassModalOpen: false,
      parkingLots: updatedLots,
    });
  },

  // Real Turn-by-Turn GPS Navigation
  mapboxToken: typeof window !== 'undefined' ? localStorage.getItem('park_ryze_mapbox_token') || process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '' : '',
  setMapboxToken: (mapboxToken) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('park_ryze_mapbox_token', mapboxToken);
    }
    set({ mapboxToken });
  },

  isNavigating: false,
  isCalculatingRoute: false,
  activeRoute: null,
  currentStepIndex: 0,

  startNavigationTo: async (destinationCoords, destinationName, gateName) => {
    const { startLocation, userLocation, mapboxToken, startLocationName } = get();
    const origin = startLocation || userLocation;
    const originName = startLocationName || 'Current Location';
    set({
      isCalculatingRoute: true,
      isPassModalOpen: false,
      isDrawerOpen: false,
      destinationLocation: destinationCoords,
      destinationName: destinationName,
    });

    try {
      const route = await fetchTurnByTurnRoute(
        origin,
        destinationCoords,
        destinationName,
        gateName,
        mapboxToken,
        originName
      );

      set({
        isNavigating: true,
        activeRoute: route,
        currentStepIndex: 0,
        isCalculatingRoute: false,
        simulation: route ? createInitialSimulation(route) : null,
      });
    } catch (err) {
      console.error('Failed to calculate route:', err);
      set({ isCalculatingRoute: false });
    }
  },

  stopNavigation: () => {
    set({ isNavigating: false, activeRoute: null, currentStepIndex: 0, simulation: null });
  },

  nextStep: () => {
    const { activeRoute, currentStepIndex } = get();
    if (!activeRoute) return;
    if (currentStepIndex < activeRoute.steps.length - 1) {
      set({ currentStepIndex: currentStepIndex + 1 });
    }
  },

  prevStep: () => {
    const { currentStepIndex } = get();
    if (currentStepIndex > 0) {
      set({ currentStepIndex: currentStepIndex - 1 });
    }
  },

  // Driving Simulation Engine
  simulation: null,

  startSimulation: () => {
    const { activeRoute, simulation } = get();
    if (!activeRoute) return;
    const sim = simulation || createInitialSimulation(activeRoute);
    set({
      simulation: {
        ...sim,
        isSimulating: true,
        isPaused: false,
      },
    });
  },

  pauseSimulation: () => {
    const { simulation } = get();
    if (!simulation) return;
    set({
      simulation: {
        ...simulation,
        isPaused: true,
        isSimulating: false,
      },
    });
  },

  resumeSimulation: () => {
    const { simulation } = get();
    if (!simulation) return;
    set({
      simulation: {
        ...simulation,
        isPaused: false,
        isSimulating: true,
      },
    });
  },

  stopSimulation: () => {
    const { activeRoute } = get();
    if (!activeRoute) return;
    set({ simulation: createInitialSimulation(activeRoute) });
  },

  setSimulationSpeed: (speed) => {
    const { simulation } = get();
    if (!simulation) return;
    set({
      simulation: {
        ...simulation,
        speedMultiplier: speed,
      },
    });
  },

  stepSimulation: () => {
    const { simulation, activeRoute } = get();
    if (!simulation || !activeRoute) return;
    const nextSim = advanceSimulationStep(simulation, activeRoute);
    set({
      simulation: nextSim,
      currentStepIndex: nextSim.currentStepIndex,
    });
  },

  // Host Dashboard
  hostRequests: INITIAL_HOST_REQUESTS,
  autoCheckIn: true,
  acceptHostRequest: (id) => {
    set((state) => ({
      hostRequests: state.hostRequests.map((r) =>
        r.id === id ? { ...r, status: 'accepted' as const } : r
      ),
    }));
  },
  declineHostRequest: (id) => {
    const req = get().hostRequests.find((r) => r.id === id);
    // Free up bay if declined
    if (req && req.lotId) {
      set((state) => ({
        parkingLots: state.parkingLots.map((l) => {
          if (l.id === req.lotId) {
            return {
              ...l,
              availableBays: l.availableBays + 1,
              bays: l.bays.map((b) => (b.id === req.bayId ? { ...b, status: 'available' as const } : b)),
            };
          }
          return l;
        }),
      }));
    }
    set((state) => ({
      hostRequests: state.hostRequests.map((r) =>
        r.id === id ? { ...r, status: 'declined' as const } : r
      ),
    }));
  },
  toggleAutoCheckIn: () => set((state) => ({ autoCheckIn: !state.autoCheckIn })),
  
  addNewHostListing: (listing) => {
    const newLotId = `host-lot-${Date.now()}`;
    const baseCoords: [number, number] = [
      19.1031 + (Math.random() - 0.5) * 0.02,
      72.8372 + (Math.random() - 0.5) * 0.02,
    ];

    const newLot: ParkingLot = {
      id: newLotId,
      name: `${listing.societyName} — ${listing.tower}`,
      subTitle: `Dedicated Host Bay ${listing.bayNumber}`,
      type: 'residential',
      address: `${listing.tower}, ${listing.societyName}, Mumbai`,
      locality: listing.societyName,
      coordinates: baseCoords,
      hourlyRate: listing.hourlyRate,
      totalBays: 4,
      availableBays: 3,
      clearance: '2.4m Clearance',
      cctv: true,
      verifiedSociety: true,
      securityGateNotes: 'Resident hosted bay. Direct gate security to verify Park Ryze reservation QR pass.',
      entryGate: 'Main Security Boom Barrier',
      hostName: 'Verified Resident Host',
      hostPhone: '+91 98200 11223',
      levelName: 'Stilt Level 0',
      supportedVehicles: ['car', 'two-wheeler'],
      bays: [
        { id: listing.bayNumber, row: 'A', number: 1, status: 'available', vehicleSize: 'sedan' },
        { id: 'A-02', row: 'A', number: 2, status: 'available', vehicleSize: 'suv' },
        { id: 'B-01', row: 'B', number: 1, status: 'available', vehicleSize: 'compact' },
        { id: 'B-02', row: 'B', number: 2, status: 'occupied', vehicleSize: 'sedan', occupiedPlate: 'MH 02 ER 9901' },
      ],
    };

    set((state) => ({
      parkingLots: [newLot, ...state.parkingLots],
    }));
  },
}));
