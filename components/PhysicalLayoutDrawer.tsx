'use client';

import React from 'react';
import { useParkingStore } from '@/lib/store';
import {
  X,
  ShieldCheck,
  Video,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Car,
  Bike,
  Clock,
  ChevronRight,
  Maximize2,
  Navigation,
  Sparkles,
  TrendingUp,
  Percent,
  Compass,
  Layers,
  MapPin,
  Check
} from 'lucide-react';

const DURATION_OPTIONS = [
  { label: '1 HR', hours: 1 },
  { label: '2 HRS', hours: 2, discount: '5% OFF' },
  { label: '4 HRS', hours: 4, discount: '15% OFF' },
  { label: 'ALL DAY', hours: 8, discount: '30% OFF' },
];

export default function PhysicalLayoutDrawer() {
  const isDrawerOpen = useParkingStore((s) => s.isDrawerOpen);
  const closeDrawer = useParkingStore((s) => s.closeDrawer);
  const selectedLotId = useParkingStore((s) => s.selectedLotId);
  const parkingLots = useParkingStore((s) => s.parkingLots);
  const selectedBayId = useParkingStore((s) => s.selectedBayId);
  const selectBay = useParkingStore((s) => s.selectBay);

  const selectedDurationHours = useParkingStore((s) => s.selectedDurationHours);
  const setSelectedDurationHours = useParkingStore((s) => s.setSelectedDurationHours);
  const userVehiclePlate = useParkingStore((s) => s.userVehiclePlate);
  const setUserVehiclePlate = useParkingStore((s) => s.setUserVehiclePlate);
  const vehicleType = useParkingStore((s) => s.vehicleType);
  const setVehicleType = useParkingStore((s) => s.setVehicleType);

  const bookCurrentSelection = useParkingStore((s) => s.bookCurrentSelection);
  const startNavigationTo = useParkingStore((s) => s.startNavigationTo);
  const getCurrentPricing = useParkingStore((s) => s.getCurrentPricing);
  const getOptimalBayRecommendation = useParkingStore((s) => s.getOptimalBayRecommendation);

  if (!isDrawerOpen || !selectedLotId) return null;

  const lot = parkingLots.find((l) => l.id === selectedLotId) || parkingLots[0];

  const rowABays = lot.bays.filter((b) => b.row === 'A');
  const rowBBays = lot.bays.filter((b) => b.row === 'B');

  const selectedBay = lot.bays.find((b) => b.id === selectedBayId) || rowBBays[2] || lot.bays[0];

  const availableBaysCount = lot.bays.filter((b) => b.status === 'available').length;
  const occupiedBaysCount = lot.bays.filter((b) => b.status === 'occupied').length;

  // Algorithmic dynamic pricing & smart bay recommendation
  const pricing = getCurrentPricing();
  const bayRecommendation = getOptimalBayRecommendation();

  return (
    <div className="fixed inset-0 z-50 bg-[#070a10] text-slate-100 flex flex-col pointer-events-auto overflow-hidden animate-in fade-in duration-200">
      
      {/* ── Top Full-Page Header Navigation Bar ── */}
      <header className="h-16 px-4 md:px-6 bg-[#0f1420] border-b border-[#2B313E] shrink-0 flex items-center justify-between gap-4 z-20 shadow-md">
        {/* Left: Back button & Facility Overview */}
        <div className="flex items-center gap-3 md:gap-4 min-w-0">
          <button
            type="button"
            onClick={closeDrawer}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white border border-white/10 transition-colors text-xs font-semibold shrink-0 active:scale-95"
            title="Return to City Map"
          >
            <ArrowLeft className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Back to Map</span>
          </button>

          <div className="h-6 w-px bg-white/10 shrink-0 hidden sm:block" />

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="font-heading text-base md:text-lg font-bold text-white tracking-tight truncate">
                {lot.name}
              </h1>
              <span className="hidden md:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-medium shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Sensor Grid
              </span>
            </div>
            <p className="font-sans text-[11px] md:text-xs text-slate-400 truncate">
              {lot.levelName} • {lot.locality} • Gate: {lot.entryGate}
            </p>
          </div>
        </div>

        {/* Right: Badges & Close Button */}
        <div className="flex items-center gap-2 shrink-0">
          {lot.verifiedSociety && (
            <span className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-[11px] font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" /> Verified Society Host
            </span>
          )}

          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-slate-300 font-mono text-[11px]">
            <Maximize2 className="w-3 h-3 text-emerald-400" /> {lot.clearance}
          </span>

          {lot.cctv && (
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-slate-300 font-mono text-[11px]">
              <Video className="w-3 h-3 text-sky-400" /> 24/7 CCTV
            </span>
          )}

          {pricing.surgeStatus === 'high-demand' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-400/40 font-mono text-[10px] font-bold">
              <TrendingUp className="w-3 h-3" /> High Demand
            </span>
          )}

          {pricing.surgeStatus === 'saver' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 font-mono text-[10px] font-bold">
              <Percent className="w-3 h-3" /> Off-Peak Saver
            </span>
          )}

          <button
            type="button"
            onClick={closeDrawer}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 transition-colors ml-1"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* ── Main Workspace: Two-Column Split Screen ── */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0 w-full">

        {/* ══ LEFT PANE: Parking Slots & CAD Blueprint Mapping ══ */}
        <div className="flex-1 flex flex-col bg-[#090d15] overflow-y-auto p-4 md:p-6 lg:p-7 space-y-4 border-b lg:border-b-0 lg:border-r border-[#2B313E]/80">
          
          {/* Blueprint Status Header & Legend */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#111622] p-3 rounded-xl border border-white/5">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                <span>2D Architectural CAD Blueprint</span>
              </span>
              <span className="text-slate-500">•</span>
              <span className="font-mono text-xs text-slate-300 font-semibold">{lot.levelName}</span>
            </div>

            {/* Live Interactive Legend */}
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-xs bg-emerald-400 shadow-xs" />
                <span>Available ({availableBaysCount})</span>
              </span>
              <span className="flex items-center gap-1.5 text-slate-500">
                <span className="w-2.5 h-2.5 rounded-xs bg-[#1e232d] border border-white/20" />
                <span>Occupied ({occupiedBaysCount})</span>
              </span>
              <span className="flex items-center gap-1.5 text-emerald-300 font-bold">
                <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500 ring-2 ring-emerald-300" />
                <span>Selected</span>
              </span>
            </div>
          </div>

          {/* AI Recommended Bay Alert Banner */}
          {bayRecommendation && (
            <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-500/15 via-[#131d27] to-transparent border border-emerald-500/40 flex items-start justify-between gap-3 text-xs">
              <div className="flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-emerald-300 font-bold uppercase tracking-wider">
                      AI Recommended Spot: Bay {bayRecommendation.recommendedBay.id}
                    </span>
                    <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[9px] font-bold uppercase">
                      Best Match
                    </span>
                  </div>
                  <p className="text-slate-300 text-xs mt-1 leading-relaxed font-sans">
                    {bayRecommendation.reason}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => selectBay(bayRecommendation.recommendedBay.id)}
                className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold transition-all shrink-0 ${
                  selectedBayId === bayRecommendation.recommendedBay.id
                    ? 'bg-emerald-500 text-slate-950 shadow-sm'
                    : 'bg-white/10 hover:bg-emerald-500 hover:text-slate-950 text-emerald-300 border border-emerald-500/30'
                }`}
              >
                {selectedBayId === bayRecommendation.recommendedBay.id ? '✓ Selected' : 'Select this Bay'}
              </button>
            </div>
          )}

          {/* CAD Physical Blueprint Container */}
          <div className="relative flex-1 border-2 border-[#2B313E] rounded-2xl p-4 md:p-6 bg-[#0f1420] shadow-2xl overflow-x-auto min-h-[460px] flex flex-col justify-between">
            
            {/* Architectural Compass & Grid Coordinates */}
            <div className="flex justify-between items-center pb-3 mb-3 border-b border-[#232834] font-mono text-[11px] text-slate-500">
              <span className="flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-emerald-400" />
                <span>ORIENTATION // NORTH GULMOHAR RD AXIS</span>
              </span>
              <span className="text-slate-400 font-semibold tracking-wider">
                ENTRY FLOW ➔ {lot.entryGate.toUpperCase()}
              </span>
            </div>

            {/* TOP ROW: BAYS A-01 TO A-08 */}
            <div className="mb-3">
              <div className="font-mono text-[11px] text-slate-400 mb-2 uppercase tracking-wider flex justify-between items-center">
                <span className="font-bold text-slate-300">ROW A — COVERED STILT BAYS</span>
                <span className="text-emerald-400 text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  2.4M HEIGHT CLEARANCE • WEATHER PROTECTED
                </span>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5 min-w-[560px]">
                {rowABays.map((bay) => {
                  const isSelected = selectedBayId === bay.id;
                  const isAvail = bay.status === 'available';
                  const isOccupied = bay.status === 'occupied';
                  const isAiRecommended = bayRecommendation?.recommendedBay.id === bay.id;

                  return (
                    <button
                      key={bay.id}
                      type="button"
                      disabled={!isAvail}
                      onClick={() => selectBay(bay.id)}
                      className={`relative h-32 rounded-xl flex flex-col items-center justify-between p-2.5 font-mono text-xs transition-all ${
                        isSelected
                          ? 'bg-emerald-500 text-slate-950 font-bold ring-4 ring-emerald-300/60 shadow-xl scale-[1.04] z-10'
                          : isAvail
                          ? isAiRecommended
                            ? 'bg-[#182531] border-2 border-emerald-400 text-emerald-300 hover:bg-[#1f3142] hover:scale-[1.02] cursor-pointer shadow-sm'
                            : 'bg-[#151b27] border-2 border-dashed border-emerald-500/80 text-emerald-400 hover:bg-[#1b2333] hover:border-emerald-400 hover:scale-[1.02] cursor-pointer shadow-xs'
                          : 'occupied-hatch border border-[#2B313E] text-slate-600 cursor-not-allowed opacity-75'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className={`text-[9px] uppercase font-bold px-1 py-0.2 rounded ${
                          isSelected ? 'bg-slate-950/20 text-slate-950' : 'bg-white/5 text-slate-400'
                        }`}>
                          {bay.vehicleSize.slice(0, 3)}
                        </span>
                        {isAiRecommended && (
                          <span className={`text-[8px] font-bold px-1 rounded ${
                            isSelected ? 'bg-slate-950 text-emerald-400' : 'bg-emerald-400 text-slate-950'
                          }`}>
                            AI
                          </span>
                        )}
                      </div>

                      {isSelected ? (
                        <div className="flex flex-col items-center my-auto">
                          <CheckCircle className="w-6 h-6 text-slate-950" />
                          <span className="text-[9px] font-bold uppercase mt-1 tracking-tight">SELECTED</span>
                        </div>
                      ) : isOccupied ? (
                        <div className="flex flex-col items-center my-auto opacity-40">
                          <Car className="w-5 h-5 text-slate-400" />
                          <span className="text-[8px] text-slate-400 font-mono mt-0.5">OCCUPIED</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center my-auto group">
                          <div className="w-3 h-3 rounded-full bg-emerald-400 shadow-sm" />
                          <span className="text-[9px] text-emerald-400/80 font-mono mt-1">Free</span>
                        </div>
                      )}

                      <span className="font-bold tracking-tight text-xs">
                        {bay.id}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* CENTRAL DRIVEWAY & STRUCTURAL PILLARS */}
            <div className="relative my-4 py-4 bg-[#141924] border-y-2 border-yellow-500/70 border-dashed rounded-xl min-w-[560px]">
              <div className="flex items-center justify-between px-8 text-yellow-500/90 font-mono text-xs font-bold tracking-wider">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-yellow-500/10 border border-yellow-500/30">
                    {lot.entryGate.toUpperCase()}
                  </span>
                  <ArrowRight className="w-4 h-4 animate-pulse" />
                </div>

                <div className="flex items-center gap-3 text-slate-300 text-xs font-mono uppercase tracking-widest font-semibold">
                  <span>CENTRAL DRIVEWAY // 6.0M TARMAC LANE</span>
                </div>

                <div className="flex items-center gap-2">
                  <ArrowRight className="w-4 h-4 animate-pulse" />
                  <span className="px-2 py-0.5 rounded bg-yellow-500/10 border border-yellow-500/30">
                    RAMP EXIT
                  </span>
                </div>
              </div>

              {/* Concrete Structural Pillars */}
              <div className="absolute -top-3 left-1/4 w-7 h-7 cross-hatch border border-emerald-900 rounded-sm shadow-md flex items-center justify-center text-[8px] text-slate-400 font-mono" title="Structural Pillar P-1">P1</div>
              <div className="absolute -top-3 right-1/4 w-7 h-7 cross-hatch border border-emerald-900 rounded-sm shadow-md flex items-center justify-center text-[8px] text-slate-400 font-mono" title="Structural Pillar P-2">P2</div>
              <div className="absolute -bottom-3 left-1/4 w-7 h-7 cross-hatch border border-emerald-900 rounded-sm shadow-md flex items-center justify-center text-[8px] text-slate-400 font-mono" title="Structural Pillar P-3">P3</div>
              <div className="absolute -bottom-3 right-1/4 w-7 h-7 cross-hatch border border-emerald-900 rounded-sm shadow-md flex items-center justify-center text-[8px] text-slate-400 font-mono" title="Structural Pillar P-4">P4</div>
            </div>

            {/* BOTTOM ROW: BAYS B-01 TO B-08 */}
            <div className="mt-1">
              <div className="font-mono text-[11px] text-slate-400 mb-2 uppercase tracking-wider flex justify-between items-center">
                <span className="font-bold text-slate-300">ROW B — DRIVEWAY-FLANKED BAYS</span>
                <span className="text-sky-400 text-[10px] bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                  WIDE TURNING CLEARANCE • DIRECT ACCESS
                </span>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5 min-w-[560px]">
                {rowBBays.map((bay) => {
                  const isSelected = selectedBayId === bay.id;
                  const isAvail = bay.status === 'available';
                  const isOccupied = bay.status === 'occupied';
                  const isAiRecommended = bayRecommendation?.recommendedBay.id === bay.id;

                  return (
                    <button
                      key={bay.id}
                      type="button"
                      disabled={!isAvail}
                      onClick={() => selectBay(bay.id)}
                      className={`relative h-32 rounded-xl flex flex-col items-center justify-between p-2.5 font-mono text-xs transition-all ${
                        isSelected
                          ? 'bg-emerald-500 text-slate-950 font-bold ring-4 ring-emerald-300/60 shadow-xl scale-[1.04] z-10'
                          : isAvail
                          ? isAiRecommended
                            ? 'bg-[#182531] border-2 border-emerald-400 text-emerald-300 hover:bg-[#1f3142] hover:scale-[1.02] cursor-pointer shadow-sm'
                            : 'bg-[#151b27] border-2 border-dashed border-emerald-500/80 text-emerald-400 hover:bg-[#1b2333] hover:border-emerald-400 hover:scale-[1.02] cursor-pointer shadow-xs'
                          : 'occupied-hatch border border-[#2B313E] text-slate-600 cursor-not-allowed opacity-75'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className={`text-[9px] uppercase font-bold px-1 py-0.2 rounded ${
                          isSelected ? 'bg-slate-950/20 text-slate-950' : 'bg-white/5 text-slate-400'
                        }`}>
                          {bay.vehicleSize.slice(0, 3)}
                        </span>
                        {isAiRecommended && (
                          <span className={`text-[8px] font-bold px-1 rounded ${
                            isSelected ? 'bg-slate-950 text-emerald-400' : 'bg-emerald-400 text-slate-950'
                          }`}>
                            AI
                          </span>
                        )}
                      </div>

                      {isSelected ? (
                        <div className="flex flex-col items-center my-auto">
                          <CheckCircle className="w-6 h-6 text-slate-950" />
                          <span className="text-[9px] font-bold uppercase mt-1 tracking-tight">SELECTED</span>
                        </div>
                      ) : isOccupied ? (
                        <div className="flex flex-col items-center my-auto opacity-40">
                          <Car className="w-5 h-5 text-slate-400" />
                          <span className="text-[8px] text-slate-400 font-mono mt-0.5">OCCUPIED</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center my-auto group">
                          <div className="w-3 h-3 rounded-full bg-emerald-400 shadow-sm" />
                          <span className="text-[9px] text-emerald-400/80 font-mono mt-1">Free</span>
                        </div>
                      )}

                      <span className="font-bold tracking-tight text-xs">
                        {bay.id}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Blueprint Footer Help Text */}
            <div className="pt-3 mt-3 border-t border-[#232834] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-[11px] font-mono text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Tap any available bay on the blueprint to update your parking spot instantly.</span>
              </span>
              <span className="text-slate-500 font-mono">
                CAD Scale 1:100 • Metric
              </span>
            </div>

          </div>
        </div>

        {/* ══ RIGHT PANE: Parking Facility Details & Dynamic Checkout Console ══ */}
        <div className="w-full lg:w-[440px] xl:w-[480px] shrink-0 bg-[#0f1420] border-t lg:border-t-0 lg:border-l border-[#2B313E] flex flex-col justify-between overflow-y-auto p-5 md:p-6 space-y-5">
          
          <div className="space-y-4">
            {/* Card 1: Selected Bay Specifications */}
            <div className="p-4 rounded-xl bg-[#141924] border border-[#2B313E] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                    Reserved Slot
                  </span>
                  <h3 className="font-heading text-xl font-bold text-white mt-0.5">
                    Selected Bay {selectedBay.id}
                  </h3>
                </div>
                <span className="px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 font-mono text-xs font-bold uppercase tracking-wider border border-emerald-500/40">
                  {selectedBay.status === 'available' ? 'Available' : 'Occupied'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5 font-mono text-xs">
                <div className="p-2 rounded-lg bg-[#0c1017] border border-white/5">
                  <span className="text-[10px] text-slate-500 block uppercase">Vehicle Fit</span>
                  <span className="text-white font-semibold">{selectedBay.vehicleSize.toUpperCase()} Dimensions</span>
                </div>
                <div className="p-2 rounded-lg bg-[#0c1017] border border-white/5">
                  <span className="text-[10px] text-slate-500 block uppercase">Clearance</span>
                  <span className="text-emerald-400 font-semibold">{lot.clearance}</span>
                </div>
              </div>

              <p className="text-xs text-slate-400 font-sans leading-relaxed">
                {selectedBay.row === 'A'
                  ? 'Covered Stilt Bay. Fully sheltered from direct sunlight and monsoon rainfall with direct elevator lobby access.'
                  : 'Driveway-Flanked Bay. Wide 6.0m apron for seamless turning and instantaneous gate exit.'}
              </p>
            </div>

            {/* Card 2: Vehicle Type & License Plate Registration */}
            <div className="p-4 rounded-xl bg-[#141924] border border-[#2B313E] space-y-3">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 uppercase tracking-wider">
                <span>Vehicle Mode & License Plate</span>
                <span className="text-emerald-400 font-bold">FastTAG RFID Auto-Sync</span>
              </div>

              {/* Mode Toggle */}
              <div className="grid grid-cols-2 gap-2 bg-[#0c1017] p-1 rounded-xl border border-white/5">
                <button
                  type="button"
                  onClick={() => setVehicleType('car')}
                  className={`flex items-center justify-center gap-2 py-2 rounded-lg font-heading text-xs font-semibold transition-all ${
                    vehicleType === 'car'
                      ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Car className="w-4 h-4" />
                  <span>Four-Wheeler</span>
                </button>
                <button
                  type="button"
                  onClick={() => setVehicleType('two-wheeler')}
                  className={`flex items-center justify-center gap-1.5 py-2 rounded-lg font-heading text-xs font-semibold transition-all ${
                    vehicleType === 'two-wheeler'
                      ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Bike className="w-4 h-4" />
                  <span>Two-Wheeler</span>
                  <span className="text-[9px] px-1 rounded bg-slate-950/30 font-mono">-60%</span>
                </button>
              </div>

              {/* Indian License Plate Display Input */}
              <div className="flex items-center gap-2 bg-[#0b0f17] border-2 border-emerald-500/40 px-3.5 py-2 rounded-xl">
                <div className="flex items-center gap-1.5 pr-2.5 border-r border-white/10 text-emerald-400">
                  <span className="text-xs font-bold font-mono">IND</span>
                </div>
                <input
                  type="text"
                  value={userVehiclePlate}
                  onChange={(e) => setUserVehiclePlate(e.target.value)}
                  placeholder="MH 02 AB 4521"
                  className="bg-transparent font-mono text-sm font-bold text-white focus:outline-none uppercase tracking-widest w-full"
                />
              </div>
            </div>

            {/* Card 3: Booking Duration & Tier Discounts */}
            <div className="p-4 rounded-xl bg-[#141924] border border-[#2B313E] space-y-3">
              <div className="font-mono text-xs text-slate-400 uppercase tracking-wider flex justify-between items-center">
                <span>Select Duration</span>
                <span className="text-emerald-400 font-bold">
                  ₹{pricing.effectiveHourlyRate}/hr rate
                </span>
              </div>

              <div className="grid grid-cols-4 gap-1.5 bg-[#0c1017] p-1 rounded-xl border border-white/5">
                {DURATION_OPTIONS.map((opt) => (
                  <button
                    key={opt.hours}
                    type="button"
                    onClick={() => setSelectedDurationHours(opt.hours)}
                    className={`py-2 px-1 rounded-lg font-mono text-xs transition-all flex flex-col items-center justify-center ${
                      selectedDurationHours === opt.hours
                        ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                        : 'text-slate-400 hover:text-white hover:bg-white/5 font-medium'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {opt.discount && (
                      <span className={`text-[9px] font-bold mt-0.5 ${
                        selectedDurationHours === opt.hours ? 'text-slate-950 font-extrabold' : 'text-emerald-400'
                      }`}>
                        {opt.discount}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Card 4: Algorithmic Pricing Breakdown */}
            <div className="p-4 rounded-xl bg-[#141924] border border-[#2B313E] space-y-2 font-mono text-xs">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider pb-1 border-b border-white/5 font-bold">
                Transparent Dynamic Fare Breakdown
              </div>

              <div className="flex justify-between text-slate-300 pt-1">
                <span>Parking Fare ({selectedDurationHours} hrs × ₹{pricing.effectiveHourlyRate})</span>
                <span className="text-white">₹{pricing.effectiveHourlyRate * selectedDurationHours}</span>
              </div>

              {pricing.durationDiscountAmount > 0 && (
                <div className="flex justify-between text-emerald-400 font-semibold">
                  <span>Duration Discount ({pricing.durationDiscountPercent}%)</span>
                  <span>-₹{pricing.durationDiscountAmount}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-400">
                <span>Platform & RFID Sync Fee</span>
                <span className="text-white">₹{pricing.platformFee}</span>
              </div>

              <div className="pt-2.5 mt-1 border-t border-[#2B313E] flex justify-between items-baseline">
                <div>
                  <span className="text-white font-bold text-sm block">Total Fare</span>
                  {pricing.savingsVsStreetParking > 0 && (
                    <span className="text-[10px] text-emerald-400 block font-normal">
                      Save ₹{pricing.savingsVsStreetParking} vs street towing risk
                    </span>
                  )}
                </div>
                <span className="text-emerald-400 font-bold text-2xl font-mono">
                  ₹{pricing.totalFare}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons Section */}
          <div className="space-y-2 pt-2">
            <button
              type="button"
              onClick={bookCurrentSelection}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-heading font-bold text-sm md:text-base py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all active:scale-[0.99] cursor-pointer"
            >
              <span>Confirm Bay {selectedBay.id} for ₹{pricing.totalFare}</span>
              <ChevronRight className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={() => startNavigationTo(lot.coordinates, lot.name, lot.entryGate)}
              className="w-full bg-white/5 hover:bg-white/10 border border-white/15 text-slate-200 hover:text-white font-heading text-xs font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors active:scale-95 cursor-pointer"
            >
              <Navigation className="w-4 h-4 text-emerald-400" />
              <span>Preview GPS Route on Map</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
