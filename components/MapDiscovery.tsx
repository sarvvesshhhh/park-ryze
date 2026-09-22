'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useParkingStore } from '@/lib/store';
import { ParkingLot } from '@/lib/types';
import { calculateHaversineDistanceKm } from '@/lib/algorithms/proximity';
import {
  Navigation,
  Plus,
  Minus,
  Settings2,
  Route,
  Layers,
  Compass,
  Eye,
  ShieldCheck,
  LocateFixed,
  Crosshair,
  MapPin,
  Flag,
  Car
} from 'lucide-react';
import MapboxConfigModal from './MapboxConfigModal';
import 'leaflet/dist/leaflet.css';

export default function MapDiscovery() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null); // Leaflet Map instance
  const tileLayerRef = useRef<any>(null); // Active Leaflet TileLayer
  const markersLayerRef = useRef<any>(null); // LayerGroup for lot markers
  const startMarkerRef = useRef<any>(null); // Draggable Start Point / GPS Marker
  const destinationMarkerRef = useRef<any>(null); // Draggable Destination / Park Marker
  const radiusCircleRef = useRef<any>(null); // Search Radius Radar Circle
  const simulatedCarMarkerRef = useRef<any>(null); // Simulated driving vehicle marker
  const routeLayersRef = useRef<{ glow?: any; core?: any }>({});

  const [is3DMode, setIs3DMode] = useState(false);
  const [layerType, setLayerType] = useState<'streets' | 'satellite'>('streets');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const themeMode = useParkingStore((s) => s.themeMode);
  const parkingLots = useParkingStore((s) => s.parkingLots);
  const selectedLotId = useParkingStore((s) => s.selectedLotId);
  const selectLot = useParkingStore((s) => s.selectLot);
  const getRankedLots = useParkingStore((s) => s.getRankedLots);
  const radiusKm = useParkingStore((s) => s.radiusKm);
  
  // Start origin
  const userLocation = useParkingStore((s) => s.userLocation);
  const setUserLocation = useParkingStore((s) => s.setUserLocation);
  const startLocation = useParkingStore((s) => s.startLocation);
  const startLocationName = useParkingStore((s) => s.startLocationName);
  const isCustomStartPoint = useParkingStore((s) => s.isCustomStartPoint);
  const setCustomStartPoint = useParkingStore((s) => s.setCustomStartPoint);
  const resetToGpsLocation = useParkingStore((s) => s.resetToGpsLocation);

  // Destination / Park
  const destinationLocation = useParkingStore((s) => s.destinationLocation);
  const destinationName = useParkingStore((s) => s.destinationName);
  const isCustomDestination = useParkingStore((s) => s.isCustomDestination);
  const setDestinationPoint = useParkingStore((s) => s.setDestinationPoint);

  const searchQuery = useParkingStore((s) => s.searchQuery);
  const vehicleType = useParkingStore((s) => s.vehicleType);

  const activeRoute = useParkingStore((s) => s.activeRoute);
  const isNavigating = useParkingStore((s) => s.isNavigating);
  const mapboxToken = useParkingStore((s) => s.mapboxToken);
  const simulation = useParkingStore((s) => s.simulation);

  // Active Key: from store or .env.local fallback
  const activeKey =
    mapboxToken?.trim() ||
    process.env.NEXT_PUBLIC_MAP_KEY ||
    process.env.NEXT_PUBLIC_MAPTILER_KEY ||
    process.env.NEXT_PUBLIC_MAPBOX_TOKEN ||
    'G6nQ7QJ4pu2tz9txZigU';

  const isMapboxPk = activeKey.startsWith('pk.');

  // Helper to get active tile URL based on layerType and themeMode
  const getTileUrl = (type: 'streets' | 'satellite', theme: 'dark' | 'light') => {
    if (type === 'satellite') {
      if (isMapboxPk) {
        return `https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v12/tiles/256/{z}/{x}/{y}?access_token=${activeKey}`;
      }
      return `https://api.maptiler.com/maps/hybrid/{z}/{x}/{y}.jpg?key=${activeKey}`;
    }

    if (theme === 'light') {
      if (isMapboxPk) {
        return `https://api.mapbox.com/styles/v1/mapbox/light-v11/tiles/256/{z}/{x}/{y}?access_token=${activeKey}`;
      }
      return `https://api.maptiler.com/maps/streets-v2-light/{z}/{x}/{y}.png?key=${activeKey}`;
    }

    // Default dark streets
    if (isMapboxPk) {
      return `https://api.mapbox.com/styles/v1/mapbox/dark-v11/tiles/256/{z}/{x}/{y}?access_token=${activeKey}`;
    }
    return `https://api.maptiler.com/maps/streets-v2-dark/{z}/{x}/{y}.png?key=${activeKey}`;
  };

  const [availabilityFilter, setAvailabilityFilter] = useState<'all' | 'available_only'>('all');

  const rankedLots = getRankedLots();
  const availableCount = rankedLots.filter((l) => l.availableBays > 0).length;
  const fullCount = rankedLots.filter((l) => l.availableBays === 0).length;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 1. Initialize Leaflet Map Instance
  useEffect(() => {
    if (!isMounted || !mapContainerRef.current) return;

    let map: any = null;

    const initMap = async () => {
      const L = (await import('leaflet')).default || (await import('leaflet'));

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const [startLat, startLng] = startLocation;

      map = L.map(mapContainerRef.current!, {
        center: [startLat, startLng],
        zoom: 14,
        minZoom: 10,
        maxZoom: 19,
        zoomControl: false,
        attributionControl: false,
      });

      const initialUrl = getTileUrl(layerType, themeMode);
      const tileLayer = L.tileLayer(initialUrl, { maxZoom: 19 }).addTo(map);
      tileLayerRef.current = tileLayer;

      // LayerGroup for parking markers
      const markersLayer = L.layerGroup().addTo(map);
      markersLayerRef.current = markersLayer;

      // Draggable Start Point Marker
      const startMarkerHtml = isCustomStartPoint
        ? `
          <div class="relative flex flex-col items-center group cursor-grab active:cursor-grabbing">
            <div class="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-mono text-[10px] font-bold shadow-[0_0_12px_rgba(245,158,11,0.9)] whitespace-nowrap mb-1">
              📍 START (Drag me)
            </div>
            <div class="w-4 h-4 bg-amber-400 rotate-45 border-2 border-white shadow-[0_0_15px_rgba(245,158,11,0.9)]"></div>
          </div>
        `
        : `
          <div class="relative flex flex-col items-center group cursor-grab active:cursor-grabbing">
            <div class="px-2 py-0.5 rounded-full bg-emerald-400 text-slate-950 font-mono text-[10px] font-bold shadow-[0_0_12px_rgba(16,185,129,0.9)] whitespace-nowrap mb-1">
              🟢 START (Drag me)
            </div>
            <div class="relative flex items-center justify-center">
              <div class="absolute -inset-2 bg-emerald-500/30 rounded-full animate-ping"></div>
              <div class="w-4 h-4 bg-emerald-400 rounded-full border-2 border-white shadow-[0_0_12px_rgba(16,185,129,0.9)]"></div>
            </div>
          </div>
        `;

      const startIcon = L.divIcon({
        className: 'custom-start-pin',
        html: startMarkerHtml,
        iconSize: [120, 40],
        iconAnchor: [60, 36],
      });

      const startMarker = L.marker([startLat, startLng], {
        icon: startIcon,
        draggable: true,
        zIndexOffset: 1000,
      }).addTo(map);

      startMarker.on('dragend', async (e: any) => {
        const pos = e.target.getLatLng();
        const coords: [number, number] = [pos.lat, pos.lng];
        await setCustomStartPoint(
          coords,
          `Custom Pin (${pos.lat.toFixed(3)}, ${pos.lng.toFixed(3)})`
        );
      });

      startMarkerRef.current = startMarker;

      // Draggable Destination / Park Marker
      if (destinationLocation) {
        const [destLat, destLng] = destinationLocation;
        const destMarkerHtml = `
          <div class="relative flex flex-col items-center group cursor-grab active:cursor-grabbing">
            <div class="px-2 py-0.5 rounded-full bg-cyan-400 text-slate-950 font-mono text-[10px] font-bold shadow-[0_0_15px_rgba(34,211,238,0.95)] whitespace-nowrap mb-1 flex items-center gap-1">
              <span>🏁</span>
              <span>PARK (Drag me)</span>
            </div>
            <div class="w-4 h-4 bg-cyan-400 rotate-45 border-2 border-white shadow-[0_0_15px_rgba(34,211,238,0.9)]"></div>
          </div>
        `;

        const destIcon = L.divIcon({
          className: 'custom-dest-pin',
          html: destMarkerHtml,
          iconSize: [140, 40],
          iconAnchor: [70, 36],
        });

        const destMarker = L.marker([destLat, destLng], {
          icon: destIcon,
          draggable: true,
          zIndexOffset: 990,
        }).addTo(map);

        destMarker.on('dragend', async (e: any) => {
          const pos = e.target.getLatLng();
          const coords: [number, number] = [pos.lat, pos.lng];
          await setDestinationPoint(
            coords,
            `Custom Park (${pos.lat.toFixed(3)}, ${pos.lng.toFixed(3)})`,
            'Direct Parking Gate'
          );
        });

        destinationMarkerRef.current = destMarker;
      }

      // Click anywhere on the map to show contextual action popup
      map.on('click', (e: any) => {
        const { lat, lng } = e.latlng;
        const distFromStart = calculateHaversineDistanceKm(startLocation, [lat, lng]);

        const popupContent = document.createElement('div');
        popupContent.className = 'p-2 space-y-2 font-sans text-xs min-w-[220px]';
        popupContent.innerHTML = `
          <div class="font-mono text-[10px] text-emerald-400 font-bold uppercase tracking-wider flex justify-between">
            <span>TACTICAL MAP POINT</span>
            <span class="text-slate-400">${distFromStart} km away</span>
          </div>
          <div class="text-[11px] text-slate-300 font-mono">
            ${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E
          </div>
          <div class="flex flex-col gap-1.5 pt-1">
            <button id="set-as-start-btn" class="w-full text-left px-2.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] font-mono transition-colors flex items-center gap-1.5">
              <span>📍</span>
              <span>Set as Route Start (Origin)</span>
            </button>
            <button id="set-as-dest-btn" class="w-full text-left px-2.5 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-[11px] font-mono transition-colors flex items-center gap-1.5 font-bold">
              <span>🏁</span>
              <span>Set as Park (Destination)</span>
            </button>
            <button id="search-nearby-btn" class="w-full text-left px-2.5 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[11px] font-mono transition-colors flex items-center gap-1.5">
              <span>🅿️</span>
              <span>Filter Parking Within Radius</span>
            </button>
          </div>
        `;

        const popup = L.popup({
          className: 'tactical-map-popup',
          closeButton: false,
          offset: [0, -10],
        })
          .setLatLng([lat, lng])
          .setContent(popupContent)
          .openOn(map);

        setTimeout(() => {
          const setStartBtn = popupContent.querySelector('#set-as-start-btn');
          const setDestBtn = popupContent.querySelector('#set-as-dest-btn');
          const searchNearbyBtn = popupContent.querySelector('#search-nearby-btn');

          if (setStartBtn) {
            setStartBtn.addEventListener('click', async () => {
              await setCustomStartPoint([lat, lng], `Custom Start (${lat.toFixed(3)}, ${lng.toFixed(3)})`);
              map.closePopup();
            });
          }

          if (setDestBtn) {
            setDestBtn.addEventListener('click', async () => {
              await setDestinationPoint([lat, lng], `Custom Park (${lat.toFixed(3)}, ${lng.toFixed(3)})`, 'Direct Gate');
              map.closePopup();
            });
          }

          if (searchNearbyBtn) {
            searchNearbyBtn.addEventListener('click', () => {
              setUserLocation([lat, lng]);
              map.closePopup();
            });
          }
        }, 10);
      });

      mapInstanceRef.current = map;
    };

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isMounted, activeKey, isMapboxPk]);

  // 2. Update Map Tiles when themeMode or layerType changes
  useEffect(() => {
    if (!tileLayerRef.current) return;
    const nextUrl = getTileUrl(layerType, themeMode);
    tileLayerRef.current.setUrl(nextUrl);
  }, [themeMode, layerType]);

  // 3. Update Start Marker Position & Icon
  useEffect(() => {
    if (!startMarkerRef.current || !mapInstanceRef.current) return;

    const updateMarker = async () => {
      const L = (await import('leaflet')).default || (await import('leaflet'));
      const [startLat, startLng] = startLocation;

      const markerHtml = isCustomStartPoint
        ? `
          <div class="relative flex flex-col items-center group cursor-grab active:cursor-grabbing">
            <div class="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-mono text-[10px] font-bold shadow-[0_0_12px_rgba(245,158,11,0.9)] whitespace-nowrap mb-1">
              📍 START (Drag me)
            </div>
            <div class="w-4 h-4 bg-amber-400 rotate-45 border-2 border-white shadow-[0_0_15px_rgba(245,158,11,0.9)]"></div>
          </div>
        `
        : `
          <div class="relative flex flex-col items-center group cursor-grab active:cursor-grabbing">
            <div class="px-2 py-0.5 rounded-full bg-emerald-400 text-slate-950 font-mono text-[10px] font-bold shadow-[0_0_12px_rgba(16,185,129,0.9)] whitespace-nowrap mb-1">
              🟢 START (Drag me)
            </div>
            <div class="relative flex items-center justify-center">
              <div class="absolute -inset-2 bg-emerald-500/30 rounded-full animate-ping"></div>
              <div class="w-4 h-4 bg-emerald-400 rounded-full border-2 border-white shadow-[0_0_12px_rgba(16,185,129,0.9)]"></div>
            </div>
          </div>
        `;

      const startIcon = L.divIcon({
        className: 'custom-start-pin',
        html: markerHtml,
        iconSize: [120, 40],
        iconAnchor: [60, 36],
      });

      startMarkerRef.current.setIcon(startIcon);
      startMarkerRef.current.setLatLng([startLat, startLng]);
    };

    updateMarker();
  }, [startLocation, isCustomStartPoint]);

  // 4. Update Destination Marker
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const updateDestMarker = async () => {
      const L = (await import('leaflet')).default || (await import('leaflet'));
      const map = mapInstanceRef.current;

      if (!destinationLocation) {
        if (destinationMarkerRef.current) {
          map.removeLayer(destinationMarkerRef.current);
          destinationMarkerRef.current = null;
        }
        return;
      }

      const [destLat, destLng] = destinationLocation;
      const destMarkerHtml = `
        <div class="relative flex flex-col items-center group cursor-grab active:cursor-grabbing">
          <div class="px-2 py-0.5 rounded-full bg-cyan-400 text-slate-950 font-mono text-[10px] font-bold shadow-[0_0_15px_rgba(34,211,238,0.95)] whitespace-nowrap mb-1 flex items-center gap-1">
            <span>🏁</span>
            <span>PARK (Drag me)</span>
          </div>
          <div class="w-4 h-4 bg-cyan-400 rotate-45 border-2 border-white shadow-[0_0_15px_rgba(34,211,238,0.9)]"></div>
        </div>
      `;

      const destIcon = L.divIcon({
        className: 'custom-dest-pin',
        html: destMarkerHtml,
        iconSize: [140, 40],
        iconAnchor: [70, 36],
      });

      if (destinationMarkerRef.current) {
        destinationMarkerRef.current.setIcon(destIcon);
        destinationMarkerRef.current.setLatLng([destLat, destLng]);
      } else {
        const destMarker = L.marker([destLat, destLng], {
          icon: destIcon,
          draggable: true,
          zIndexOffset: 990,
        }).addTo(map);

        destMarker.on('dragend', async (e: any) => {
          const pos = e.target.getLatLng();
          const coords: [number, number] = [pos.lat, pos.lng];
          await setDestinationPoint(
            coords,
            `Custom Park (${pos.lat.toFixed(3)}, ${pos.lng.toFixed(3)})`,
            'Direct Parking Gate'
          );
        });

        destinationMarkerRef.current = destMarker;
      }
    };

    updateDestMarker();
  }, [destinationLocation, setDestinationPoint]);

  // 5. Draw / Update Radar Proximity Radius Circle
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const drawRadius = async () => {
      const L = (await import('leaflet')).default || (await import('leaflet'));
      const map = mapInstanceRef.current;

      const centerCoord = isCustomDestination && destinationLocation ? destinationLocation : startLocation;

      if (radiusCircleRef.current) {
        map.removeLayer(radiusCircleRef.current);
        radiusCircleRef.current = null;
      }

      const circle = L.circle(centerCoord, {
        radius: radiusKm * 1000,
        color: '#10b981',
        weight: 1.5,
        opacity: 0.7,
        dashArray: '4, 8',
        fillColor: '#10b981',
        fillOpacity: 0.04,
      }).addTo(map);

      radiusCircleRef.current = circle;
    };

    drawRadius();
  }, [startLocation, destinationLocation, isCustomDestination, radiusKm]);

  // 6. Render Parking Lot Tactical Pins with Proximity Metrics & Dynamic Pricing
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    const renderPins = async () => {
      const L = (await import('leaflet')).default || (await import('leaflet'));
      const markersLayer = markersLayerRef.current;
      markersLayer.clearLayers();

      const displayedLots = availabilityFilter === 'available_only'
        ? rankedLots.filter((lot) => lot.availableBays > 0)
        : rankedLots;

      displayedLots.forEach((lot) => {
        const isSelected = selectedLotId === lot.id;
        const isResidential = lot.type === 'residential';
        const dynamicRate = vehicleType === 'two-wheeler' ? Math.round(lot.hourlyRate * 0.4) : lot.hourlyRate;
        const isAvailable = lot.availableBays > 0;

        const badgeHtml = lot.badge
          ? `<span class="px-1.5 py-0.2 rounded bg-amber-400 text-slate-950 text-[9px] font-black uppercase tracking-tight shadow-sm">${lot.badge}</span>`
          : '';

        let markerHtml = '';

        if (isAvailable) {
          // ── Radiant Available Marker (Green glowing pin with spots badge & pulse) ──
          const typeIcon = isResidential ? '🏠' : '🏢';
          markerHtml = `
            <div class="cursor-pointer select-none transition-all duration-300 hover:scale-110 group">
              <div class="flex flex-col items-center">
                <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-full ${
                  isSelected
                    ? 'bg-emerald-400 text-slate-950 font-black shadow-[0_0_24px_rgba(16,185,129,1)] ring-2 ring-white scale-110'
                    : 'bg-[#0e291f] text-emerald-300 shadow-[0_4px_18px_rgba(16,185,129,0.5)] border-2 border-emerald-400/80 hover:border-emerald-300'
                } font-mono font-bold text-xs">
                  <span class="relative flex h-2 w-2">
                    <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                  </span>
                  <span class="text-sm">${typeIcon}</span>
                  <span class="tracking-tight text-white font-black">₹${dynamicRate}/hr</span>
                  <span class="px-1.5 py-0.2 rounded-full bg-emerald-500/25 border border-emerald-400/50 text-[10px] text-emerald-300 font-extrabold tracking-tight">
                    ${lot.availableBays} SPOTS
                  </span>
                  ${badgeHtml}
                </div>
                <div class="w-2.5 h-2.5 bg-[#0e291f] rotate-45 mx-auto -mt-1 border-r-2 border-b-2 border-emerald-400/80 shadow-md"></div>
              </div>
            </div>
          `;
        } else {
          // ── Unavailable / Full Marker (Muted Charcoal with ruby-red accent & lock) ──
          markerHtml = `
            <div class="cursor-pointer select-none transition-all duration-300 hover:scale-105 opacity-80 hover:opacity-100 group">
              <div class="flex flex-col items-center">
                <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-full ${
                  isSelected
                    ? 'bg-rose-500 text-white font-black shadow-[0_0_20px_rgba(244,63,94,0.9)] ring-2 ring-white scale-105'
                    : 'bg-[#181316] text-rose-300 shadow-[0_4px_14px_rgba(0,0,0,0.8)] border border-rose-500/40'
                } font-mono font-bold text-xs">
                  <span class="text-[11px]">🔒</span>
                  <span class="line-through text-slate-500 text-[11px]">₹${dynamicRate}/hr</span>
                  <span class="px-1.5 py-0.2 rounded-full bg-rose-500/20 border border-rose-500/40 text-[9px] text-rose-300 font-extrabold uppercase tracking-wider">
                    FULL
                  </span>
                </div>
                <div class="w-2.5 h-2.5 bg-[#181316] rotate-45 mx-auto -mt-1 border-r border-b border-rose-500/40 shadow-sm"></div>
              </div>
            </div>
          `;
        }

        const customIcon = L.divIcon({
          className: 'custom-lot-pin',
          html: markerHtml,
          iconSize: [160, 44],
          iconAnchor: [80, 38],
        });

        const [lat, lng] = lot.coordinates;
        const marker = L.marker([lat, lng], {
          icon: customIcon,
          zIndexOffset: isSelected ? 500 : isAvailable ? 150 : 80,
        });

        marker.on('click', () => {
          selectLot(lot.id);
        });

        marker.addTo(markersLayer);
      });
    };

    renderPins();
  }, [rankedLots, selectedLotId, selectLot, vehicleType, availabilityFilter]);

  // 7. Pan & Zoom to selected lot
  useEffect(() => {
    if (!selectedLotId || !mapInstanceRef.current || isNavigating) return;
    const lot = parkingLots.find((l) => l.id === selectedLotId);
    if (lot) {
      const [lat, lng] = lot.coordinates;
      mapInstanceRef.current.flyTo([lat, lng], 16, { duration: 0.9 });
    }
  }, [selectedLotId, parkingLots, isNavigating]);

  // 8. Draw Turn-by-Turn GPS Navigation Route Polyline
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const renderRoute = async () => {
      const L = (await import('leaflet')).default || (await import('leaflet'));
      const map = mapInstanceRef.current;

      if (routeLayersRef.current.glow) {
        map.removeLayer(routeLayersRef.current.glow);
      }
      if (routeLayersRef.current.core) {
        map.removeLayer(routeLayersRef.current.core);
      }
      routeLayersRef.current = {};

      if (activeRoute && activeRoute.coordinates.length > 0) {
        const latLngs: [number, number][] = activeRoute.coordinates.map(([lng, lat]) => [lat, lng]);

        const glow = L.polyline(latLngs, {
          color: '#10b981',
          weight: 10,
          opacity: 0.45,
          lineCap: 'round',
          lineJoin: 'round',
        }).addTo(map);

        const core = L.polyline(latLngs, {
          color: '#4edea3',
          weight: 4.5,
          opacity: 1.0,
          lineCap: 'round',
          lineJoin: 'round',
        }).addTo(map);

        routeLayersRef.current = { glow, core };

        map.fitBounds(core.getBounds(), { padding: [70, 70], animate: true });
      }
    };

    renderRoute();
  }, [activeRoute]);

  // 9. Simulated Driving Car Marker
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const updateSimulatedVehicle = async () => {
      const L = (await import('leaflet')).default || (await import('leaflet'));
      const map = mapInstanceRef.current;

      if (!simulation || (!simulation.isSimulating && simulation.progressPercent === 0)) {
        if (simulatedCarMarkerRef.current) {
          map.removeLayer(simulatedCarMarkerRef.current);
          simulatedCarMarkerRef.current = null;
        }
        return;
      }

      const [simLat, simLng] = simulation.currentCoord;

      const simMarkerHtml = `
        <div class="relative flex flex-col items-center">
          <div class="px-2 py-0.5 rounded-full bg-emerald-400 text-slate-950 font-mono text-[9px] font-black shadow-[0_0_15px_rgba(16,185,129,0.9)] whitespace-nowrap mb-1">
            🚘 SIMULATED DRIVER (${simulation.progressPercent}%)
          </div>
          <div class="relative flex items-center justify-center">
            <div class="w-8 h-8 rounded-full bg-emerald-500/40 animate-ping absolute"></div>
            <div class="w-6 h-6 rounded-full bg-emerald-400 border-2 border-white shadow-lg flex items-center justify-center text-slate-950 font-bold text-xs">
              ⚡
            </div>
          </div>
        </div>
      `;

      const simIcon = L.divIcon({
        className: 'sim-vehicle-pin',
        html: simMarkerHtml,
        iconSize: [140, 40],
        iconAnchor: [70, 32],
      });

      if (simulatedCarMarkerRef.current) {
        simulatedCarMarkerRef.current.setIcon(simIcon);
        simulatedCarMarkerRef.current.setLatLng([simLat, simLng]);
      } else {
        const marker = L.marker([simLat, simLng], {
          icon: simIcon,
          zIndexOffset: 1200,
        }).addTo(map);
        simulatedCarMarkerRef.current = marker;
      }
    };

    updateSimulatedVehicle();
  }, [simulation]);

  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      const [lat, lng] = startLocation;
      mapInstanceRef.current.flyTo([lat, lng], 15, { duration: 1 });
    }
  };

  const handleZoomIn = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomIn();
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomOut();
  };

  const toggleLayer = () => {
    setLayerType((prev) => (prev === 'streets' ? 'satellite' : 'streets'));
  };

  return (
    <div className="relative w-full h-full min-h-screen overflow-hidden bg-[#0a0e16]">
      {/* Map Container */}
      <div
        className="w-full h-full min-h-screen transition-transform duration-700 ease-out origin-bottom"
        style={{
          transform: is3DMode ? 'perspective(900px) rotateX(25deg) scale(1.05)' : 'none',
        }}
      >
        <div ref={mapContainerRef} className="w-full h-full min-h-screen z-0" />
      </div>

      {/* Floating Availability Legend & Filter (Bottom-Left) */}
      <div className="absolute bottom-6 left-6 z-30 pointer-events-auto hidden sm:flex items-center gap-1.5 p-1.5 rounded-2xl bg-[#0f131c]/90 backdrop-blur-xl border border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.6)] font-mono text-xs">
        <button
          type="button"
          onClick={() => setAvailabilityFilter('all')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all font-heading font-medium text-xs ${
            availabilityFilter === 'all'
              ? 'bg-white/15 text-white border border-white/20 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <span>All Spaces</span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/10 text-slate-300">
            {rankedLots.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setAvailabilityFilter('available_only')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all font-heading font-medium text-xs ${
            availabilityFilter === 'available_only'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
              : 'text-emerald-400/80 hover:text-emerald-300'
          }`}
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
          </span>
          <span>Available Now</span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/25 text-emerald-300 font-bold">
            {availableCount}
          </span>
        </button>

        {fullCount > 0 && (
          <div className="flex items-center gap-1 px-2.5 py-1 text-slate-500 text-[11px] font-mono border-l border-white/10">
            <span>🔒</span>
            <span>{fullCount} Full</span>
          </div>
        )}
      </div>

      {/* Floating Tactical Map Controls (Bottom-Right) */}
      <div className="absolute bottom-6 right-6 flex flex-col gap-2.5 z-30 pointer-events-auto">
        {/* Reset to GPS Location */}
        {isCustomStartPoint && (
          <button
            type="button"
            onClick={resetToGpsLocation}
            className="glass-panel w-10 h-10 rounded-full flex items-center justify-center text-amber-400 border border-amber-400 bg-amber-500/20 hover:bg-amber-500/30 transition-all shadow-lg active:scale-95 animate-pulse"
            title="Reset Start Point to My Live GPS"
          >
            <LocateFixed className="w-4 h-4" />
          </button>
        )}

        {/* Layer Mode Toggle (Streets vs Satellite) */}
        <button
          type="button"
          onClick={toggleLayer}
          className={`glass-panel w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-lg active:scale-95 ${
            layerType === 'satellite'
              ? 'text-sky-400 border-sky-400/50 bg-sky-500/20'
              : 'text-on-surface-variant hover:text-white'
          }`}
          title="Toggle Satellite Imagery"
        >
          <Layers className="w-4 h-4" />
        </button>

        {/* 3D Perspective Tilt Toggle */}
        <button
          type="button"
          onClick={() => setIs3DMode(!is3DMode)}
          className={`glass-panel w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-lg active:scale-95 ${
            is3DMode
              ? 'text-emerald-400 border-emerald-400/50 bg-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.4)]'
              : 'text-on-surface-variant hover:text-white'
          }`}
          title="Toggle 3D Angle"
        >
          <Compass className="w-4 h-4" />
        </button>

        {/* Zoom In */}
        <button
          type="button"
          onClick={handleZoomIn}
          className="glass-panel w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:text-white transition-all shadow-lg active:scale-95"
          title="Zoom In"
        >
          <Plus className="w-4 h-4" />
        </button>

        {/* Zoom Out */}
        <button
          type="button"
          onClick={handleZoomOut}
          className="glass-panel w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:text-white transition-all shadow-lg active:scale-95"
          title="Zoom Out"
        >
          <Minus className="w-4 h-4" />
        </button>

        {/* Recenter */}
        <button
          type="button"
          onClick={handleRecenter}
          className="glass-panel w-10 h-10 rounded-full flex items-center justify-center text-emerald-400 hover:text-emerald-300 transition-all shadow-lg active:scale-95"
          title="Center on Origin Point"
        >
          <Navigation className="w-4 h-4" />
        </button>
      </div>

      {/* Mapbox Token Config Modal */}
      {isSettingsOpen && (
        <MapboxConfigModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      )}
    </div>
  );
}
