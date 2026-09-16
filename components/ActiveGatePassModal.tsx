'use client';

import React, { useState, useEffect } from 'react';
import { useParkingStore } from '@/lib/store';
import { QRCodeSVG } from 'qrcode.react';
import {
  X,
  ShieldCheck,
  Navigation,
  PhoneCall,
  Clock,
  Car,
  MapPin,
  Check,
  ExternalLink,
  AlertCircle,
  Share2
} from 'lucide-react';

export default function ActiveGatePassModal() {
  const isPassModalOpen = useParkingStore((s) => s.isPassModalOpen);
  const closePassModal = useParkingStore((s) => s.closePassModal);
  const activePass = useParkingStore((s) => s.activePass);
  const parkingLots = useParkingStore((s) => s.parkingLots);
  const extendActivePass = useParkingStore((s) => s.extendActivePass);
  const completeActivePass = useParkingStore((s) => s.completeActivePass);
  const startNavigationTo = useParkingStore((s) => s.startNavigationTo);

  const [timeRemaining, setTimeRemaining] = useState<string>('00:00:00');
  const [progressPercent, setProgressPercent] = useState<number>(100);
  const [showDirections, setShowDirections] = useState<boolean>(false);
  const [extendedFeedback, setExtendedFeedback] = useState<boolean>(false);

  // Live countdown clock ticking every 1 second
  useEffect(() => {
    if (!activePass) return;

    const updateTimer = () => {
      const now = Date.now();
      const diffMs = Math.max(0, activePass.endTime - now);
      const totalDurationMs = Math.max(1, activePass.endTime - activePass.startTime);

      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

      const formatted = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
      setTimeRemaining(formatted);

      const percent = Math.min(100, Math.max(0, (diffMs / totalDurationMs) * 100));
      setProgressPercent(percent);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [activePass]);

  if (!isPassModalOpen || !activePass) return null;

  const handleExtend = () => {
    extendActivePass(30);
    setExtendedFeedback(true);
    setTimeout(() => setExtendedFeedback(false), 2500);
  };

  // QR Code payload contains verified JSON string for gate scanners
  const qrPayload = JSON.stringify({
    passId: activePass.id,
    hash: activePass.reservationHash,
    bay: activePass.bayId,
    plate: activePass.vehiclePlate,
    validUntil: new Date(activePass.endTime).toISOString(),
    lot: activePass.lotName,
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={closePassModal}
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
      />

      {/* Apple Wallet / Boarding Pass Ticket */}
      <div className="relative w-full max-w-[440px] z-10 animate-in zoom-in-95 duration-200">
        <div className="anti-fraud-border bg-[#121620]/95 backdrop-blur-2xl rounded-2xl p-5 md:p-7 flex flex-col gap-5 shadow-[0_0_40px_rgba(16,185,129,0.15)] border border-white/10 text-on-surface">
          
          {/* Header */}
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-mono font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>PARK RYZE AUTHORIZED PASS</span>
              </div>
              <h1 className="font-heading text-xl md:text-2xl font-bold text-white tracking-tight mt-0.5">
                {activePass.lotName}
              </h1>
              <p className="text-xs text-on-surface-variant font-sans">
                {activePass.levelName} • {activePass.entryGate}
              </p>
            </div>

            {/* Live Indicator Badge */}
            <div className="bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
              </span>
              <span className="font-mono text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                ACTIVE PASS
              </span>
            </div>
          </div>

          {/* High-Contrast QR Code Box with Laser Scan Line */}
          <div className="bg-[#0a0e16] rounded-xl p-5 flex flex-col items-center justify-center border border-white/10 relative overflow-hidden shadow-inner">
            <div className="relative w-44 h-44 bg-white p-2.5 rounded-lg flex items-center justify-center shadow-lg">
              <QRCodeSVG
                value={qrPayload}
                size={156}
                level="H"
                includeMargin={false}
                fgColor="#0f131c"
                bgColor="#ffffff"
              />
              {/* Laser Scan Line */}
              <div className="qr-scan-line pointer-events-none" />
            </div>

            <div className="flex items-center gap-2 mt-3 font-mono text-xs text-on-surface-variant">
              <span className="text-emerald-400 font-bold">{activePass.reservationHash}</span>
              <span className="opacity-30">•</span>
              <span className="text-[11px] uppercase tracking-widest text-slate-400">Scan at Gate Barrier</span>
            </div>
          </div>

          {/* Dynamic Countdown Clock */}
          <div className="text-center bg-[#151a25] rounded-xl p-3.5 border border-[#2B313E]">
            <div className="font-mono text-3xl md:text-4xl font-black text-white tracking-wider tabular-nums">
              {timeRemaining}
            </div>
            <div className="flex items-center justify-center gap-1.5 text-xs font-mono text-emerald-400/90 uppercase tracking-wider mt-1">
              <Clock className="w-3.5 h-3.5" />
              <span>Remaining Parking Time</span>
            </div>

            {/* Subtle Progress Bar */}
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2.5 overflow-hidden">
              <div
                className="bg-emerald-400 h-full transition-all duration-1000 ease-linear rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* 2x2 Bento Details Grid */}
          <div className="grid grid-cols-2 gap-2.5 font-sans">
            <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col">
              <span className="font-mono text-[10px] text-on-surface-variant uppercase tracking-wider">
                Assigned Bay
              </span>
              <span className="font-mono text-xl font-bold text-emerald-400 mt-0.5">
                {activePass.bayId}
              </span>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col">
              <span className="font-mono text-[10px] text-on-surface-variant uppercase tracking-wider">
                Vehicle Tag
              </span>
              <span className="font-mono text-sm font-bold text-white mt-1 uppercase">
                {activePass.vehiclePlate}
              </span>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col">
              <span className="font-mono text-[10px] text-on-surface-variant uppercase tracking-wider">
                Access Gate
              </span>
              <span className="text-xs font-semibold text-white mt-1 truncate">
                {activePass.entryGate}
              </span>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col">
              <span className="font-mono text-[10px] text-on-surface-variant uppercase tracking-wider">
                Total Paid
              </span>
              <span className="font-mono text-sm font-bold text-white mt-1">
                ₹{activePass.totalPaid} (inc. fee)
              </span>
            </div>
          </div>

          {/* Turn-by-Turn Directions Dropdown Accordion */}
          {showDirections && (
            <div className="bg-[#0b0f17] border border-emerald-500/30 rounded-xl p-3.5 space-y-2 text-xs animate-in fade-in duration-200">
              <div className="font-mono text-emerald-400 font-bold flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5" />
                <span>Gate Turn-by-Turn Navigation</span>
              </div>
              <ol className="list-decimal list-inside text-slate-300 space-y-1.5 font-sans pl-1">
                <li>Drive to <strong className="text-white">{activePass.address}</strong>.</li>
                <li>Approach <strong className="text-white">{activePass.entryGate}</strong>.</li>
                <li>Hold this phone QR code facing the guard scanner or boom barrier camera.</li>
                <li>Proceed down the marked driveway to <strong className="text-emerald-400 font-mono">Bay {activePass.bayId}</strong>.</li>
              </ol>
            </div>
          )}

          {/* Extension Confirmation Toast */}
          {extendedFeedback && (
            <div className="p-2.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center justify-center gap-1.5 animate-in fade-in">
              <Check className="w-4 h-4" />
              <span>Pass extended by +30 Minutes successfully!</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 pt-1">
            {/* Live GPS Navigation Launch Button */}
            <button
              type="button"
              onClick={() => {
                const lot = parkingLots.find((l) => l.id === activePass.lotId) || parkingLots[0];
                startNavigationTo(lot.coordinates, activePass.lotName, activePass.entryGate);
              }}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-heading font-bold text-xs md:text-sm py-3 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.4)] flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
            >
              <Navigation className="w-4 h-4" />
              <span>Start Live Turn-by-Turn GPS</span>
            </button>

            {/* Turn-by-turn Text Directions Accordion Toggle */}
            <button
              type="button"
              onClick={() => setShowDirections(!showDirections)}
              className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-on-surface text-xs font-mono py-2 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>{showDirections ? 'Hide Gate Instructions' : 'View Gate Step-by-Step Instructions'}</span>
            </button>

            {/* Call Gate & Extend Time */}
            <div className="grid grid-cols-2 gap-2">
              <a
                href={`tel:${activePass.hostPhone}`}
                className="bg-white/5 hover:bg-white/10 border border-white/15 text-white font-heading text-xs font-medium py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
              >
                <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
                <span>Call Host / Gate</span>
              </a>

              <button
                type="button"
                onClick={handleExtend}
                className="bg-white/5 hover:bg-white/10 border border-white/15 text-white font-heading text-xs font-medium py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
              >
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <span>Extend +30 Mins</span>
              </button>
            </div>

            {/* Complete / Check Out Session Button */}
            <button
              type="button"
              onClick={completeActivePass}
              className="mt-1 text-slate-400 hover:text-red-400 text-xs font-mono transition-colors text-center py-1"
            >
              End Parking Session & Release Bay
            </button>
          </div>

        </div>

        {/* Floating Close Pill */}
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={closePassModal}
            className="text-on-surface-variant hover:text-white transition-colors px-4 py-1.5 rounded-full bg-surface-container-high/80 border border-white/10 flex items-center gap-1.5 text-xs font-mono shadow-lg"
          >
            <X className="w-3.5 h-3.5" />
            <span>Minimize Ticket</span>
          </button>
        </div>
      </div>
    </div>
  );
}
