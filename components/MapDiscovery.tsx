'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useParkingStore } from '@/lib/store';
import { ParkingLot } from '@/lib/types';
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
  Flag
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
  const routeLayersRef = useRef<{ glow?: any; core?: any }>({});

  const [is3DMode, setIs3DMode] = useState(false);
  const [layerType, setLayerType] = useState<'streets' | 'satellite'>('streets');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const themeMode = useParkingStore((s) => s.themeMode);
  const parkingLots = useParkingStore((s) => s.parkingLots);
  const selectedLotId = useParkingStore((s) => s.selectedLotId);
  const selectLot = useParkingStore((s) => s.selectLot);
  
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

  // Filter lots based on query and vehicle compatibility
  const filteredLots = parkingLots.filter((lot) => {
    const matchesVehicle = lot.supportedVehicles.includes(vehicleType);
    if (!matchesVehicle) return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      lot.name.toLowerCase().includes(q) ||
      lot.locality.toLowerCase().includes(q) ||
      lot.address.toLowerCase().includes(q)
    );
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 1. Initialize Leaflet Map Instance
  useEffect(() => {
    if (!isMounted || !mapContainerRef.current) return;

    let map: any = null;

    const initMap = async () => {
      const L = (await import('leaflet')).default || (await import('leaflet'));

      // If map exists already, clean it up
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

      // Draggable Start Point / GPS Location Marker
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

      // Click anywhere on the map to show tactical action popup
      map.on('click', (e: any) => {
        const { lat, lng } = e.latlng;
        const popupContent = document.createElement('div');
        popupContent.className = 'p-2 space-y-2 font-sans text-xs min-w-[210px]';
        popupContent.innerHTML = `
          <div class="font-mono text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
            TACTICAL MAP COORDINATE
          </div>
          <div class="text-[11px] text-slate-400 font-mono">
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
              <span>Explore Parking Bays Here</span>
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

  // 4. Update Destination / Park Marker
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

  // 5. Render Parking Lot Tactical Pins
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    const renderPins = async () => {
      const L = (await import('leaflet')).default || (await import('leaflet'));
      const markersLayer = markersLayerRef.current;
      markersLayer.clearLayers();

      filteredLots.forEach((lot) => {
        const isSelected = selectedLotId === lot.id;
        const isResidential = lot.type === 'residential';

        const markerHtml = isResidential
          ? `
            <div class="cursor-pointer select-none transition-transform hover:scale-105 group">
              <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-full ${
                isSelected
                  ? 'bg-emerald-400 text-slate-950 font-black shadow-[0_0_20px_rgba(16,185,129,0.95)] ring-2 ring-white scale-110'
                  : 'bg-[#10b981] text-[#003824] shadow-[0_4px_16px_rgba(16,185,129,0.45)] border border-emerald-300/40'
              } font-mono font-bold text-xs">
                <span class="text-sm">🏠</span>
                <span class="tracking-tight">₹${lot.hourlyRate}/hr</span>
                <span class="opacity-40">•</span>
                <span class="text-[11px] font-sans font-semibold">${lot.availableBays} Left</span>
              </div>
              <div class="w-2.5 h-2.5 bg-[#10b981] rotate-45 mx-auto -mt-1 shadow-sm"></div>
            </div>
          `
          : `
            <div class="cursor-pointer select-none transition-transform hover:scale-105 group">
              <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-full ${
                isSelected
                  ? 'bg-sky-400 text-slate-950 font-black shadow-[0_0_20px_rgba(56,189,248,0.95)] ring-2 ring-white scale-110'
                  : 'bg-[#161c28] text-[#e2e8f0] shadow-[0_4px_16px_rgba(0,0,0,0.8)] border border-emerald-400/50'
              } font-mono font-bold text-xs">
                <span class="text-sm">🏢</span>
                <span class="tracking-tight">₹${lot.hourlyRate}/hr</span>
                <span class="opacity-40">•</span>
                <span class="text-[11px] font-sans font-semibold text-emerald-400">${lot.availableBays} Left</span>
              </div>
              <div class="w-2.5 h-2.5 bg-[#161c28] rotate-45 mx-auto -mt-1 border-r border-b border-emerald-400/50 shadow-sm"></div>
            </div>
          `;

        const customIcon = L.divIcon({
          className: 'custom-lot-pin',
          html: markerHtml,
          iconSize: [120, 36],
          iconAnchor: [60, 36],
        });

        const [lat, lng] = lot.coordinates;
        const marker = L.marker([lat, lng], {
          icon: customIcon,
          zIndexOffset: isSelected ? 500 : 100,
        });

        marker.on('click', () => {
          selectLot(lot.id);
        });

        marker.addTo(markersLayer);
      });
    };

    renderPins();
  }, [filteredLots, selectedLotId, selectLot]);

  // 6. Pan & Zoom to selected lot
  useEffect(() => {
    if (!selectedLotId || !mapInstanceRef.current || isNavigating) return;
    const lot = parkingLots.find((l) => l.id === selectedLotId);
    if (lot) {
      const [lat, lng] = lot.coordinates;
      mapInstanceRef.current.flyTo([lat, lng], 16, { duration: 0.9 });
    }
  }, [selectedLotId, parkingLots, isNavigating]);

  // 7. Draw Turn-by-Turn GPS Navigation Route Polyline
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const renderRoute = async () => {
      const L = (await import('leaflet')).default || (await import('leaflet'));
      const map = mapInstanceRef.current;

      // Clean up previous route layers
      if (routeLayersRef.current.glow) {
        map.removeLayer(routeLayersRef.current.glow);
      }
      if (routeLayersRef.current.core) {
        map.removeLayer(routeLayersRef.current.core);
      }
      routeLayersRef.current = {};

      if (activeRoute && activeRoute.coordinates.length > 0) {
        const latLngs: [number, number][] = activeRoute.coordinates.map(([lng, lat]) => [lat, lng]);

        // Glowing Halo Layer
        const glow = L.polyline(latLngs, {
          color: '#10b981',
          weight: 10,
          opacity: 0.45,
          lineCap: 'round',
          lineJoin: 'round',
        }).addTo(map);

        // Crisp Core Tactical Line
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

  // Recenter to active start location
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
      {/* 2D / 3D Perspective Container */}
      <div
        className="w-full h-full min-h-screen transition-transform duration-700 ease-out origin-bottom"
        style={{
          transform: is3DMode ? 'perspective(900px) rotateX(25deg) scale(1.05)' : 'none',
        }}
      >
        <div ref={mapContainerRef} className="w-full h-full min-h-screen z-0" />
      </div>

      {/* Floating Tactical Map Controls (Bottom-Right) */}
      <div className="absolute bottom-6 right-6 flex flex-col gap-2.5 z-30 pointer-events-auto">
        {/* Reset to GPS Location (shows when custom start point is set) */}
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
              ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-400'
              : 'text-on-surface hover:text-emerald-400 hover:border-emerald-500/40 border border-white/10'
          }`}
          title={`Switch Map Layer (Current: ${layerType === 'streets' ? 'Streets' : 'Satellite'})`}
        >
          <Layers className="w-4 h-4" />
        </button>

        {/* 2D / 3D Perspective Tilt Mode Toggle */}
        <button
          type="button"
          onClick={() => setIs3DMode(!is3DMode)}
          className={`glass-panel w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-lg active:scale-95 ${
            is3DMode
              ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-400'
              : 'text-on-surface hover:text-white border border-white/10'
          }`}
          title="Toggle 2D / 3D Perspective"
        >
          <Eye className="w-4 h-4" />
        </button>

        {/* Settings / API Key Modal Button */}
        <button
          type="button"
          onClick={() => setIsSettingsOpen(true)}
          className="glass-panel w-10 h-10 rounded-full flex items-center justify-center text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/20 transition-all shadow-lg active:scale-95"
          title="Map API Credentials & Settings"
        >
          <Settings2 className="w-4 h-4" />
        </button>

        {/* Recenter Button */}
        <button
          type="button"
          onClick={handleRecenter}
          className="glass-panel w-10 h-10 rounded-full flex items-center justify-center text-on-surface hover:text-emerald-400 hover:border-emerald-500/40 border border-white/10 transition-all shadow-lg active:scale-95"
          title="Recenter Map to Active Origin Coordinates"
        >
          <Navigation className="w-4 h-4 text-emerald-400" />
        </button>

        {/* Zoom In/Out Controls */}
        <div className="flex flex-col glass-panel rounded-xl overflow-hidden shadow-lg border border-white/10">
          <button
            type="button"
            onClick={handleZoomIn}
            className="w-10 h-10 flex items-center justify-center text-on-surface hover:text-white hover:bg-white/10 transition-colors border-b border-white/10 active:scale-95"
            title="Zoom In"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            className="w-10 h-10 flex items-center justify-center text-on-surface hover:text-white hover:bg-white/10 transition-colors active:scale-95"
            title="Zoom Out"
          >
            <Minus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Subtle Legend & Origin Bar on bottom left */}
      <div className="hidden sm:flex absolute bottom-6 left-6 items-center gap-3 px-3.5 py-2 rounded-xl glass-panel text-[11px] font-mono text-on-surface-variant z-30 border border-white/10 shadow-lg pointer-events-auto">
        <div className="flex items-center gap-1.5">
          <span className={`w-2.5 h-2.5 rounded-full ${isCustomStartPoint ? 'bg-amber-400' : 'bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]'}`}></span>
          <span className="text-white font-semibold">{isCustomStartPoint ? 'Custom Start' : 'Live GPS'}</span>
        </div>
        <span className="opacity-30">•</span>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]"></span>
          <span className="text-white font-semibold">{destinationName ? 'Park Set' : 'Select Bay'}</span>
        </div>
        <span className="opacity-30">•</span>
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-emerald-300 font-semibold">
            {layerType === 'satellite'
              ? 'Satellite Hybrid'
              : themeMode === 'light'
              ? 'Streets Light'
              : 'Streets Dark'}
          </span>
        </div>
        {activeRoute && (
          <>
            <span className="opacity-30">•</span>
            <div className="flex items-center gap-1.5 text-emerald-300 font-semibold">
              <Route className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>Route: {activeRoute.distanceKm}km</span>
            </div>
          </>
        )}
      </div>

      {/* Mapbox / MapTiler Configuration Modal */}
      <MapboxConfigModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}
