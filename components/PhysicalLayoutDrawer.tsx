'use client';

import React from 'react';
import { useParkingStore } from '@/lib/store';
import {
  X,
  ShieldCheck,
  Video,
  ArrowRight,
  CheckCircle,
  Lock,
  Car,
  Bike,
  Clock,
  Info,
  ChevronRight,
  Maximize2,
  Navigation,
  Sparkles,
  TrendingUp,
  Percent,
  Zap
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

  // Algorithmic dynamic pricing & smart bay recommendation
  const pricing = getCurrentPricing();
  const bayRecommendation = getOptimalBayRecommendation();

  return (
    <div className="fixed inset-0 z-50 flex justify-end pointer-events-none">
      {/* Backdrop */}
      <div
        onClick={closeDrawer}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm pointer-events-auto transition-opacity"
      />

      {/* Slide-over Drawer / Bottom Sheet */}
      <aside className="pointer-events-auto relative w-full md:max-w-2xl lg:max-w-3xl h-[92vh] md:h-full mt-auto md:mt-0 bg-[#0f131c] border-t md:border-t-0 md:border-l border-[#2B313E] shadow-2xl flex flex-col z-10 overflow-hidden rounded-t-3xl md:rounded-none animate-in slide-in-from-bottom md:slide-in-from-right duration-300">
        
        {/* Mobile Pull Handle */}
        <div className="md:hidden w-12 h-1.5 bg-slate-700 rounded-full mx-auto my-2.5" />

        {/* Drawer Header (Stitch CAD Header Spec) */}
        <div className="p-4 md:p-6 bg-[#161a23] border-b border-[#2B313E] shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-emerald-400 font-semibold uppercase tracking-wider">
                  2D Architectural CAD Blueprint
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span className="font-mono text-[11px] text-on-surface-variant">Live Sensor Grid</span>
              </div>
              <h2 className="font-heading text-xl md:text-2xl font-bold text-white tracking-tight mt-0.5">
                {lot.name}
              </h2>
              <p className="font-heading text-xs md:text-sm text-on-surface-variant mt-0.5">
                {lot.levelName} • {lot.locality} • Gate: {lot.entryGate}
              </p>
            </div>

            <button
              type="button"
              onClick={closeDrawer}
              className="p-2 rounded-xl bg-surface-container-high border border-white/10 text-on-surface-variant hover:text-white hover:border-white/20 transition-all"
              title="Close Blueprint"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Verification & Facility Chips */}
          <div className="flex flex-wrap items-center gap-2 mt-3.5">
            {lot.verifiedSociety && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-[11px] font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" /> Verified Society Host
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface-container-high border border-white/10 text-on-surface-variant font-mono text-[11px]">
              <Maximize2 className="w-3 h-3 text-emerald-400" /> {lot.clearance}
            </span>
            {lot.cctv && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface-container-high border border-white/10 text-on-surface-variant font-mono text-[11px]">
                <Video className="w-3 h-3 text-sky-400" /> 24/7 CCTV
              </span>
            )}
            
            {/* Dynamic Demand Indicator */}
            {pricing.surgeStatus === 'high-demand' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-400/40 font-mono text-[10px] font-bold">
                <TrendingUp className="w-3 h-3" /> High Demand Zone
              </span>
            )}
            {pricing.surgeStatus === 'saver' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 font-mono text-[10px] font-bold">
                <Percent className="w-3 h-3" /> Off-Peak Saver Rate
              </span>
            )}
          </div>

          {/* AI Recommended Bay Banner */}
          {bayRecommendation && (
            <div className="mt-3 p-2.5 rounded-xl bg-gradient-to-r from-emerald-500/15 to-transparent border border-emerald-500/30 flex items-start gap-2.5 text-xs">
              <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] text-emerald-400 font-bold uppercase tracking-wider">
                    AI Recommended Spot: Bay {bayRecommendation.recommendedBay.id}
                  </span>
                  <button
                    type="button"
                    onClick={() => selectBay(bayRecommendation.recommendedBay.id)}
                    className="text-[10px] font-mono underline text-white hover:text-emerald-300 font-bold"
                  >
                    Select this Bay
                  </button>
                </div>
                <p className="text-slate-300 text-[11px] mt-0.5 leading-relaxed font-sans">
                  {bayRecommendation.reason}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* CAD Schematic Floor Canvas */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#0a0e16] space-y-6">
          <div className="flex items-center justify-between text-xs font-mono text-on-surface-variant">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-sm bg-emerald-400"></span> Available
              <span className="w-2 h-2 rounded-sm bg-[#1e232d] border border-white/20 ml-2"></span> Occupied
              <span className="w-2 h-2 rounded-sm bg-emerald-500 ring-2 ring-emerald-400 ml-2"></span> Selected
            </span>
            <span className="text-[11px] text-slate-500 hidden sm:inline">Tap any bay to select</span>
          </div>

          {/* CAD Physical Blueprint Container */}
          <div className="relative border-2 border-[#2B313E] rounded-xl p-4 md:p-6 bg-[#11141c] shadow-2xl overflow-x-auto">
            {/* Architectural Grid Header / Compass */}
            <div className="flex justify-between items-center pb-3 mb-4 border-b border-[#232834] font-mono text-[11px] text-slate-500">
              <span>SECTION A-B // {lot.levelName.toUpperCase()}</span>
              <span className="tracking-widest">▲ NORTH GULMOHAR RD</span>
            </div>

            {/* TOP ROW: BAYS A-01 TO A-08 */}
            <div className="mb-4">
              <div className="font-mono text-[10px] text-slate-500 mb-1.5 uppercase tracking-wider flex justify-between">
                <span>ROW A — COVERED STILT BAYS</span>
                <span>2.4M CLEARANCE</span>
              </div>
              <div className="grid grid-cols-8 gap-2 min-w-[540px]">
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
                      className={`relative h-28 rounded-md flex flex-col items-center justify-between p-2 font-mono text-xs transition-all ${
                        isSelected
                          ? 'bg-emerald-500 text-slate-950 font-bold ring-2 ring-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.7)] scale-[1.03] z-10'
                          : isAvail
                          ? isAiRecommended
                            ? 'bg-[#18232c] border-2 border-emerald-400 text-emerald-300 hover:bg-[#1f2d3a] cursor-pointer'
                            : 'bg-[#181d27] border-2 border-dashed border-emerald-500/80 text-emerald-400 hover:bg-[#1f2633] hover:border-emerald-400 cursor-pointer'
                          : 'occupied-hatch border border-[#2B313E] text-slate-600 cursor-not-allowed opacity-75'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-[9px] uppercase font-semibold">
                          {bay.vehicleSize.slice(0, 3)}
                        </span>
                        {isAiRecommended && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" title="AI Optimal Bay" />
                        )}
                      </div>

                      {isSelected ? (
                        <CheckCircle className="w-5 h-5 text-slate-950 my-auto" />
                      ) : isOccupied ? (
                        <div className="flex flex-col items-center my-auto opacity-40">
                          <Car className="w-4 h-4 text-slate-400" />
                          <span className="text-[8px] text-slate-400 font-mono mt-0.5">OCCUPIED</span>
                        </div>
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse my-auto" />
                      )}

                      <span className="font-bold tracking-tight text-[11px]">
                        {bay.id}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* CENTRAL DRIVEWAY & STRUCTURAL PILLARS */}
            <div className="relative my-6 py-4 bg-[#161a24] border-y-2 border-yellow-500/70 border-dashed rounded min-w-[540px]">
              <div className="flex items-center justify-between px-8 text-yellow-500/80 font-mono text-xs font-bold tracking-wider">
                <div className="flex items-center gap-2">
                  <span>{lot.entryGate.toUpperCase()}</span>
                  <ArrowRight className="w-4 h-4 animate-pulse" />
                </div>

                <div className="flex items-center gap-3 text-slate-400 text-[11px] font-sans">
                  <span>CENTRAL DRIVEWAY // 6.0M TARMAC LANE</span>
                </div>

                <div className="flex items-center gap-2">
                  <ArrowRight className="w-4 h-4 animate-pulse" />
                  <span>RAMP EXIT</span>
                </div>
              </div>

              {/* Concrete Structural Pillars */}
              <div className="absolute -top-3 left-1/4 w-6 h-6 cross-hatch border border-emerald-900 rounded-sm shadow-md" title="Concrete Pillar P-1" />
              <div className="absolute -top-3 right-1/4 w-6 h-6 cross-hatch border border-emerald-900 rounded-sm shadow-md" title="Concrete Pillar P-2" />
              <div className="absolute -bottom-3 left-1/4 w-6 h-6 cross-hatch border border-emerald-900 rounded-sm shadow-md" title="Concrete Pillar P-3" />
              <div className="absolute -bottom-3 right-1/4 w-6 h-6 cross-hatch border border-emerald-900 rounded-sm shadow-md" title="Concrete Pillar P-4" />
            </div>

            {/* BOTTOM ROW: BAYS B-01 TO B-08 */}
            <div>
              <div className="font-mono text-[10px] text-slate-500 mb-1.5 uppercase tracking-wider flex justify-between">
                <span>ROW B — DRIVEWAY-FLANKED BAYS</span>
                <span>WIDE TURNING RADIUS</span>
              </div>
              <div className="grid grid-cols-8 gap-2 min-w-[540px]">
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
                      className={`relative h-28 rounded-md flex flex-col items-center justify-between p-2 font-mono text-xs transition-all ${
                        isSelected
                          ? 'bg-emerald-500 text-slate-950 font-bold ring-2 ring-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.7)] scale-[1.03] z-10'
                          : isAvail
                          ? isAiRecommended
                            ? 'bg-[#18232c] border-2 border-emerald-400 text-emerald-300 hover:bg-[#1f2d3a] cursor-pointer'
                            : 'bg-[#181d27] border-2 border-dashed border-emerald-500/80 text-emerald-400 hover:bg-[#1f2633] hover:border-emerald-400 cursor-pointer'
                          : 'occupied-hatch border border-[#2B313E] text-slate-600 cursor-not-allowed opacity-75'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-[9px] uppercase font-semibold">
                          {bay.vehicleSize.slice(0, 3)}
                        </span>
                        {isAiRecommended && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" title="AI Optimal Bay" />
                        )}
                      </div>

                      {isSelected ? (
                        <CheckCircle className="w-5 h-5 text-slate-950 my-auto" />
                      ) : isOccupied ? (
                        <div className="flex flex-col items-center my-auto opacity-40">
                          <Car className="w-4 h-4 text-slate-400" />
                          <span className="text-[8px] text-slate-400 font-mono mt-0.5">OCCUPIED</span>
                        </div>
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse my-auto" />
                      )}

                      <span className="font-bold tracking-tight text-[11px]">
                        {bay.id}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Checkout / Fare Calculation Panel */}
        <div className="p-4 md:p-6 bg-[#141822] border-t border-[#2B313E] shrink-0 shadow-[0_-12px_24px_rgba(0,0,0,0.6)]">
          {/* Selected Bay Overview & Vehicle Plate Input */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading text-lg md:text-xl font-bold text-white">
                  Selected Bay {selectedBay.id}
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono text-xs font-semibold uppercase">
                  Available
                </span>
              </div>
              <p className="text-xs text-on-surface-variant font-sans">
                {selectedBay.vehicleSize.toUpperCase()} Dimensions • 24/7 CCTV Monitored
              </p>
            </div>

            {/* Indian Vehicle Plate Tag */}
            <div className="flex items-center gap-2 bg-[#0c1017] border border-[#2B313E] px-3 py-1.5 rounded-lg w-full sm:w-auto">
              {vehicleType === 'two-wheeler' ? (
                <Bike className="w-4 h-4 text-emerald-400" />
              ) : (
                <Car className="w-4 h-4 text-emerald-400" />
              )}
              <input
                type="text"
                value={userVehiclePlate}
                onChange={(e) => setUserVehiclePlate(e.target.value)}
                placeholder="MH 02 AB 4521"
                className="bg-transparent font-mono text-xs md:text-sm text-white focus:outline-none uppercase tracking-wider w-28"
              />
            </div>
          </div>

          {/* Duration Selector Tabs with Tier Discounts */}
          <div className="mb-4">
            <div className="font-mono text-[11px] text-on-surface-variant uppercase tracking-wider mb-2 flex justify-between">
              <span>Booking Duration & Tier Discounts</span>
              <span className="text-emerald-400 font-semibold">
                ₹{pricing.effectiveHourlyRate}/hr ({vehicleType === 'two-wheeler' ? 'Two-Wheeler Rate' : 'Standard Rate'})
              </span>
            </div>
            <div className="grid grid-cols-4 gap-1.5 bg-[#0a0e16] p-1 rounded-xl border border-[#2B313E]">
              {DURATION_OPTIONS.map((opt) => (
                <button
                  key={opt.hours}
                  type="button"
                  onClick={() => setSelectedDurationHours(opt.hours)}
                  className={`py-2 px-1 rounded-lg font-mono text-xs font-medium transition-all flex flex-col items-center justify-center ${
                    selectedDurationHours === opt.hours
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold shadow-sm'
                      : 'text-on-surface-variant hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span>{opt.label}</span>
                  {opt.discount && (
                    <span className="text-[9px] text-emerald-300 font-bold mt-0.5">
                      {opt.discount}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Algorithmic Transparent Fare Breakdown */}
          <div className="bg-[#0b0f17] border border-[#2B313E] rounded-xl p-3 mb-4 space-y-1.5 text-xs font-mono">
            <div className="flex justify-between text-on-surface-variant">
              <span>
                Parking Fare ({selectedDurationHours} hrs × ₹{pricing.effectiveHourlyRate})
              </span>
              <span className="text-white">₹{pricing.effectiveHourlyRate * selectedDurationHours}</span>
            </div>

            {pricing.durationDiscountAmount > 0 && (
              <div className="flex justify-between text-emerald-400">
                <span>Duration Tier Discount ({pricing.durationDiscountPercent}%)</span>
                <span>-₹{pricing.durationDiscountAmount}</span>
              </div>
            )}

            <div className="flex justify-between text-on-surface-variant">
              <span>Platform & RFID Sync Fee</span>
              <span className="text-white">₹{pricing.platformFee}</span>
            </div>

            <div className="pt-2 border-t border-[#232834] flex justify-between items-baseline">
              <div>
                <span className="text-white font-bold text-sm">Total Amount</span>
                {pricing.savingsVsStreetParking > 0 && (
                  <span className="text-[10px] text-emerald-400 block">
                    Save ₹{pricing.savingsVsStreetParking} vs street towing risk
                  </span>
                )}
              </div>
              <span className="text-emerald-400 font-bold text-lg">₹{pricing.totalFare}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <button
              type="button"
              onClick={() => startNavigationTo(lot.coordinates, lot.name, lot.entryGate)}
              className="sm:col-span-1 bg-white/5 hover:bg-white/10 border border-white/15 text-white font-heading text-xs font-semibold py-3.5 rounded-xl flex items-center justify-center gap-1.5 transition-colors active:scale-95"
            >
              <Navigation className="w-3.5 h-3.5 text-emerald-400" />
              <span>Preview Route</span>
            </button>

            <button
              type="button"
              onClick={bookCurrentSelection}
              className="sm:col-span-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-heading font-bold text-xs md:text-sm py-3.5 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.4)] flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
            >
              <span>Confirm Bay {selectedBay.id} for ₹{pricing.totalFare}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </aside>
    </div>
  );
}
