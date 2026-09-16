'use client';

import React, { useState, useEffect } from 'react';
import { useParkingStore } from '@/lib/store';
import {
  Search,
  Car,
  Bike,
  Crosshair,
  MapPin,
  X,
  Loader2,
  Navigation,
  Sparkles,
  Building,
  GraduationCap,
  Building2,
  Stethoscope,
  Train,
  Milestone,
  Flag
} from 'lucide-react';
import { searchHybridPlaces, GeocodingResult, LandmarkCategory } from '@/lib/mapbox';

const QUICK_LANDMARKS = [
  { name: 'NMIMS (Vile Parle)', coords: [19.1034, 72.8365] as [number, number], category: 'university' },
  { name: 'BKC (Jio World)', coords: [19.0645, 72.8681] as [number, number], category: 'commercial' },
  { name: 'Lilavati Hospital', coords: [19.0514, 72.8297] as [number, number], category: 'hospital' },
  { name: 'Phoenix Palladium', coords: [18.9958, 72.8242] as [number, number], category: 'mall' },
  { name: 'Nariman Point', coords: [18.9281, 72.8242] as [number, number], category: 'locality' },
];

export default function SearchCapsule() {
  const searchQuery = useParkingStore((s) => s.searchQuery);
  const setSearchQuery = useParkingStore((s) => s.setSearchQuery);
  const vehicleType = useParkingStore((s) => s.vehicleType);
  const setVehicleType = useParkingStore((s) => s.setVehicleType);
  const radiusKm = useParkingStore((s) => s.radiusKm);
  const setRadiusKm = useParkingStore((s) => s.setRadiusKm);
  const userLocation = useParkingStore((s) => s.userLocation);
  const setUserLocation = useParkingStore((s) => s.setUserLocation);
  
  // Origin and Destination state
  const startLocationName = useParkingStore((s) => s.startLocationName);
  const isCustomStartPoint = useParkingStore((s) => s.isCustomStartPoint);
  const setCustomStartPoint = useParkingStore((s) => s.setCustomStartPoint);
  const resetToGpsLocation = useParkingStore((s) => s.resetToGpsLocation);

  const destinationLocation = useParkingStore((s) => s.destinationLocation);
  const destinationName = useParkingStore((s) => s.destinationName);
  const isCustomDestination = useParkingStore((s) => s.isCustomDestination);
  const setDestinationPoint = useParkingStore((s) => s.setDestinationPoint);

  const detectUserLocation = useParkingStore((s) => s.detectUserLocation);
  const isLocating = useParkingStore((s) => s.isLocating);
  const watchGpsActive = useParkingStore((s) => s.watchGpsActive);
  const toggleWatchGps = useParkingStore((s) => s.toggleWatchGps);
  const mapboxToken = useParkingStore((s) => s.mapboxToken);

  const [suggestions, setSuggestions] = useState<GeocodingResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const activeKey =
    mapboxToken?.trim() ||
    process.env.NEXT_PUBLIC_MAP_KEY ||
    process.env.NEXT_PUBLIC_MAPTILER_KEY ||
    process.env.NEXT_PUBLIC_MAPBOX_TOKEN ||
    'G6nQ7QJ4pu2tz9txZigU';

  // Debounced search with Hybrid Landmark, Building & Street Geocoder
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSuggestions([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      const results = await searchHybridPlaces(
        searchQuery,
        activeKey,
        [userLocation[1], userLocation[0]] // [lng, lat]
      );
      setSuggestions(results);
      setIsSearching(false);
      setShowDropdown(results.length > 0);
    }, 240);

    return () => clearTimeout(timer);
  }, [searchQuery, activeKey, userLocation]);

  // Action 1: Set as Route Origin (Start Point)
  const handleSetAsStartPoint = async (place: GeocodingResult) => {
    const [lng, lat] = place.center;
    await setCustomStartPoint([lat, lng], place.text);
    setShowDropdown(false);
  };

  // Action 2: Set as Park / Destination (Final Point)
  const handleSetAsDestination = async (place: GeocodingResult) => {
    const [lng, lat] = place.center;
    await setDestinationPoint([lat, lng], place.text, 'Security Gate');
    setShowDropdown(false);
  };

  // Action 3: Filter Parking bays near this landmark
  const handleFindParkingNearby = (place: GeocodingResult) => {
    const [lng, lat] = place.center;
    setUserLocation([lat, lng]);
    setSearchQuery(place.text);
    setShowDropdown(false);
  };

  const renderCategoryBadge = (category: LandmarkCategory) => {
    switch (category) {
      case 'university':
        return (
          <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-mono uppercase font-semibold">
            <GraduationCap className="w-3 h-3" />
            <span>College / Univ</span>
          </span>
        );
      case 'hospital':
        return (
          <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[10px] font-mono uppercase font-semibold">
            <Stethoscope className="w-3 h-3" />
            <span>Hospital</span>
          </span>
        );
      case 'mall':
        return (
          <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[10px] font-mono uppercase font-semibold">
            <Building2 className="w-3 h-3" />
            <span>Shopping Mall</span>
          </span>
        );
      case 'commercial':
        return (
          <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 text-[10px] font-mono uppercase font-semibold">
            <Building className="w-3 h-3" />
            <span>Business Park</span>
          </span>
        );
      case 'station':
        return (
          <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[10px] font-mono uppercase font-semibold">
            <Train className="w-3 h-3" />
            <span>Transit Hub</span>
          </span>
        );
      case 'street':
        return (
          <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-mono uppercase font-semibold">
            <Milestone className="w-3 h-3" />
            <span>Street / Road</span>
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-mono uppercase font-semibold">
            <MapPin className="w-3 h-3" />
            <span>Landmark</span>
          </span>
        );
    }
  };

  return (
    <div className="absolute top-18 md:top-20 left-1/2 -translate-x-1/2 w-[95%] max-w-2xl z-30 pointer-events-none">
      <div className="relative glass-panel rounded-2xl p-2.5 flex flex-col gap-2.5 pointer-events-auto shadow-2xl border border-white/10">
        
        {/* Origin & Destination Active Route Pill */}
        {(isCustomStartPoint || isCustomDestination) && (
          <div className="flex flex-wrap items-center justify-between px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-mono gap-2">
            <div className="flex items-center gap-2 truncate">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0"></span>
              <span className="truncate">
                Start: <strong className="text-white">{startLocationName}</strong>
              </span>
              <span className="text-slate-400">➔</span>
              <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0"></span>
              <span className="truncate">
                Park: <strong className="text-white">{destinationName}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {isCustomStartPoint && (
                <button
                  type="button"
                  onClick={resetToGpsLocation}
                  className="text-[11px] underline hover:text-white"
                  title="Reset route start to actual GPS location"
                >
                  Reset GPS
                </button>
              )}
            </div>
          </div>
        )}

        {/* Main Input Row */}
        <div className="flex flex-col sm:flex-row items-center gap-2">
          {/* Search Input with Landmark / Building detection */}
          <div className="relative flex-1 w-full">
            {isSearching ? (
              <Loader2 className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-400 animate-spin pointer-events-none" />
            ) : (
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
            )}
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => {
                if (suggestions.length > 0) setShowDropdown(true);
              }}
              placeholder="Search landmarks, colleges (NMIMS), hospitals, buildings..."
              className="w-full bg-[#111824]/90 dark:bg-[#111824]/90 border border-[#2B313E] rounded-xl pl-10 pr-9 py-2.5 text-xs md:text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 outline-none transition-all font-sans"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSuggestions([]);
                  setShowDropdown(false);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Vehicle Mode Toggle & Live GPS Buttons */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto justify-between sm:justify-end">
            {/* Vehicle Mode Toggle */}
            <div className="flex bg-[#111824]/90 p-1 rounded-xl border border-[#2B313E]">
              <button
                type="button"
                onClick={() => setVehicleType('car')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-heading font-medium transition-all ${
                  vehicleType === 'car'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'text-on-surface-variant hover:text-white'
                }`}
                title="Filter for 4-Wheeler Car Bays"
              >
                <Car className="w-3.5 h-3.5" />
                <span>Car</span>
              </button>
              <button
                type="button"
                onClick={() => setVehicleType('two-wheeler')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-heading font-medium transition-all ${
                  vehicleType === 'two-wheeler'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'text-on-surface-variant hover:text-white'
                }`}
                title="Filter for 2-Wheeler Bays"
              >
                <Bike className="w-3.5 h-3.5" />
                <span>Bike</span>
              </button>
            </div>

            {/* GPS Detection & Watch Toggle */}
            <button
              type="button"
              onClick={toggleWatchGps}
              className={`p-2.5 rounded-xl border border-[#2B313E] bg-[#111824]/90 text-on-surface-variant hover:text-emerald-400 hover:border-emerald-500/40 transition-all ${
                watchGpsActive
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 ring-1 ring-emerald-400/50'
                  : isLocating
                  ? 'animate-spin text-emerald-400'
                  : ''
              }`}
              title={watchGpsActive ? 'Live GPS Tracking Active (Click to Stop)' : 'Detect Current GPS Location'}
            >
              <Crosshair className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Real Landmark & Building Geocoding Dropdown */}
        {showDropdown && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-[#121723]/95 backdrop-blur-xl border border-emerald-500/30 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 space-y-1.5 max-h-96 overflow-y-auto">
            <div className="px-3 py-1 text-[10px] font-mono text-emerald-400 uppercase font-bold tracking-wider flex items-center justify-between border-b border-white/5 pb-2">
              <span>Verified Landmarks & Buildings</span>
              <span className="text-slate-500">Pick action</span>
            </div>

            {suggestions.map((item) => (
              <div
                key={item.id}
                className="p-2.5 rounded-lg bg-white/5 hover:bg-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 transition-colors border border-white/5"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {renderCategoryBadge(item.category)}
                    <span className="text-xs font-bold text-white truncate font-sans">
                      {item.text}
                    </span>
                  </div>
                  <div className="text-[11px] text-on-surface-variant truncate font-sans">
                    {item.subtitle || item.place_name}
                  </div>
                </div>

                {/* Three Context Actions: Start, Destination, Nearby */}
                <div className="flex flex-wrap items-center gap-1.5 shrink-0 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => handleSetAsStartPoint(item)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] font-mono transition-colors"
                    title="Set as Route Starting Point"
                  >
                    <Navigation className="w-3 h-3" />
                    <span>Set Start</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSetAsDestination(item)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-[11px] font-mono transition-colors font-semibold"
                    title="Set as Final Parking Destination"
                  >
                    <Flag className="w-3 h-3" />
                    <span>Set as Park</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleFindParkingNearby(item)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[11px] font-mono transition-colors"
                    title="Find Parking Near this Place"
                  >
                    <MapPin className="w-3 h-3" />
                    <span>Nearby</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Secondary Row: Radius Pill Selector & Quick Landmark Chips */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-white/5 text-xs">
          {/* Radius Selector */}
          <div className="flex items-center gap-1.5 text-on-surface-variant">
            <span className="text-[11px] font-mono uppercase tracking-wider text-on-surface-variant/70">
              Radius:
            </span>
            <div className="flex gap-1">
              {[0.5, 1.0, 3.0, 5.0].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRadiusKm(r)}
                  className={`px-2 py-0.5 rounded-md font-mono text-[11px] transition-colors ${
                    radiusKm === r
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-semibold'
                      : 'bg-surface-container-low/60 text-on-surface-variant hover:text-white border border-white/5'
                  }`}
                >
                  {r < 1 ? `${r * 1000}m` : `${r}km`}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Landmark Jump Chips */}
          <div className="hidden lg:flex items-center gap-1.5">
            <span className="text-[11px] font-mono text-on-surface-variant/70">Landmarks:</span>
            {QUICK_LANDMARKS.slice(0, 4).map((loc) => (
              <button
                key={loc.name}
                type="button"
                onClick={() => {
                  setUserLocation(loc.coords);
                  setSearchQuery(loc.name.split('(')[0].trim());
                }}
                className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/5 hover:bg-white/10 text-on-surface-variant hover:text-white border border-white/5 text-[11px] font-mono transition-colors"
                title={`Jump map to ${loc.name}`}
              >
                <MapPin className="w-2.5 h-2.5 text-emerald-400" />
                <span>{loc.name.split('(')[0].trim()}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
