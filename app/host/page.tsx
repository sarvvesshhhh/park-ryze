'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { useParkingStore } from '@/lib/store';
import {
  Wallet,
  Car,
  Clock,
  TrendingUp,
  Radio,
  Check,
  X,
  PlusCircle,
  Calendar,
  Building,
  Shield,
  Layers,
  ArrowUpRight,
  Sparkles,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  ShieldCheck,
  LogOut,
  KeyRound
} from 'lucide-react';

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function HostDashboardPage() {
  // ─── Secure Server-Side Admin Access Barrier ──────────────────────────────
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passInput, setPassInput] = useState('');
  const [passError, setPassError] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Check server session cookie
    const verifySession = async () => {
      try {
        const res = await fetch('/api/host/auth', { method: 'GET' });
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated) {
            setIsAuthenticated(true);
          }
        }
      } catch {
        // Network error / fallback to locked
      } finally {
        setIsCheckingSession(false);
      }
    };

    verifySession();
  }, []);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passInput.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setPassError('');

    try {
      const res = await fetch('/api/host/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode: passInput.trim() }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setIsAuthenticated(true);
        setPassInput('');
        setPassError('');
      } else {
        setPassError(data.error || 'Access denied. Incorrect admin passcode.');
      }
    } catch {
      setPassError('Authentication service unreachable. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLock = async () => {
    try {
      await fetch('/api/host/auth', { method: 'DELETE' });
    } catch {
      /* ignore */
    }
    setIsAuthenticated(false);
    setPassInput('');
  };

  // ─── All Existing Host Logic (unchanged) ──────────────────────────────────
  const hostRequests = useParkingStore((s) => s.hostRequests);
  const acceptHostRequest = useParkingStore((s) => s.acceptHostRequest);
  const declineHostRequest = useParkingStore((s) => s.declineHostRequest);
  const autoCheckIn = useParkingStore((s) => s.autoCheckIn);
  const toggleAutoCheckIn = useParkingStore((s) => s.toggleAutoCheckIn);
  const addNewHostListing = useParkingStore((s) => s.addNewHostListing);

  // Listing Form State
  const [societyName, setSocietyName] = useState('Gulmohar Heights CHS');
  const [tower, setTower] = useState('Wing B');
  const [bayNumber, setBayNumber] = useState('B-42');
  const [hourlyRate, setHourlyRate] = useState('45');
  const [selectedVehicles, setSelectedVehicles] = useState<string[]>([
    'Hatchback',
    'Sedan',
    'SUV',
  ]);
  const [listingSuccess, setListingSuccess] = useState(false);

  // Availability Scheduler State
  const [activeDays, setActiveDays] = useState<string[]>(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('18:00');
  const [scheduleSaved, setScheduleSaved] = useState(false);

  const toggleDay = (day: string) => {
    setActiveDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const toggleVehicleOption = (veh: string) => {
    setSelectedVehicles((prev) =>
      prev.includes(veh) ? prev.filter((v) => v !== veh) : [...prev, veh]
    );
  };

  const handleAddListing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!societyName || !bayNumber) return;

    addNewHostListing({
      societyName,
      tower,
      bayNumber,
      hourlyRate: Number(hourlyRate) || 40,
      compatibility: selectedVehicles,
    });

    setListingSuccess(true);
    setTimeout(() => setListingSuccess(false), 3000);
  };

  const handleSaveSchedule = () => {
    setScheduleSaved(true);
    setTimeout(() => setScheduleSaved(false), 2500);
  };

  const parkingLots = useParkingStore((s) => s.parkingLots);

  // Compute live dynamic analytics
  const acceptedPayoutTotal = hostRequests
    .filter((r) => r.status === 'accepted')
    .reduce((sum, r) => sum + r.payout, 0);
  const totalWeeklyEarnings = 4250 + acceptedPayoutTotal;

  const totalBays = parkingLots.reduce((sum, l) => sum + l.totalBays, 0);
  const availableBays = parkingLots.reduce((sum, l) => sum + l.availableBays, 0);
  const occupiedBays = Math.max(0, totalBays - availableBays);
  const occupancyPercent = totalBays > 0 ? Math.round((occupiedBays / totalBays) * 100) : 75;

  // ─── Admin Access Barrier Screen ─────────────────────────────────────────
  if (isCheckingSession) {
    return (
      <div className="min-h-screen bg-[#0b0f17] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-emerald-500/30 border-t-emerald-400 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0b0f17] flex flex-col items-center justify-center px-4">
        {/* Bespoke Admin Sign-In Card */}
        <div className="w-full max-w-sm">
          {/* Header brand */}
          <div className="flex items-center justify-center gap-2.5 mb-6">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
              <span className="font-mono text-xs font-black text-slate-950">P</span>
            </div>
            <div className="font-heading text-lg font-bold text-white tracking-tight">Park Ryze</div>
          </div>

          <div className="bg-[#111824] rounded-2xl p-6 sm:p-7 border border-slate-800 shadow-xl">
            <div className="mb-6">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-emerald-400 mb-1">
                <Lock className="w-3.5 h-3.5" />
                <span>Host Portal</span>
              </div>
              <h1 className="text-xl font-bold text-white tracking-tight">Admin Sign In</h1>
              <p className="text-xs text-slate-400 mt-1">
                Enter your admin passcode to access bay monetization and listing controls.
              </p>
            </div>

            {/* Passcode form */}
            <form onSubmit={handleUnlock} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Passcode
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                  <input
                    id="admin-passcode-input"
                    type={showPass ? 'text' : 'password'}
                    value={passInput}
                    onChange={(e) => { setPassInput(e.target.value); setPassError(''); }}
                    placeholder="Admin passcode…"
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-lg pl-9 pr-9 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none transition-colors font-mono"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {passError && (
                  <p className="text-xs text-rose-400 mt-1.5 flex items-center gap-1">
                    <X className="w-3 h-3 shrink-0" />
                    <span>{passError}</span>
                  </p>
                )}
              </div>

              <button
                id="unlock-host-btn"
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-slate-950 font-medium text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:cursor-not-allowed shadow-sm"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-slate-950/30 border-t-slate-950 animate-spin" />
                    <span>Verifying…</span>
                  </>
                ) : (
                  <>
                    <Unlock className="w-4 h-4" />
                    <span>Sign In</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-white/8 flex items-center justify-center gap-2 text-slate-500 text-[11px] font-mono">
              <Shield className="w-3.5 h-3.5 text-emerald-500/60" />
              <span>Encrypted Server-Side Session Auth</span>
            </div>
          </div>

          {/* Back to customer link */}
          <div className="flex justify-center mt-6">
            <Link href="/customer" className="text-xs text-slate-500 hover:text-emerald-400 transition-colors font-mono flex items-center gap-1.5">
              <ArrowUpRight className="w-3.5 h-3.5" />
              Go to Customer View (Public)
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0f17] text-on-surface">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 md:px-8 pt-24 pb-16 space-y-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#232834] pb-6">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-semibold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>Society & Apartment Monetization Portal</span>
              <span className="ml-1 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
                Admin Session Active
              </span>
            </div>
            <h1 className="font-heading text-2xl md:text-4xl font-black text-white tracking-tight mt-1">
              Host Command Center
            </h1>
            <p className="text-sm text-on-surface-variant font-sans mt-0.5">
              Manage resident parking bays, live driver check-ins, and automated weekly payouts.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/customer"
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-white flex items-center gap-2 transition-colors"
            >
              <span>Customer Map</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
            </Link>
            <button
              type="button"
              onClick={handleLock}
              className="px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 hover:text-red-300 text-xs font-mono flex items-center gap-2 transition-colors"
              title="Lock and sign out of Host Panel"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Lock Panel</span>
            </button>
          </div>
        </div>

        {/* Analytics Bento Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Weekly Payout */}
          <div className="glass-panel rounded-2xl p-5 flex flex-col justify-between shadow-lg">
            <div className="flex justify-between items-start">
              <span className="font-mono text-xs text-on-surface-variant uppercase tracking-wider">
                Weekly Earnings
              </span>
              <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400">
                <Wallet className="w-4 h-4" />
              </div>
            </div>
            <div className="my-3">
              <div className="font-mono text-3xl font-black text-white">₹{totalWeeklyEarnings.toLocaleString()}</div>
              <div className="flex items-center gap-1 text-emerald-400 text-xs font-mono mt-1">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+18.4% vs last week</span>
              </div>
            </div>
            <div className="text-[11px] text-slate-500 font-mono">Auto-credited every Monday</div>
          </div>

          {/* Card 2: Occupancy Rate */}
          <div className="glass-panel rounded-2xl p-5 flex flex-col justify-between shadow-lg">
            <div className="flex justify-between items-start">
              <span className="font-mono text-xs text-on-surface-variant uppercase tracking-wider">
                Occupancy Rate
              </span>
              <div className="p-2 rounded-xl bg-sky-500/15 text-sky-400">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <div className="my-3">
              <div className="font-mono text-3xl font-black text-white">{occupancyPercent}%</div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-sky-400 h-full rounded-full" style={{ width: `${occupancyPercent}%` }} />
              </div>
            </div>
            <div className="text-[11px] text-slate-500 font-mono">Peak hours: 10:00 - 19:00</div>
          </div>

          {/* Card 3: Active Bookings */}
          <div className="glass-panel rounded-2xl p-5 flex flex-col justify-between shadow-lg">
            <div className="flex justify-between items-start">
              <span className="font-mono text-xs text-on-surface-variant uppercase tracking-wider">
                Active Bays
              </span>
              <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400">
                <Car className="w-4 h-4" />
              </div>
            </div>
            <div className="my-3">
              <div className="font-mono text-3xl font-black text-white">
                {occupiedBays} / {totalBays}
              </div>
              <div className="text-xs text-on-surface-variant font-mono mt-1">
                {availableBays} bays available for booking
              </div>
            </div>
            <div className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              All IoT sensors online
            </div>
          </div>

          {/* Card 4: Hours Hosted */}
          <div className="glass-panel rounded-2xl p-5 flex flex-col justify-between shadow-lg">
            <div className="flex justify-between items-start">
              <span className="font-mono text-xs text-on-surface-variant uppercase tracking-wider">
                Hours Hosted
              </span>
              <div className="p-2 rounded-xl bg-purple-500/15 text-purple-400">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="my-3">
              <div className="font-mono text-3xl font-black text-white">142 hrs</div>
              <div className="text-xs text-on-surface-variant font-mono mt-1">
                Across {parkingLots.length} registered society facilities
              </div>
            </div>
            <div className="text-[11px] text-slate-500 font-mono">Lifetime total: 580 hrs</div>
          </div>
        </section>

        {/* 2-Column Main Layout: Live Request Stream & Controls / Forms */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Live Booking Stream & Availability Scheduler (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Live Request Stream (Stitch Spec) */}
            <div className="glass-panel rounded-2xl p-5 md:p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                    <Radio className="w-4 h-4 animate-pulse" />
                  </div>
                  <h2 className="font-heading text-lg font-bold text-white">
                    Live Reservation Stream
                  </h2>
                </div>

                {/* Auto Check-in Toggle */}
                <div className="flex items-center gap-2 bg-[#121620] px-3 py-1.5 rounded-xl border border-[#2B313E]">
                  <span className="text-xs font-mono text-on-surface-variant">Auto Check-in</span>
                  <button
                    type="button"
                    onClick={toggleAutoCheckIn}
                    className={`relative w-9 h-5 rounded-full transition-colors ${
                      autoCheckIn ? 'bg-emerald-500' : 'bg-slate-700'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                        autoCheckIn ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Requests List */}
              <div className="space-y-3">
                {hostRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-4 rounded-xl bg-[#11141d] border border-[#2B313E] hover:border-emerald-500/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-bold text-white">
                          {req.bayId} ({req.tower})
                        </span>
                        <span className="opacity-30">•</span>
                        <span className="text-xs font-sans text-emerald-400 font-semibold">
                          ₹{req.payout} payout
                        </span>
                        <span className="opacity-30">•</span>
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold ${
                            req.status === 'accepted'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : req.status === 'declined'
                              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                              : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {req.status}
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 font-sans">
                        Driver: <strong className="text-white">{req.driverName}</strong> • {req.vehicleModel} ({req.vehiclePlate})
                      </p>
                      <p className="text-[11px] text-on-surface-variant font-mono">
                        Slot: {req.timeSlot} • {req.receivedAt}
                      </p>
                    </div>

                    {/* Action Buttons */}
                    {req.status === 'pending' ? (
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => acceptHostRequest(req.id)}
                          className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-heading text-xs font-bold transition-all shadow-sm active:scale-95"
                        >
                          Accept
                        </button>
                        <button
                          type="button"
                          onClick={() => declineHostRequest(req.id)}
                          className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-on-surface-variant hover:text-white border border-white/10 font-heading text-xs transition-colors"
                        >
                          Decline
                        </button>
                      </div>
                    ) : (
                      <div className="text-xs font-mono text-slate-500 sm:text-right">
                        {req.status === 'accepted' ? 'Barrier Code Dispatched' : 'Request Closed'}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Weekly Recurring Availability Scheduler */}
            <div className="glass-panel rounded-2xl p-5 md:p-6 shadow-xl space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-sky-500/20 text-sky-400">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-heading text-lg font-bold text-white">
                    Weekly Availability Scheduler
                  </h2>
                  <p className="text-xs text-on-surface-variant font-sans">
                    Define automated time slots when your bay is free for commuters.
                  </p>
                </div>
              </div>

              {/* Day Selector Pills */}
              <div className="space-y-2">
                <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block">
                  Recurring Active Days
                </span>
                <div className="grid grid-cols-7 gap-1.5">
                  {DAYS_OF_WEEK.map((day) => {
                    const isSelected = activeDays.includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleDay(day)}
                        className={`py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                          isSelected
                            ? 'bg-emerald-500 text-slate-950 shadow-xs'
                            : 'bg-[#11141d] border border-[#2B313E] text-slate-400 hover:text-white hover:border-slate-500'
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time Interval Range */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-1">
                    Opening Time
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full bg-[#111824] border border-[#2B313E] rounded-xl px-3 py-2 text-xs font-mono text-white focus:border-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-1">
                    Closing Time
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full bg-[#111824] border border-[#2B313E] rounded-xl px-3 py-2 text-xs font-mono text-white focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>

              {/* Save Schedule Button */}
              <div className="flex items-center justify-between pt-2">
                <div className="text-xs font-mono text-emerald-400">
                  {scheduleSaved && <span>✓ Schedule synchronized with marketplace</span>}
                </div>
                <button
                  type="button"
                  onClick={handleSaveSchedule}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-heading text-xs font-medium transition-colors"
                >
                  Save Schedule
                </button>
              </div>
            </div>

          </div>

          {/* Right Column: Spot Listing Form (5 Cols) */}
          <div className="lg:col-span-5">
            <div className="glass-panel rounded-2xl p-5 md:p-6 shadow-xl space-y-5 sticky top-24">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                  <Building className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-heading text-lg font-bold text-white">
                    List Your Space
                  </h2>
                  <p className="text-xs text-on-surface-variant font-sans">
                    Turn your vacant society bay into consistent monthly revenue.
                  </p>
                </div>
              </div>

              <form onSubmit={handleAddListing} className="space-y-4">
                {/* Society / Apartment Name */}
                <div>
                  <label className="block text-xs font-mono text-on-surface-variant uppercase tracking-wider mb-1">
                    Apartment / Society Name
                  </label>
                  <input
                    type="text"
                    required
                    value={societyName}
                    onChange={(e) => setSocietyName(e.target.value)}
                    placeholder="e.g. Apex Heights CHS"
                    className="w-full bg-[#111824] border border-[#2B313E] rounded-xl px-3.5 py-2.5 text-xs md:text-sm text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all font-sans"
                  />
                </div>

                {/* Tower & Bay Number */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono text-on-surface-variant uppercase tracking-wider mb-1">
                      Tower / Wing
                    </label>
                    <input
                      type="text"
                      required
                      value={tower}
                      onChange={(e) => setTower(e.target.value)}
                      placeholder="e.g. Wing A"
                      className="w-full bg-[#111824] border border-[#2B313E] rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-emerald-500 outline-none transition-all font-sans"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-on-surface-variant uppercase tracking-wider mb-1">
                      Bay ID
                    </label>
                    <input
                      type="text"
                      required
                      value={bayNumber}
                      onChange={(e) => setBayNumber(e.target.value)}
                      placeholder="e.g. B-42"
                      className="w-full bg-[#111824] border border-[#2B313E] rounded-xl px-3.5 py-2.5 text-xs font-mono text-emerald-400 font-bold focus:border-emerald-500 outline-none transition-all uppercase"
                    />
                  </div>
                </div>

                {/* Hourly Pricing in INR */}
                <div>
                  <label className="block text-xs font-mono text-on-surface-variant uppercase tracking-wider mb-1">
                    Hourly Pricing (₹ INR)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-sm text-emerald-400 font-bold">
                      ₹
                    </span>
                    <input
                      type="number"
                      min="10"
                      max="500"
                      value={hourlyRate}
                      onChange={(e) => setHourlyRate(e.target.value)}
                      className="w-full bg-[#111824] border border-[#2B313E] rounded-xl pl-8 pr-3.5 py-2.5 text-xs md:text-sm font-mono text-white focus:border-emerald-500 outline-none transition-all"
                    />
                  </div>
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Recommended rate for your area: ₹40 - ₹60/hr
                  </span>
                </div>

                {/* Vehicle Compatibility Toggles */}
                <div>
                  <label className="block text-xs font-mono text-on-surface-variant uppercase tracking-wider mb-2">
                    Vehicle Compatibility
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Hatchback', 'Sedan', 'SUV', 'Two-Wheeler'].map((veh) => {
                      const isChecked = selectedVehicles.includes(veh);
                      return (
                        <button
                          key={veh}
                          type="button"
                          onClick={() => toggleVehicleOption(veh)}
                          className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-mono transition-all ${
                            isChecked
                              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                              : 'bg-[#111824] border-[#2B313E] text-slate-400 hover:border-slate-500'
                          }`}
                        >
                          <div
                            className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${
                              isChecked
                                ? 'bg-emerald-500 border-emerald-500 text-slate-950'
                                : 'border-slate-600'
                            }`}
                          >
                            {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <span>{veh}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Success Notification */}
                {listingSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center gap-2 animate-in fade-in">
                    <Check className="w-4 h-4" />
                    <span>Bay {bayNumber} published live to Park Ryze map!</span>
                  </div>
                )}

                {/* Submit Action */}
                <button
                  type="submit"
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-heading font-bold text-sm py-3 rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Publish Bay to Marketplace</span>
                </button>
              </form>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
