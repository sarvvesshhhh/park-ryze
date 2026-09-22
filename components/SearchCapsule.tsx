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
  Flag,
  SlidersHorizontal,
  ChevronDown,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { searchHybridPlaces, GeocodingResult, LandmarkCategory } from '@/lib/mapbox';

const QUICK_LANDMARKS = [
  { name: 'NMIMS / MPSTME (Vile Parle)', coords: [19.1082, 72.8370] as [number, number], category: 'university' },
  { name: 'Andheri Station (Line 1)', coords: [19.1197, 72.8466] as [number, number], category: 'station' },
  { name: 'Goregaon Aarey (Line 7)', coords: [19.1595, 72.8670] as [number, number], category: 'station' },
  { name: 'Borivali Station (West)', coords: [19.2290, 72.8535] as [number, number], category: 'station' },
  { name: 'Mira Road Station', coords: [19.2815, 72.8560] as [number, number], category: 'station' },
  { name: 'BKC (Jio World)', coords: [19.0645, 72.8681] as [number, number], category: 'commercial' },
];

export default function SearchCapsule() {
  const searchQuery = useParkingStore((s) => s.searchQuery);
  const setSearchQuery = useParkingStore((s) => s.setSearchQuery);
  const vehicleType = useParkingStore((s) => s.vehicleType);
  const setVehicleType = useParkingStore((s) => s.setVehicleType);
  const radiusKm = useParkingStore((s) => s.radiusKm);
  const setRadiusKm = useParkingStore((s) => s.setRadiusKm);
  const sortBy = useParkingStore((s) => s.sortBy);
  const setSortBy = useParkingStore((s) => s.setSortBy);
  const userLocation = useParkingStore((s) => s.userLocation);
  const setUserLocation = useParkingStore((s) => s.setUserLocation);
  
  // Origin and Destination state
  const startLocation = useParkingStore((s) => s.startLocation);
  const startLocationName = useParkingStore((s) => s.startLocationName);
  const isCustomStartPoint = useParkingStore((s) => s.isCustomStartPoint);
  const setCustomStartPoint = useParkingStore((s) => s.setCustomStartPoint);
  const resetToGpsLocation = useParkingStore((s) => s.resetToGpsLocation);

  const destinationLocation = useParkingStore((s) => s.destinationLocation);
  const destinationName = useParkingStore((s) => s.destinationName);
  const isCustomDestination = useParkingStore((s) => s.isCustomDestination);
  const setDestinationPoint = useParkingStore((s) => s.setDestinationPoint);

  const parkingLots = useParkingStore((s) => s.parkingLots);
  const selectLot = useParkingStore((s) => s.selectLot);
  const getRankedLots = useParkingStore((s) => s.getRankedLots);

  const detectUserLocation = useParkingStore((s) => s.detectUserLocation);
  const isLocating = useParkingStore((s) => s.isLocating);
  const watchGpsActive = useParkingStore((s) => s.watchGpsActive);
  const toggleWatchGps = useParkingStore((s) => s.toggleWatchGps);
  const mapboxToken = useParkingStore((s) => s.mapboxToken);

  const [suggestions, setSuggestions] = useState<GeocodingResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showRadiusFilter, setShowRadiusFilter] = useState(false);

  const rankedLots = getRankedLots();

  const activeKey =
    mapboxToken?.trim() ||
    process.env.NEXT_PUBLIC_MAP_KEY ||
    process.env.NEXT_PUBLIC_MAPTILER_KEY ||
    process.env.NEXT_PUBLIC_MAPBOX_TOKEN ||
    'G6nQ7QJ4pu2tz9txZigU';

  // Debounced search with Hybrid Landmark, Building, & Parking Lot Matching
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
      setShowDropdown(true);
    }, 220);

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
    setDestinationPoint([lat, lng], place.text, 'Destination Area');
    setSearchQuery('');
    setShowDropdown(false);
  };

  const renderCategoryBadge = (category: LandmarkCategory) => {
    switch (category) {
      case 'university':
        return (
          <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-mono uppercase font-semibold">
            <GraduationCap className="w-3 h-3" />
            <span>Campus</span>
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
            <span>Mall</span>
          </span>
        );
      case 'commercial':
        return (
          <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 text-[10px] font-mono uppercase font-semibold">
            <Building className="w-3 h-3" />
            <span>Hub</span>
          </span>
        );
      case 'station':
        return (
          <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[10px] font-mono uppercase font-semibold">
            <Train className="w-3 h-3" />
            <span>Transit</span>
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-mono uppercase font-semibold">
            <MapPin className="w-3 h-3" />
            <span>POI</span>
          </span>
        );
    }
  };

  return (
    <div className="absolute top-18 md:top-20 left-1/2 -translate-x-1/2 w-[95%] max-w-3xl z-30 pointer-events-none">
      <div className="relative glass-panel rounded-2xl p-2.5 md:p-3.5 flex flex-col gap-2.5 pointer-events-auto shadow-2xl border border-white/10">
        
        {/* Active Route Pill with Start and Destination */}
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

        {/* Search Bar Row */}
        <div className="flex flex-col sm:flex-row items-center gap-2">
          {/* Search Input */}
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
                setShowDropdown(true);
              }}
              placeholder="Search Mumbai landmarks, colleges (NMIMS), hospitals, societies..."
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

          {/* Vehicle Mode Toggle & Radius Slider Toggle */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            {/* Vehicle Mode Toggle (Car vs Two-Wheeler) */}
            <div className="flex bg-[#111824]/90 p-1 rounded-xl border border-[#2B313E]">
              <button
                type="button"
                onClick={() => setVehicleType('car')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-heading font-medium transition-all ${
                  vehicleType === 'car'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold'
                    : 'text-on-surface-variant hover:text-white'
                }`}
                title="Four Wheeler (Sedan / SUV / Hatchback)"
              >
                <Car className="w-3.5 h-3.5" />
                <span>Car</span>
              </button>
              <button
                type="button"
                onClick={() => setVehicleType('two-wheeler')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-heading font-medium transition-all ${
                  vehicleType === 'two-wheeler'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold'
                    : 'text-on-surface-variant hover:text-white'
                }`}
                title="Two Wheeler (Bike / Scooter - 60% Saver Rate)"
              >
                <Bike className="w-3.5 h-3.5" />
                <span>Bike</span>
                <span className="text-[9px] px-1 rounded bg-emerald-500/30 text-emerald-300 font-mono">-60%</span>
              </button>
            </div>

            {/* Radius & Sort Controls */}
            <button
              type="button"
              onClick={() => setShowRadiusFilter(!showRadiusFilter)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-mono transition-all ${
                showRadiusFilter
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 font-bold'
                  : 'bg-[#111824]/90 border-[#2B313E] text-on-surface-variant hover:text-white'
              }`}
              title="Search Radius & Algorithmic Sorting"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-400" />
              <span>{radiusKm} km</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${showRadiusFilter ? 'rotate-180' : ''}`} />
            </button>

            {/* Live GPS Locate */}
            <button
              type="button"
              onClick={detectUserLocation}
              disabled={isLocating}
              className="p-2.5 rounded-xl bg-[#111824]/90 border border-[#2B313E] text-emerald-400 hover:text-emerald-300 hover:border-emerald-500/40 transition-colors"
              title="Detect Live GPS Location"
            >
              <Crosshair className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Expandable Radius & Sorting Algorithm Panel */}
        {showRadiusFilter && (
          <div className="p-3 bg-[#0e131d] rounded-xl border border-[#2B313E] space-y-3 animate-in fade-in-50 duration-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-slate-400 uppercase tracking-wider">
                  Proximity Radius:
                </span>
                <span className="font-mono text-xs font-bold text-emerald-400">
                  Within {radiusKm} km ({rankedLots.length} facilities matching)
                </span>
              </div>

              {/* Radius Quick Presets */}
              <div className="flex items-center gap-1 font-mono text-[11px]">
                {[1.0, 3.0, 5.0, 10.0].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRadiusKm(r)}
                    className={`px-2 py-0.5 rounded-md border transition-all ${
                      radiusKm === r
                        ? 'bg-emerald-500 text-slate-950 font-bold border-emerald-400'
                        : 'bg-[#161c28] border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    {r}km
                  </button>
                ))}
              </div>
            </div>

            <input
              type="range"
              min="0.5"
              max="10.0"
              step="0.5"
              value={radiusKm}
              onChange={(e) => setRadiusKm(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
            />

            {/* Multi-Factor Sort By Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-white/5">
              <span className="font-mono text-[11px] text-slate-400 uppercase">Sort Algorithm:</span>
              <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs">
                <button
                  type="button"
                  onClick={() => setSortBy('recommendation')}
                  className={`px-2.5 py-1 rounded-lg border transition-all ${
                    sortBy === 'recommendation'
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50 font-bold'
                      : 'bg-[#141a24] text-slate-400 border-white/5 hover:text-white'
                  }`}
                >
                  ⭐ AI Best Match
                </button>
                <button
                  type="button"
                  onClick={() => setSortBy('distance')}
                  className={`px-2.5 py-1 rounded-lg border transition-all ${
                    sortBy === 'distance'
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50 font-bold'
                      : 'bg-[#141a24] text-slate-400 border-white/5 hover:text-white'
                  }`}
                >
                  📍 Nearest First
                </button>
                <button
                  type="button"
                  onClick={() => setSortBy('price')}
                  className={`px-2.5 py-1 rounded-lg border transition-all ${
                    sortBy === 'price'
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50 font-bold'
                      : 'bg-[#141a24] text-slate-400 border-white/5 hover:text-white'
                  }`}
                >
                  💰 Lowest Fare
                </button>
                <button
                  type="button"
                  onClick={() => setSortBy('availability')}
                  className={`px-2.5 py-1 rounded-lg border transition-all ${
                    sortBy === 'availability'
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50 font-bold'
                      : 'bg-[#141a24] text-slate-400 border-white/5 hover:text-white'
                  }`}
                >
                  🟢 Most Open Bays
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Quick Mumbai Destination Chips */}
        {!searchQuery && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs font-mono">
            <span className="text-[11px] text-slate-500 uppercase tracking-wider shrink-0 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-400" /> Hotspots:
            </span>
            {QUICK_LANDMARKS.map((item) => (
              <button
                key={item.name}
                type="button"
                onClick={() => {
                  setDestinationPoint(item.coords, item.name, 'Main Entry Gate');
                }}
                className="px-2.5 py-1 rounded-lg bg-[#111824]/80 hover:bg-[#1b2332] border border-[#2B313E] text-slate-300 hover:text-white shrink-0 transition-colors"
              >
                {item.name}
              </button>
            ))}
          </div>
        )}

        {/* Unified Search Dropdown: Registered Lots & Landmarks */}
        {showDropdown && (
          <div className="max-h-80 overflow-y-auto bg-[#0d121c]/95 backdrop-blur-2xl rounded-xl border border-[#2B313E] p-2 space-y-2 shadow-2xl animate-in fade-in-50 duration-150">
            
            {/* Matching Registered Parking Lots Section */}
            {rankedLots.length > 0 && (
              <div>
                <div className="font-mono text-[10px] text-emerald-400 font-bold uppercase tracking-wider px-2 py-1 flex items-center justify-between">
                  <span>Verified Parking Facilities Near Query</span>
                  <span className="text-slate-500">{rankedLots.length} available</span>
                </div>
                <div className="space-y-1">
                  {rankedLots.slice(0, 4).map((lot) => (
                    <div
                      key={lot.id}
                      className="p-2.5 rounded-lg bg-[#141a26] hover:bg-[#1a2333] border border-white/5 hover:border-emerald-500/40 transition-colors flex items-center justify-between gap-3"
                    >
                      <div
                        onClick={() => {
                          selectLot(lot.id);
                          setShowDropdown(false);
                        }}
                        className="flex-1 cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-heading text-xs md:text-sm font-bold text-white">
                            {lot.name}
                          </span>
                          {lot.badge && (
                            <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold uppercase">
                              {lot.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                          {lot.levelName} • {lot.distanceKm} km away • ~{lot.driveTimeMins} min drive
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <div className="text-right">
                          <div className="font-mono text-xs font-bold text-emerald-400">
                            ₹{vehicleType === 'two-wheeler' ? Math.round(lot.hourlyRate * 0.4) : lot.hourlyRate}/hr
                          </div>
                          <div className="font-mono text-[10px] text-slate-400">
                            {lot.availableBays} bays free
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            selectLot(lot.id);
                            setShowDropdown(false);
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-heading text-xs font-bold transition-all shadow-sm"
                        >
                          Book CAD
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Landmark & POI Suggestions */}
            {suggestions.length > 0 && (
              <div className="pt-2 border-t border-white/5">
                <div className="font-mono text-[10px] text-sky-400 font-bold uppercase tracking-wider px-2 py-1 flex items-center justify-between">
                  <span>Mumbai Landmarks, Colleges & Commercial Hubs</span>
                  <span className="text-slate-500">{suggestions.length} places</span>
                </div>
                <div className="space-y-1">
                  {suggestions.map((place) => (
                    <div
                      key={place.id}
                      className="p-2.5 rounded-lg bg-[#111622] hover:bg-[#161e2d] border border-white/5 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-heading text-xs md:text-sm font-semibold text-white truncate">
                            {place.text}
                          </span>
                          {renderCategoryBadge(place.category)}
                        </div>
                        <p className="text-[11px] text-on-surface-variant font-sans truncate mt-0.5">
                          {place.place_name}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center font-heading text-xs">
                        <button
                          type="button"
                          onClick={() => handleSetAsStartPoint(place)}
                          className="px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/10 text-amber-300 border border-amber-400/30 flex items-center gap-1 transition-colors"
                          title="Set as driving route origin"
                        >
                          <MapPin className="w-3 h-3" />
                          <span>Set Start</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleSetAsDestination(place)}
                          className="px-2.5 py-1 rounded-md bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/40 flex items-center gap-1 transition-colors font-bold"
                          title="Set as final parking destination and calculate route"
                        >
                          <Flag className="w-3 h-3" />
                          <span>Set Park</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleFindParkingNearby(place)}
                          className="px-2.5 py-1 rounded-md bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 flex items-center gap-1 transition-colors"
                          title="Discover all parking spots within radius of this landmark"
                        >
                          <Navigation className="w-3 h-3" />
                          <span>Nearby</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {rankedLots.length === 0 && suggestions.length === 0 && !isSearching && (
              <div className="p-4 text-center text-xs font-mono text-slate-500">
                No verified parking lots or landmarks found matching &quot;{searchQuery}&quot; within {radiusKm} km.
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
