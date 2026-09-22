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
            <div class="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-200 font-sans text-[11px] font-medium shadow-sm whitespace-nowrap mb-0.5">
              Start
            </div>
            <div class="w-3.5 h-3.5 rounded-full bg-amber-500 border-2 border-white shadow-sm"></div>
          </div>
        `
        : `
          <div class="relative flex flex-col items-center group cursor-grab active:cursor-grabbing">
            <div class="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-200 font-sans text-[11px] font-medium shadow-sm whitespace-nowrap mb-0.5">
              Start
            </div>
            <div class="w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white shadow-sm"></div>
          </div>
        `;

      const startIcon = L.divIcon({
        className: 'custom-start-pin',
        html: startMarkerHtml,
        iconSize: [80, 36],
        iconAnchor: [40, 32],
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
            <div class="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-200 font-sans text-[11px] font-medium shadow-sm whitespace-nowrap mb-0.5">
              Destination
            </div>
            <div class="w-3.5 h-3.5 rounded-full bg-sky-500 border-2 border-white shadow-sm"></div>
          </div>
        `;

        const destIcon = L.divIcon({
          className: 'custom-dest-pin',
          html: destMarkerHtml,
          iconSize: [90, 36],
          iconAnchor: [45, 32],
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
        popupContent.className = 'p-2 space-y-2 font-sans text-xs min-w-[200px]';
        popupContent.innerHTML = `
          <div class="text-[11px] font-semibold text-slate-200 flex justify-between">
            <span>Location</span>
            <span class="text-slate-400 font-normal">${distFromStart} km away</span>
          </div>
          <div class="text-[11px] text-slate-400 font-mono">
            ${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E
          </div>
          <div class="flex flex-col gap-1 pt-1">
            <button id="set-as-start-btn" class="w-full text-left px-2.5 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs transition-colors">
              Set as Origin
            </button>
            <button id="set-as-dest-btn" class="w-full text-left px-2.5 py-1.5 rounded-md bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-700/60 text-xs font-medium transition-colors">
              Set as Destination
            </button>
            <button id="search-nearby-btn" class="w-full text-left px-2.5 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs transition-colors">
              Search Parking Nearby
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
            <div class="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-200 font-sans text-[11px] font-medium shadow-sm whitespace-nowrap mb-0.5">
              Start
            </div>
            <div class="w-3.5 h-3.5 rounded-full bg-amber-500 border-2 border-white shadow-sm"></div>
          </div>
        `
        : `
          <div class="relative flex flex-col items-center group cursor-grab active:cursor-grabbing">
            <div class="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-200 font-sans text-[11px] font-medium shadow-sm whitespace-nowrap mb-0.5">
              Start
            </div>
            <div class="w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white shadow-sm"></div>
          </div>
        `;

      const startIcon = L.divIcon({
        className: 'custom-start-pin',
        html: markerHtml,
        iconSize: [80, 36],
        iconAnchor: [40, 32],
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
          <div class="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-200 font-sans text-[11px] font-medium shadow-sm whitespace-nowrap mb-0.5">
            Destination
          </div>
          <div class="w-3.5 h-3.5 rounded-full bg-sky-500 border-2 border-white shadow-sm"></div>
        </div>
      `;

      const destIcon = L.divIcon({
        className: 'custom-dest-pin',
        html: destMarkerHtml,
        iconSize: [90, 36],
        iconAnchor: [45, 32],
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
        const dynamicRate = vehicleType === 'two-wheeler' ? Math.round(lot.hourlyRate * 0.4) : lot.hourlyRate;
        const isAvailable = lot.availableBays > 0;

        const badgeHtml = lot.badge
          ? `<span class="px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[9px] font-semibold uppercase tracking-tight">${lot.badge}</span>`
          : '';

        let markerHtml = '';

        if (isAvailable) {
          // ── Bespoke Available Marker (Crisp slate pill with emerald indicator) ──
          markerHtml = `
            <div class="cursor-pointer select-none transition-transform duration-150 hover:-translate-y-0.5 group">
              <div class="flex flex-col items-center">
                <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-md ${
                  isSelected
                    ? 'bg-slate-900 text-white font-semibold border-2 border-emerald-400 shadow-md scale-105'
                    : 'bg-slate-900/95 text-slate-100 border border-slate-700/80 hover:border-emerald-500/60 shadow-sm'
                } text-xs">
                  <span class="w-2 h-2 rounded-full bg-emerald-400 shrink-0"></span>
                  <span class="font-semibold text-white">₹${dynamicRate}</span>
                  <span class="text-slate-400 text-[11px]">/hr</span>
                  <span class="ml-0.5 px-1 py-0.2 rounded bg-emerald-500/15 text-emerald-300 text-[10px] font-medium">
                    ${lot.availableBays} bays
                  </span>
                  ${badgeHtml}
                </div>
                <div class="w-2 h-2 bg-slate-900 rotate-45 mx-auto -mt-1 border-r border-b ${
                  isSelected ? 'border-emerald-400' : 'border-slate-700/80'
                }"></div>
              </div>
            </div>
          `;
        } else {
          // ── Bespoke Unavailable / Full Marker (Muted slate with subtle red dot) ──
          markerHtml = `
            <div class="cursor-pointer select-none transition-transform duration-150 hover:-translate-y-0.5 opacity-75 hover:opacity-100 group">
              <div class="flex flex-col items-center">
                <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-md ${
                  isSelected
                    ? 'bg-slate-900 text-slate-300 font-semibold border-2 border-rose-400 shadow-md scale-105'
                    : 'bg-slate-900/90 text-slate-400 border border-slate-800 shadow-sm'
                } text-xs">
                  <span class="w-1.5 h-1.5 rounded-full bg-rose-400/80 shrink-0"></span>
                  <span class="line-through text-slate-500 text-[11px]">₹${dynamicRate}/hr</span>
                  <span class="px-1 py-0.2 rounded bg-rose-500/10 text-rose-300/90 text-[10px] font-medium">
                    Full
                  </span>
                </div>
                <div class="w-2 h-2 bg-slate-900 rotate-45 mx-auto -mt-1 border-r border-b ${
                  isSelected ? 'border-rose-400' : 'border-slate-800'
                }"></div>
              </div>
            </div>
          `;
        }

        const customIcon = L.divIcon({
          className: 'custom-lot-pin',
          html: markerHtml,
          iconSize: [140, 36],
          iconAnchor: [70, 32],
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
          <div class="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-200 font-sans text-[10px] font-medium shadow-sm whitespace-nowrap mb-1">
            En Route (${simulation.progressPercent}%)
          </div>
          <div class="w-5 h-5 rounded-full bg-emerald-500 border-2 border-white shadow-md flex items-center justify-center text-slate-950 font-bold text-[10px]">
            ▲
          </div>
        </div>
      `;

      const simIcon = L.divIcon({
        className: 'sim-vehicle-pin',
        html: simMarkerHtml,
        iconSize: [100, 36],
        iconAnchor: [50, 30],
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
      <div className="absolute bottom-6 left-6 z-30 pointer-events-auto hidden sm:flex items-center gap-1 p-1 rounded-lg bg-slate-900/95 backdrop-blur-md border border-slate-800 shadow-lg text-xs font-sans">
        <button
          type="button"
          onClick={() => setAvailabilityFilter('all')}
          className={`px-3 py-1.5 rounded-md transition-colors font-medium text-xs ${
            availabilityFilter === 'all'
              ? 'bg-slate-800 text-white shadow-xs'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <span>All Spaces</span>
          <span className="ml-1.5 text-[11px] text-slate-500 font-mono">
            {rankedLots.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setAvailabilityFilter('available_only')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors font-medium text-xs ${
            availabilityFilter === 'available_only'
              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
              : 'text-slate-400 hover:text-emerald-300'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>Available Now</span>
          <span className="ml-0.5 text-[11px] text-emerald-400 font-mono font-semibold">
            {availableCount}
          </span>
        </button>

        {fullCount > 0 && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 text-slate-500 text-[11px] border-l border-slate-800">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500/70" />
            <span>{fullCount} Full</span>
          </div>
        )}
      </div>

      {/* Floating Tactical Map Controls (Bottom-Right) */}
      <div className="absolute bottom-6 right-6 flex flex-col gap-2 z-30 pointer-events-auto">
        {/* Reset to GPS Location */}
        {isCustomStartPoint && (
          <button
            type="button"
            onClick={resetToGpsLocation}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-amber-400 bg-slate-900/95 border border-slate-800 hover:bg-slate-800 transition-colors shadow-md active:scale-95"
            title="Reset Start Point to My Live GPS"
          >
            <LocateFixed className="w-4 h-4" />
          </button>
        )}

        {/* Layer Mode Toggle (Streets vs Satellite) */}
        <button
          type="button"
          onClick={toggleLayer}
          className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors shadow-md active:scale-95 ${
            layerType === 'satellite'
              ? 'text-sky-400 bg-sky-950/60 border border-sky-600/50'
              : 'text-slate-400 bg-slate-900/95 border border-slate-800 hover:text-white hover:bg-slate-800'
          }`}
          title="Toggle Satellite Imagery"
        >
          <Layers className="w-4 h-4" />
        </button>

        {/* 3D Perspective Tilt Toggle */}
        <button
          type="button"
          onClick={() => setIs3DMode(!is3DMode)}
          className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors shadow-md active:scale-95 ${
            is3DMode
              ? 'text-emerald-400 bg-emerald-950/60 border border-emerald-600/50'
              : 'text-slate-400 bg-slate-900/95 border border-slate-800 hover:text-white hover:bg-slate-800'
          }`}
          title="Toggle 3D Angle"
        >
          <Compass className="w-4 h-4" />
        </button>

        {/* Zoom In */}
        <button
          type="button"
          onClick={handleZoomIn}
          className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 bg-slate-900/95 border border-slate-800 hover:text-white hover:bg-slate-800 transition-colors shadow-md active:scale-95"
          title="Zoom In"
        >
          <Plus className="w-4 h-4" />
        </button>

        {/* Zoom Out */}
        <button
          type="button"
          onClick={handleZoomOut}
          className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 bg-slate-900/95 border border-slate-800 hover:text-white hover:bg-slate-800 transition-colors shadow-md active:scale-95"
          title="Zoom Out"
        >
          <Minus className="w-4 h-4" />
        </button>

        {/* Recenter */}
        <button
          type="button"
          onClick={handleRecenter}
          className="w-9 h-9 rounded-lg flex items-center justify-center text-emerald-400 bg-slate-900/95 border border-slate-800 hover:bg-slate-800 hover:text-emerald-300 transition-colors shadow-md active:scale-95"
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
