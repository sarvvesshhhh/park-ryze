import { NavigationRoute, RouteStep } from './types';
import { fetchMapboxDirections } from './mapbox';

export async function fetchTurnByTurnRoute(
  start: [number, number], // [lat, lng]
  end: [number, number], // [lat, lng]
  destinationName: string,
  gateName: string,
  mapboxToken?: string,
  originName: string = 'Current Location'
): Promise<NavigationRoute> {
  const [startLat, startLng] = start;
  const [endLat, endLng] = end;

  // 1. Primary: Real Mapbox Directions API
  if (mapboxToken && mapboxToken.trim().startsWith('pk.')) {
    try {
      const route = await fetchMapboxDirections([startLng, startLat], [endLng, endLat], mapboxToken);
      const coordinates: [number, number][] = route.geometry.coordinates; // [[lng, lat]]
      const distanceKm = Number((route.distance / 1000).toFixed(1));
      const durationMins = Math.max(1, Math.round(route.duration / 60));

      const steps: RouteStep[] = [];
      if (route.legs && route.legs[0] && route.legs[0].steps) {
        route.legs[0].steps.forEach((s: any) => {
          steps.push({
            instruction: s.maneuver.instruction || 'Continue straight on route',
            distanceMeters: Math.round(s.distance),
            durationSeconds: Math.round(s.duration),
            maneuverType: s.maneuver.type || 'turn',
            modifier: s.maneuver.modifier,
            location: s.maneuver.location,
          });
        });
      }

      return {
        coordinates,
        distanceKm,
        durationMins,
        steps: steps.length > 0 ? steps : createDefaultSteps(distanceKm, destinationName, gateName),
        destinationName,
        gateName,
        originName,
        startCoords: start,
        destinationCoords: end,
      };
    } catch (err) {
      console.warn('Mapbox directions call failed, attempting fallback:', err);
    }
  }

  // 2. Secondary: Open Source Routing Machine (OSRM) Road API
  try {
    const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson&steps=true`;
    const res = await fetch(osrmUrl);
    if (res.ok) {
      const data = await res.json();
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const coordinates: [number, number][] = route.geometry.coordinates;
        const distanceKm = Number((route.distance / 1000).toFixed(1));
        const durationMins = Math.max(1, Math.round(route.duration / 60));

        const steps: RouteStep[] = [];
        if (route.legs && route.legs[0] && route.legs[0].steps) {
          route.legs[0].steps.forEach((s: any) => {
            const stepName = s.name ? ` onto ${s.name}` : '';
            const modifier = s.maneuver.modifier ? ` ${s.maneuver.modifier}` : '';
            let instruction = s.maneuver.type === 'depart'
              ? `Depart towards ${s.name || 'main road'}`
              : s.maneuver.type === 'arrive'
              ? `Arrive at ${gateName}, ${destinationName}`
              : `Turn${modifier}${stepName}`;

            steps.push({
              instruction,
              distanceMeters: Math.round(s.distance),
              durationSeconds: Math.round(s.duration),
              maneuverType: s.maneuver.type,
              modifier: s.maneuver.modifier,
              location: s.maneuver.location,
            });
          });
        }

        return {
          coordinates,
          distanceKm,
          durationMins,
          steps: steps.length > 0 ? steps : createDefaultSteps(distanceKm, destinationName, gateName),
          destinationName,
          gateName,
          originName,
          startCoords: start,
          destinationCoords: end,
        };
      }
    }
  } catch (err) {
    console.warn('OSRM routing request failed:', err);
  }

  // 3. Fallback: Interpolated road waypoints
  const fallback = generateSynthesizedRoute(start, end, destinationName, gateName);
  return {
    ...fallback,
    originName,
    startCoords: start,
    destinationCoords: end,
  };
}

function createDefaultSteps(distanceKm: number, destinationName: string, gateName: string): RouteStep[] {
  return [
    {
      instruction: 'Head towards main arterial road',
      distanceMeters: 250,
      durationSeconds: 45,
      maneuverType: 'depart',
      location: [0, 0],
    },
    {
      instruction: 'Continue straight along the boulevard for 800m',
      distanceMeters: 800,
      durationSeconds: 120,
      maneuverType: 'straight',
      location: [0, 0],
    },
    {
      instruction: `Turn right towards ${gateName}`,
      distanceMeters: 300,
      durationSeconds: 60,
      maneuverType: 'turn',
      modifier: 'right',
      location: [0, 0],
    },
    {
      instruction: `Arrive at ${destinationName} — proceed to ${gateName} security barrier`,
      distanceMeters: 50,
      durationSeconds: 20,
      maneuverType: 'arrive',
      location: [0, 0],
    },
  ];
}

function generateSynthesizedRoute(
  start: [number, number],
  end: [number, number],
  destinationName: string,
  gateName: string
): NavigationRoute {
  const [lat1, lng1] = start;
  const [lat2, lng2] = end;

  const coordinates: [number, number][] = [
    [lng1, lat1],
    [lng1 + (lng2 - lng1) * 0.2, lat1],
    [lng1 + (lng2 - lng1) * 0.25, lat1 + (lat2 - lat1) * 0.3],
    [lng1 + (lng2 - lng1) * 0.55, lat1 + (lat2 - lat1) * 0.35],
    [lng1 + (lng2 - lng1) * 0.6, lat1 + (lat2 - lat1) * 0.75],
    [lng1 + (lng2 - lng1) * 0.9, lat1 + (lat2 - lat1) * 0.8],
    [lng2, lat2],
  ];

  const dLat = (lat2 - lat1) * 111;
  const dLng = (lng2 - lng1) * 105;
  const distanceKm = Number((Math.sqrt(dLat * dLat + dLng * dLng) * 1.3).toFixed(1));
  const durationMins = Math.max(2, Math.round(distanceKm * 3.5));

  return {
    coordinates,
    distanceKm,
    durationMins,
    steps: createDefaultSteps(distanceKm, destinationName, gateName),
    destinationName,
    gateName,
  };
}
