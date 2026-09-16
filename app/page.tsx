'use client';

import React, { useEffect } from 'react';
import dynamic from 'next/dynamic';
import Navbar from '@/components/Navbar';
import SearchCapsule from '@/components/SearchCapsule';
import PhysicalLayoutDrawer from '@/components/PhysicalLayoutDrawer';
import ActiveGatePassModal from '@/components/ActiveGatePassModal';
import NavigationOverlay from '@/components/NavigationOverlay';
import { useParkingStore } from '@/lib/store';

// Dynamically import Leaflet Map component with SSR disabled
const MapDiscovery = dynamic(() => import('@/components/MapDiscovery'), {
  ssr: false,
  loading: () => (
    <div className="w-screen h-screen flex flex-col items-center justify-center bg-[#0a0e16] text-on-surface">
      <div className="relative w-12 h-12 rounded-full border-2 border-emerald-500/30 border-t-emerald-400 animate-spin" />
      <div className="font-heading text-sm font-semibold tracking-wider text-emerald-400 mt-4 uppercase">
        Initializing Tactical Vector Map...
      </div>
      <div className="font-mono text-xs text-slate-500 mt-1">
        Locating Mumbai P2P Smart Parking Clusters
      </div>
    </div>
  ),
});

export default function DiscoveryPage() {
  const detectUserLocation = useParkingStore((s) => s.detectUserLocation);
  const isNavigating = useParkingStore((s) => s.isNavigating);

  useEffect(() => {
    // Attempt browser GPS detection on initial mount
    detectUserLocation();
  }, [detectUserLocation]);

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#0a0e16]">
      {/* 1. Full-Bleed Tactical Map Layer */}
      <MapDiscovery />

      {/* 2. Persistent Top Navigation Bar */}
      <Navbar />

      {/* 3. Search Capsule (when not in full navigation mode) */}
      {!isNavigating && <SearchCapsule />}

      {/* 4. Live Turn-by-Turn Driving & Simulation HUD */}
      {isNavigating && <NavigationOverlay />}

      {/* 5. 2D Architectural CAD Parking Blueprint Drawer */}
      <PhysicalLayoutDrawer />

      {/* 6. Active Digital Gate Pass Modal (Apple Wallet Style) */}
      <ActiveGatePassModal />
    </main>
  );
}
