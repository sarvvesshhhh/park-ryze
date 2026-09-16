/**
 * Route GPS Driving Simulation Engine
 * Park Ryze Architecture
 */

import { NavigationRoute } from '../types';
import { calculateHaversineDistanceKm } from './proximity';

export interface SimulationState {
  isSimulating: boolean;
  isPaused: boolean;
  currentCoordIndex: number;
  totalCoords: number;
  currentCoord: [number, number]; // [lat, lng]
  progressPercent: number;
  speedMultiplier: 1 | 2 | 5;
  remainingDistanceKm: number;
  remainingDurationMins: number;
  currentStepIndex: number;
}

export function createInitialSimulation(route: NavigationRoute): SimulationState {
  const start = route.coordinates[0] || [72.8372, 19.1031];
  return {
    isSimulating: false,
    isPaused: false,
    currentCoordIndex: 0,
    totalCoords: route.coordinates.length,
    currentCoord: [start[1], start[0]], // convert [lng, lat] to [lat, lng]
    progressPercent: 0,
    speedMultiplier: 1,
    remainingDistanceKm: route.distanceKm,
    remainingDurationMins: route.durationMins,
    currentStepIndex: 0,
  };
}

/**
 * Steps the simulation forward by 1 coordinate delta
 */
export function advanceSimulationStep(
  state: SimulationState,
  route: NavigationRoute
): SimulationState {
  if (!route.coordinates || route.coordinates.length === 0) return state;

  const nextIndex = Math.min(route.coordinates.length - 1, state.currentCoordIndex + 1);
  const nextCoordRaw = route.coordinates[nextIndex];
  const nextCoord: [number, number] = [nextCoordRaw[1], nextCoordRaw[0]]; // [lat, lng]

  const progressPercent = Math.round((nextIndex / (route.coordinates.length - 1)) * 100);
  const remainingFraction = Math.max(0, 1 - progressPercent / 100);

  const remainingDistanceKm = Math.round(route.distanceKm * remainingFraction * 10) / 10;
  const remainingDurationMins = Math.max(1, Math.round(route.durationMins * remainingFraction));

  // Determine currentStepIndex by proximity to step locations
  let stepIdx = state.currentStepIndex;
  if (route.steps && route.steps.length > 0) {
    for (let i = stepIdx; i < route.steps.length; i++) {
      const step = route.steps[i];
      if (step.location) {
        const stepCoord: [number, number] = [step.location[1], step.location[0]];
        const distToStepKm = calculateHaversineDistanceKm(nextCoord, stepCoord);
        if (distToStepKm < 0.05 && i < route.steps.length - 1) {
          stepIdx = i + 1;
        }
      }
    }
  }

  const isComplete = nextIndex >= route.coordinates.length - 1;

  return {
    ...state,
    currentCoordIndex: nextIndex,
    currentCoord: nextCoord,
    progressPercent,
    remainingDistanceKm,
    remainingDurationMins,
    currentStepIndex: stepIdx,
    isSimulating: !isComplete,
  };
}
