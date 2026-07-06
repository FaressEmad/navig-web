import * as turf from "@turf/turf";

let boundaryGeoJSON: any = null;

export const CampusBoundaryService = {
  // Load the boundary GeoJSON from /public/data/cairo-university-boundary.geojson
  async loadBoundary(): Promise<any> {
    if (boundaryGeoJSON) return boundaryGeoJSON;
    
    try {
      const res = await fetch("/data/cairo-university-boundary.geojson");
      if (!res.ok) throw new Error("Failed to load campus boundary");
      const data = await res.json();
      boundaryGeoJSON = data;
      return data;
    } catch (err) {
      console.error("Error in CampusBoundaryService.loadBoundary:", err);
      return null;
    }
  },

  // Check if a point is inside the Cairo University campus polygon
  isInsideCampus(lat: number, lng: number): boolean {
    if (!boundaryGeoJSON) return true; // Fallback if not loaded yet
    
    try {
      const pt = turf.point([lng, lat]);
      const poly = boundaryGeoJSON.type === "FeatureCollection" 
        ? boundaryGeoJSON.features[0] 
        : boundaryGeoJSON;
      return turf.booleanPointInPolygon(pt, poly);
    } catch (err) {
      console.error("Error in isInsideCampus check:", err);
      return false;
    }
  },

  // Fit the Leaflet map bounds to the campus boundary (Dynamic evaluation)
  fitCampusBounds(map: any) {
    if (!boundaryGeoJSON) return;
    try {
      const L = require("leaflet");
      const geojsonLayer = L.geoJSON(boundaryGeoJSON);
      const bounds = geojsonLayer.getBounds();
      map.fitBounds(bounds);
    } catch (err) {
      console.error("Error fitting campus bounds:", err);
    }
  },

  // Limit map bounds to avoid dragging too far from campus (Dynamic evaluation)
  limitMapBounds(map: any) {
    if (!boundaryGeoJSON) return;
    try {
      const L = require("leaflet");
      const geojsonLayer = L.geoJSON(boundaryGeoJSON);
      const bounds = geojsonLayer.getBounds();
      map.setMaxBounds(bounds);
      map.setMinZoom(14);
    } catch (err) {
      console.error("Error limiting map bounds:", err);
    }
  }
};
