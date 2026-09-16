import { create } from 'zustand';
import { ParkingLot, ActivePass, HostBookingRequest, VehicleCategory, NavigationRoute } from './types';
import { INITIAL_PARKING_LOTS, INITIAL_HOST_REQUESTS } from './mockData';
import { fetchTurnByTurnRoute } from './routing';

interface ParkingStore {
  // Theme Mode (Stitch MCP spec: Dark / Light)
  themeMode: 'dark' | 'light';
  toggleThemeMode: () => void;

  // Navigation & Location
  userLocation: [number, number]; // [lat, lng] (Real GPS)
  startLocation: [number, number]; // [lat, lng] (Active Route Origin)
  startLocationName: string; // e.g. "My GPS Location", "NMIMS Vile Parle", "Custom Start Pin"
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

  // Search & Filter
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  vehicleType: VehicleCategory;
  setVehicleType: (type: VehicleCategory) => void;
  radiusKm: number;
  setRadiusKm: (radius: number) => void;

  // Parking lots data
  parkingLots: ParkingLot[];
  selectedLotId: string | null;
  selectedBayId: string | null;
  isDrawerOpen: boolean;
  
  // Selection & Booking controls
  selectedDurationHours: number;
  userVehiclePlate: string;
  setSelectedDurationHours: (hours: number) => void;
  setUserVehiclePlate: (plate: string) => void;
  selectLot: (lotId: string) => void;
  closeDrawer: () => void;
  selectBay: (bayId: string) => void;

  // Active Gate Pass
  activePass: ActivePass | null;
  isPassModalOpen: boolean;
  openPassModal: () => void;
  closePassModal: () => void;
  bookCurrentSelection: () => void;
  extendActivePass: (additionalMinutes?: number) => void;
  completeActivePass: () => void;

  // Real GPS Turn-by-Turn Navigation
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
  // Theme Mode: defaults to dark per Stitch spec, with localStorage persistence
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

  // Default centered at Vile Parle West, Mumbai
  userLocation: [19.1031, 72.8372],
  startLocation: [19.1031, 72.8372],
  startLocationName: 'My GPS Location',
  isCustomStartPoint: false,

  // Destination / Park Location (Defaults to Gulmohar Heights CHS)
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
    // Dynamically recalculate route if destination is active
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
    // Immediately calculate turn-by-turn road route from startLocation to this destination
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
      });
    } catch (err) {
      console.error('Recalculate route error:', err);
      set({ isCalculatingRoute: false });
    }
  },

  searchQuery: '',
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  vehicleType: 'car',
  setVehicleType: (vehicleType) => set({ vehicleType }),
  radiusKm: 1.0,
  setRadiusKm: (radiusKm) => set({ radiusKm }),

  parkingLots: INITIAL_PARKING_LOTS,
  selectedLotId: null,
  selectedBayId: 'B-03',
  isDrawerOpen: false,

  selectedDurationHours: 2,
  userVehiclePlate: 'MH 02 AB 4521',
  setSelectedDurationHours: (selectedDurationHours) => set({ selectedDurationHours }),
  setUserVehiclePlate: (userVehiclePlate) => set({ userVehiclePlate: userVehiclePlate.toUpperCase() }),

  selectLot: (lotId) => {
    const lot = get().parkingLots.find((l) => l.id === lotId);
    let defaultBay = 'B-03';
    if (lot) {
      const avail = lot.bays.find((b) => b.status === 'available');
      if (avail) defaultBay = avail.id;
      // Also update destinationLocation to this lot
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
        selectedBayId: defaultBay,
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

  bookCurrentSelection: () => {
    const { selectedLotId, selectedBayId, parkingLots, selectedDurationHours, userVehiclePlate, vehicleType } = get();
    const lot = parkingLots.find((l) => l.id === selectedLotId) || parkingLots[0];
    const bayId = selectedBayId || 'B-03';
    const hourlyRate = lot.hourlyRate;
    const duration = selectedDurationHours;
    const platformFee = 5;
    const totalPaid = hourlyRate * duration + platformFee;
    const now = Date.now();
    const endTime = now + duration * 60 * 60 * 1000;
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
      durationHours: duration,
      hourlyRate: hourlyRate,
      platformFee: platformFee,
      totalPaid: totalPaid,
      entryGate: lot.entryGate,
      gateInstructions: lot.securityGateNotes,
      hostName: lot.hostName,
      hostPhone: lot.hostPhone,
      status: 'active',
    };

    const updatedLots = parkingLots.map((l) => {
      if (l.id === lot.id) {
        return {
          ...l,
          availableBays: Math.max(0, l.availableBays - 1),
          bays: l.bays.map((b) => (b.id === bayId ? { ...b, status: 'occupied' as const } : b)),
        };
      }
      return l;
    });

    set({
      activePass: newPass,
      isDrawerOpen: false,
      isPassModalOpen: true,
      parkingLots: updatedLots,
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
          bays: l.bays.map((b) => (b.id === activePass.bayId ? { ...b, status: 'available' as const } : b)),
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

  // Real Turn-by-Turn GPS Navigation State
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
      });
    } catch (err) {
      console.error('Failed to calculate route:', err);
      set({ isCalculatingRoute: false });
    }
  },

  stopNavigation: () => {
    set({ isNavigating: false, activeRoute: null, currentStepIndex: 0 });
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
    set((state) => ({
      hostRequests: state.hostRequests.map((r) =>
        r.id === id ? { ...r, status: 'declined' as const } : r
      ),
    }));
  },
  toggleAutoCheckIn: () => set((state) => ({ autoCheckIn: !state.autoCheckIn })),
  addNewHostListing: (listing) => {
    const newLot: ParkingLot = {
      id: `host-lot-${Date.now()}`,
      name: `${listing.societyName} — ${listing.tower}`,
      subTitle: `Dedicated Bay ${listing.bayNumber}`,
      type: 'residential',
      address: `${listing.tower}, ${listing.societyName}, Mumbai`,
      locality: listing.societyName,
      coordinates: [19.106 + (Math.random() - 0.5) * 0.02, 72.835 + (Math.random() - 0.5) * 0.02],
      hourlyRate: listing.hourlyRate,
      totalBays: 1,
      availableBays: 1,
      clearance: '2.1m Clearance',
      cctv: true,
      verifiedSociety: true,
      securityGateNotes: 'Resident hosted bay. Inform security guard at main gate.',
      entryGate: 'Gate 1',
      hostName: 'Current User (Host)',
      hostPhone: '+91 98200 11223',
      levelName: 'Ground Stilt',
      supportedVehicles: ['car', 'two-wheeler'],
      bays: [
        { id: listing.bayNumber, row: 'A', number: 1, status: 'available', vehicleSize: 'sedan' }
      ]
    };
    set((state) => ({
      parkingLots: [newLot, ...state.parkingLots]
    }));
  }
}));
