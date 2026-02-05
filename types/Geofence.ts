export type GeofenceConfig = { // Geofence configuration type
  enabled: boolean; // whether geofencing is enabled
  latitude: number; // latitude of the geofence center
  longitude: number; // longitude of the geofence center
  radiusMeters: number; // radius of the geofence in meters
};
// This type defines the structure for geofence settings associated with an item.