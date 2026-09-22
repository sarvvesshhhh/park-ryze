'use client';

import React, { useState, useEffect } from 'react';
import { useParkingStore } from '@/lib/store';
import {
  Navigation,
  ArrowUp,
  ArrowUpRight,
  ArrowUpLeft,
  CornerUpRight,
  CornerUpLeft,
  MapPin,
  Clock,
  Gauge,
  X,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  ChevronLeft,
  Ticket,
  ShieldCheck,
  RotateCw,
  LocateFixed,
  Play,
  Pause,
  FastForward,
  Car
} from 'lucide-react';

export default function NavigationOverlay() {
  const isNavigating = useParkingStore((s) => s.isNavigating);
  const activeRoute = useParkingStore((s) => s.activeRoute);
  const currentStepIndex = useParkingStore((s) => s.currentStepIndex);
  const stopNavigation = useParkingStore((s) => s.stopNavigation);
  const nextStep = useParkingStore((s) => s.nextStep);
  const prevStep = useParkingStore((s) => s.prevStep);
  const openPassModal = useParkingStore((s) => s.openPassModal);
  const activePass = useParkingStore((s) => s.activePass);
  const isCustomStartPoint = useParkingStore((s) => s.isCustomStartPoint);
  const startLocationName = useParkingStore((s) => s.startLocationName);
  const isCalculatingRoute = useParkingStore((s) => s.isCalculatingRoute);
  const recalculateCurrentRoute = useParkingStore((s) => s.recalculateCurrentRoute);

  // Driving Simulation Engine
  const simulation = useParkingStore((s) => s.simulation);
  const startSimulation = useParkingStore((s) => s.startSimulation);
  const pauseSimulation = useParkingStore((s) => s.pauseSimulation);
  const resumeSimulation = useParkingStore((s) => s.resumeSimulation);
  const stopSimulation = useParkingStore((s) => s.stopSimulation);
  const setSimulationSpeed = useParkingStore((s) => s.setSimulationSpeed);
  const stepSimulation = useParkingStore((s) => s.stepSimulation);

  const [isExpanded, setIsExpanded] = useState(false);

  // Simulation timer loop
  useEffect(() => {
    if (!simulation || !simulation.isSimulating || simulation.isPaused) return;

    const intervalMs = Math.max(150, Math.floor(700 / simulation.speedMultiplier));
    const timer = setInterval(() => {
      stepSimulation();
    }, intervalMs);

    return () => clearInterval(timer);
  }, [simulation?.isSimulating, simulation?.isPaused, simulation?.speedMultiplier, stepSimulation]);

  if (!isNavigating || !activeRoute) return null;

  const currentStep = activeRoute.steps[currentStepIndex] || activeRoute.steps[0];
  const nextStepItem = activeRoute.steps[currentStepIndex + 1];

  const renderManeuverIcon = (type: string, modifier?: string) => {
    const mod = modifier?.toLowerCase() || '';
    if (mod.includes('left')) return <CornerUpLeft className="w-6 h-6 text-emerald-400" />;
    if (mod.includes('right')) return <CornerUpRight className="w-6 h-6 text-emerald-400" />;
    if (type === 'arrive') return <MapPin className="w-6 h-6 text-emerald-400 animate-bounce" />;
    return <ArrowUp className="w-6 h-6 text-emerald-400" />;
  };

  const isSimActive = simulation && simulation.isSimulating;
  const isSimPaused = simulation && simulation.isPaused;
  const simProgress = simulation ? simulation.progressPercent : 0;
  const displayDistance = simulation?.isSimulating ? simulation.remainingDistanceKm : activeRoute.distanceKm;
  const displayDuration = simulation?.isSimulating ? simulation.remainingDurationMins : activeRoute.durationMins;

  return (
    <div className="absolute inset-x-0 top-16 md:top-20 z-40 flex flex-col items-center pointer-events-none px-4">
      {/* Primary Tactical Navigation Banner */}
      <div className="pointer-events-auto w-full max-w-xl bg-[#0d111a]/95 backdrop-blur-2xl border border-emerald-500/40 rounded-2xl shadow-[0_10px_35px_rgba(0,0,0,0.8)] overflow-hidden transition-all duration-300">
        
        {/* Top Header Bar with Live Origin & Route Details */}
        <div className="bg-[#121824] px-4 py-2 border-b border-white/5 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2 truncate">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
            </span>
            <span className="text-emerald-400 font-bold uppercase tracking-wider truncate">
              {isSimActive ? '⚡ SIMULATING LIVE DRIVE' : isCustomStartPoint ? 'CUSTOM ORIGIN ROUTE' : 'LIVE GPS GUIDANCE'}
            </span>
            <span className="text-slate-500 hidden sm:inline">•</span>
            <span className="text-slate-300 truncate hidden sm:inline font-sans text-[11px]">
              {activeRoute.originName || startLocationName} ➔ {activeRoute.destinationName}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={recalculateCurrentRoute}
              disabled={isCalculatingRoute}
              className={`p-1 rounded-md text-slate-400 hover:text-emerald-400 transition-colors ${
                isCalculatingRoute ? 'animate-spin text-emerald-400' : ''
              }`}
              title="Recalculate Route"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>

            <span className="text-slate-400">
              {currentStepIndex + 1} / {activeRoute.steps.length}
            </span>
            <button
              type="button"
              onClick={stopNavigation}
              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Close Navigation"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Driving Simulation Playback Bar */}
        <div className="bg-[#101520] px-4 py-2 border-b border-white/5 flex items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2">
            {!isSimActive && !isSimPaused ? (
              <button
                type="button"
                onClick={startSimulation}
                className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>Simulate Drive</span>
              </button>
            ) : isSimPaused ? (
              <button
                type="button"
                onClick={resumeSimulation}
                className="px-2.5 py-1 rounded-lg bg-emerald-500 text-slate-950 font-bold flex items-center gap-1.5 transition-all"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>Resume</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={pauseSimulation}
                className="px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 font-bold flex items-center gap-1.5 transition-all"
              >
                <Pause className="w-3 h-3 fill-current" />
                <span>Pause</span>
              </button>
            )}

            {(isSimActive || isSimPaused) && (
              <button
                type="button"
                onClick={stopSimulation}
                className="px-2 py-1 rounded-lg bg-white/10 text-slate-300 hover:text-white text-[11px]"
              >
                Reset
              </button>
            )}
          </div>

          {/* Speed Multipliers & Progress */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400 hidden sm:inline">Speed:</span>
            {[1, 2, 5].map((speed) => (
              <button
                key={speed}
                type="button"
                onClick={() => setSimulationSpeed(speed as 1 | 2 | 5)}
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold border transition-colors ${
                  simulation?.speedMultiplier === speed
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400'
                    : 'bg-[#181f2c] text-slate-400 border-white/5 hover:text-white'
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>
        </div>

        {/* Progress bar across polyline coordinates */}
        {simulation && (
          <div className="w-full bg-slate-800 h-1">
            <div
              className="bg-emerald-400 h-full transition-all duration-300 ease-out"
              style={{ width: `${simProgress}%` }}
            />
          </div>
        )}

        {/* Maneuver HUD Card */}
        <div className="p-4 md:p-5 flex items-center gap-4">
          <div className="w-13 h-13 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center shrink-0 shadow-sm">
            {renderManeuverIcon(currentStep.maneuverType, currentStep.modifier)}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-xs text-emerald-400 font-semibold uppercase">
                {currentStep.distanceMeters > 0 ? `In ${currentStep.distanceMeters}m` : 'Now'}
              </span>
            </div>
            <h3 className="font-heading text-base md:text-lg font-bold text-white tracking-tight leading-snug truncate">
              {currentStep.instruction}
            </h3>
            {nextStepItem && (
              <p className="text-xs text-on-surface-variant/80 font-sans truncate mt-0.5 flex items-center gap-1">
                <span className="font-mono text-[10px] text-slate-500">THEN:</span>
                <span>{nextStepItem.instruction}</span>
              </p>
            )}
          </div>
        </div>

        {/* Live Trip Metrics Bar */}
        <div className="grid grid-cols-3 bg-[#111622] px-4 py-2.5 border-t border-white/5 font-mono text-center divide-x divide-white/5">
          <div>
            <div className="text-[10px] text-slate-500 uppercase">Distance</div>
            <div className="text-sm font-bold text-white">{displayDistance} km</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-500 uppercase">Est. Arrival</div>
            <div className="text-sm font-bold text-emerald-400">{displayDuration} mins</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-500 uppercase">Target Gate</div>
            <div className="text-sm font-bold text-white truncate px-1">{activeRoute.gateName}</div>
          </div>
        </div>

        {/* Stepper Navigation Actions */}
        <div className="p-3 bg-[#0a0e16] border-t border-white/5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={currentStepIndex === 0}
              onClick={prevStep}
              className="p-1.5 rounded-lg bg-surface-container border border-white/10 text-on-surface-variant hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
              title="Previous Step"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              disabled={currentStepIndex >= activeRoute.steps.length - 1}
              onClick={nextStep}
              className="p-1.5 rounded-lg bg-surface-container border border-white/10 text-on-surface-variant hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
              title="Next Step"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs font-mono text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
          >
            <span>{isExpanded ? 'Hide Maneuver List' : 'All Route Steps'}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {/* Arrived & Show Gate Pass */}
          <button
            type="button"
            onClick={() => {
              stopNavigation();
              if (activePass) openPassModal();
            }}
            className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-heading text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
          >
            <Ticket className="w-3.5 h-3.5" />
            <span>Arrived at Gate</span>
          </button>
        </div>

        {/* Tactical Drag Hint */}
        <div className="bg-[#0c1017] px-4 py-1.5 border-t border-white/5 text-[10px] font-mono text-slate-400 flex items-center justify-between">
          <span>💡 Drag 🟢 Start or 🏁 Park markers on map to recalculate route dynamically</span>
          {isCustomStartPoint && (
            <span className="text-amber-400 font-semibold">Custom Origin Active</span>
          )}
        </div>

        {/* Expandable Turn-by-Turn Maneuver List */}
        {isExpanded && (
          <div className="max-h-60 overflow-y-auto p-4 bg-[#0c1017] border-t border-white/10 space-y-2 text-xs font-sans">
            <div className="font-mono text-[10px] text-emerald-400 uppercase font-bold tracking-wider mb-2">
              Full Route Maneuver List
            </div>
            {activeRoute.steps.map((step, idx) => (
              <div
                key={idx}
                onClick={() => useParkingStore.setState({ currentStepIndex: idx })}
                className={`p-2.5 rounded-xl border flex items-start gap-3 cursor-pointer transition-colors ${
                  idx === currentStepIndex
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                    : 'bg-[#111622] border-white/5 text-slate-400 hover:text-white hover:border-white/15'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {renderManeuverIcon(step.maneuverType, step.modifier)}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-white leading-tight">{step.instruction}</div>
                  <div className="font-mono text-[10px] text-slate-500 mt-0.5">
                    {step.distanceMeters > 0 ? `${step.distanceMeters}m` : 'Destination'}
                  </div>
                </div>
                {idx === currentStepIndex && (
                  <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-emerald-500 text-slate-950 font-bold">
                    ACTIVE
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
