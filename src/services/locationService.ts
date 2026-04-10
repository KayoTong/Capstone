import type { GeofenceConfig } from "@/types/Geofence";

export const DEFAULT_GEOFENCE_RADIUS = 150;
export const MIN_GEOFENCE_RADIUS = 50;
export const MAX_GEOFENCE_RADIUS = 500;
export const GEOFENCE_RADIUS_STEP = 25;
export const GEOFENCE_REGION_DELTA = 0.01;
export const GEOFENCE_TASK_NAME = "GEOFENCE_CHECK";
export const HOME_GEOFENCE_IDENTIFIER = "HomeZone";

export type MapRegion = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

export type NormalizedGeofenceSetup = {
  enabled: boolean;
  radius: number;
  region: MapRegion | null;
};

export function buildMapRegion(
  latitude: number,
  longitude: number,
): MapRegion {
  return {
    latitude,
    longitude,
    latitudeDelta: GEOFENCE_REGION_DELTA,
    longitudeDelta: GEOFENCE_REGION_DELTA,
  };
}

export function normalizeSavedGeofenceConfig(
  saved: GeofenceConfig | null,
): NormalizedGeofenceSetup | null {
  if (!saved) return null;

  return {
    enabled: saved.enabled,
    radius: saved.radiusMeters || DEFAULT_GEOFENCE_RADIUS,
    region:
      saved.latitude && saved.longitude
        ? buildMapRegion(saved.latitude, saved.longitude)
        : null,
  };
}

export function shouldFetchCurrentLocation(
  saved: GeofenceConfig | null,
): boolean {
  return !saved || !saved.latitude;
}

export function buildGeofenceConfig(
  enabled: boolean,
  region: Pick<MapRegion, "latitude" | "longitude">,
  radius: number,
): GeofenceConfig {
  return {
    enabled,
    latitude: region.latitude,
    longitude: region.longitude,
    radiusMeters: radius,
  };
}

export function buildGeofenceRegion(
  region: Pick<MapRegion, "latitude" | "longitude">,
  radius: number,
) {
  return {
    identifier: HOME_GEOFENCE_IDENTIFIER,
    latitude: region.latitude,
    longitude: region.longitude,
    radius,
    notifyOnExit: true,
    notifyOnEnter: false,
  };
}
