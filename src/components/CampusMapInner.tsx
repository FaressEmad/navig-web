"use client";

import React, { useEffect, useRef } from "react";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, useMapEvents, GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useStore } from "../hooks/useStore";
import { Place } from "../types";
import { CampusBoundaryService } from "../services/campusBoundary";

// Leaflet marker configuration fix (uses inline SVGs for premium look and avoiding assets packaging issues)
const createCustomIcon = (type: string, isSelected: boolean) => {
  let color = "#465f88"; // University Blue default
  if (isSelected) {
    color = "#ba0034"; // Electric Pink for active/selected POI
  } else if (type === "GATE") {
    color = "#10b981"; // Emerald Green for gates
  } else if (type === "LANDMARK") {
    color = "#f59e0b"; // Amber Yellow for landmarks
  }

  const svgHtml = `
    <div class="relative flex items-center justify-center w-8 h-8 rounded-full shadow-lg border-2 border-white transition-all transform hover:scale-110" style="background-color: ${color};">
      <div class="w-2.5 h-2.5 rounded-full bg-white animate-pulse"></div>
      <div class="absolute -bottom-1.5 w-0 h-0 border-t-[6px] border-t-white border-x-[5px] border-x-transparent"></div>
    </div>
  `;

  return L.divIcon({
    html: svgHtml,
    className: "custom-map-marker-icon",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

// Map controller: only reacts to explicit flyTo requests via a counter or auto-follow updates
function MapController() {
  const map = useMap();
  const mapCenter = useStore((state) => state.mapCenter);
  const mapZoom = useStore((state) => state.mapZoom);
  const flyToCounter = useStore((state) => state.flyToCounter);
  const lastProcessedRef = useRef(0);

  const userLocation = useStore((state) => state.userLocation);
  const isNavigating = useStore((state) => state.isNavigating);
  const isAutoFollowEnabled = useStore((state) => state.isAutoFollowEnabled);
  const boundaryGeoJSON = useStore((state) => state.boundaryGeoJSON);
  const userHeading = useStore((state) => state.userHeading);
  const setMapReady = useStore((state) => state.setMapReady);

  // Set isMapReady to true when map mounts and is loaded, and false on unmount
  useEffect(() => {
    if (!map) return;

    const checkAndSetReady = () => {
      if ((map as any)._loaded) {
        setMapReady(true);
      }
    };

    if ((map as any)._loaded) {
      setMapReady(true);
    } else {
      map.on("load", checkAndSetReady);
    }

    return () => {
      setMapReady(false);
      try {
        map.off("load", checkAndSetReady);
        map.stop(); // Stop any pending pan/zoom animations before map is unmounted!
      } catch (e) {
        // ignore
      }
    };
  }, [map, setMapReady]);

  // Helper to calculate camera center with lower-third offset (Google Maps driving offset style)
  const getOffsetCenter = (latlng: [number, number]): [number, number] => {
    try {
      if (!map || !(map as any)._loaded || !map.getContainer()) return latlng;
      const size = map.getSize();
      // Target position is in the lower third (shift map center up by height / 6 pixels)
      const offsetY = size.y / 6;
      
      const userPoint = map.latLngToContainerPoint(latlng);
      const targetPoint = L.point(userPoint.x, userPoint.y - offsetY);
      const targetLatLng = map.containerPointToLatLng(targetPoint);
      return [targetLatLng.lat, targetLatLng.lng];
    } catch (e) {
      // Fallback: slight latitude shift North (approx 25-30m at zoom 19)
      return [latlng[0] + 0.00025, latlng[1]];
    }
  };

  useEffect(() => {
    if (!map || !(map as any)._loaded || !map.getContainer()) return;
    // Only fly when a new explicit request comes in (counter incremented)
    if (flyToCounter > lastProcessedRef.current) {
      lastProcessedRef.current = flyToCounter;
      
      let target = mapCenter;
      let targetZoom = mapZoom;
      if (isNavigating) {
        // Center directly on user location (mapCenter) to act as the rotation pivot point
        target = mapCenter;
        targetZoom = 20;
      }

      try {
        map.flyTo(target, targetZoom, {
          animate: true,
          duration: 0.8,
        });
      } catch (e) {
        console.error("Leaflet flyTo error:", e);
      }
    }
  }, [flyToCounter, mapCenter, mapZoom, map, isNavigating]);

  // Center map on user location if auto-follow is active and userLocation changes
  useEffect(() => {
    if (!map || !(map as any)._loaded || !map.getContainer()) return;
    if (isNavigating && isAutoFollowEnabled && userLocation) {
      // Center directly on userLocation to ensure they stay at the rotation pivot point
      try {
        map.setView(userLocation, 20, {
          animate: true,
          duration: 0.5,
        });
      } catch (e) {
        console.error("Leaflet setView error:", e);
      }
    }
  }, [userLocation, isNavigating, isAutoFollowEnabled, map]);

  // Fit bounds to campus polygon and restrict panning using CampusBoundaryService
  useEffect(() => {
    if (!map || !(map as any)._loaded || !map.getContainer()) return;
    if (boundaryGeoJSON) {
      try {
        CampusBoundaryService.fitCampusBounds(map);
        CampusBoundaryService.limitMapBounds(map);
      } catch (e) {
        console.error("Leaflet bounds error:", e);
      }
    }
  }, [boundaryGeoJSON, map]);

  // Invalidate map size after container resizes (fixes blank tiles)
  useEffect(() => {
    if (!map || !(map as any)._loaded || !map.getContainer()) return;
    const timer = setTimeout(() => {
      try {
        map.invalidateSize();
      } catch (e) {
        console.error("Leaflet invalidateSize error:", e);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [map]);

  // Map rotation is now handled via GPU-accelerated wrapper div transition on parent

  return null;
}

// Sync user's manual zoom/pan back to store (so we don't override it)
function MapEventSync() {
  const setAutoFollowEnabled = useStore((state) => state.setAutoFollowEnabled);
  const isAutoFollowEnabled = useStore((state) => state.isAutoFollowEnabled);
  const isNavigating = useStore((state) => state.isNavigating);

  const isSelectingManualStart = useStore((state) => state.isSelectingManualStart);
  const setSelectingManualStart = useStore((state) => state.setSelectingManualStart);
  const setStartPlace = useStore((state) => state.setStartPlace);
  const setUserLocation = useStore((state) => state.setUserLocation);
  const language = useStore((state) => state.language);

  useMapEvents({
    dragstart: () => {
      if (isNavigating && isAutoFollowEnabled) {
        setAutoFollowEnabled(false);
      }
    },
    zoomstart: () => {
      if (isNavigating && isAutoFollowEnabled) {
        setAutoFollowEnabled(false);
      }
    },
    click: (e) => {
      if (isSelectingManualStart) {
        const lat = e.latlng.lat;
        const lng = e.latlng.lng;

        if (CampusBoundaryService.isInsideCampus(lat, lng)) {
          const manualStart = {
            id: "manual-location",
            nameEn: "Manual Starting Point",
            nameAr: "نقطة بداية يدوية",
            descriptionEn: "Manually selected starting location",
            descriptionAr: "موقع بداية محدد يدوياً",
            type: "LANDMARK" as const,
            latitude: lat,
            longitude: lng,
            floor: null,
            roomNumber: null,
            facultyId: null,
            buildingId: null,
          };

          setStartPlace(manualStart);
          setUserLocation([lat, lng]);
          setSelectingManualStart(false);
        }
      }
    }
  });
  return null;
}

interface CampusMapInnerProps {
  places: Place[];
}

export default function CampusMapInner({ places }: CampusMapInnerProps) {
  const { 
    selectedPlace, 
    setSelectedPlace, 
    activeRoute,
    isNavigating,
    userLocation,
    destinationPlace,
    boundaryGeoJSON,
    userHeading,
    isAutoFollowEnabled
  } = useStore();

  // Dark mode map tile styling override (Leaflet filters for map styling)
  const theme = useStore((state) => state.theme);
  const isDarkMode = theme === "dark";

  // Using standard OpenStreetMap tiles
  const osmUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
  const osmAttrib = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

  // Cairo University campus bounds coordinates
  const campusBounds = L.latLngBounds(
    [30.021, 31.199], // South-West corner
    [30.033, 31.215]  // North-East corner
  );

  return (
    <div className="w-full h-full relative overflow-hidden bg-background">
      <div 
        className="w-full h-full relative"
        style={{ 
          transform: isNavigating && isAutoFollowEnabled ? `rotate(${-userHeading}deg) scale(1.4)` : "rotate(0deg) scale(1)",
          transformOrigin: "center",
          transition: "transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)"
        }}
      >
        <MapContainer
          center={[30.0275, 31.2085]}
          zoom={16}
          minZoom={14}
          maxZoom={18}
          maxBounds={campusBounds}
          maxBoundsViscosity={1.0}
          scrollWheelZoom={true}
          zoomControl={false}
          className="w-full h-full"
          style={{ width: "100%", height: "100%" }}
        >
        <TileLayer
          url={osmUrl}
          attribution={osmAttrib}
          maxNativeZoom={18}
          maxZoom={18}
          // Applying a dark mode filter to OSM tiles when dark mode is enabled
          eventHandlers={{
            add: (e) => {
              const tileLayer = e.target;
              const container = tileLayer.getContainer();
              if (container) {
                if (isDarkMode) {
                  container.style.filter = "invert(90%) hue-rotate(180deg) brightness(95%) contrast(90%)";
                } else {
                  container.style.filter = "none";
                }
              }
            }
          }}
        />

        {/* Transparent Campus Polygon (development only) */}
        {process.env.NODE_ENV === "development" && boundaryGeoJSON && (
          <GeoJSON
            data={boundaryGeoJSON}
            style={{
              color: "#0066cc",
              weight: 2,
              fillColor: "#0066cc",
              fillOpacity: 0.2
            }}
          />
        )}

        {/* Dynamic Map Controller — only moves on explicit flyTo calls */}
        <MapController />
        <MapEventSync />

        {/* User Location Pulsing Dot / Rotating Arrow Pointer */}
        {userLocation && (
          <Marker 
            key={`user-loc-${userLocation[0]}-${userLocation[1]}-${userHeading}`}
            position={userLocation}
            icon={L.divIcon({
              html: isNavigating ? `
                <div class="relative flex items-center justify-center w-8 h-8">
                  <svg viewBox="0 0 24 24" class="w-7 h-7 text-blue-600 drop-shadow-md" style="transform: rotate(${userHeading}deg);" fill="currentColor">
                    <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" />
                  </svg>
                </div>
              ` : `
                <div class="relative flex items-center justify-center w-6 h-6">
                  <div class="absolute w-full h-full bg-blue-500/30 rounded-full animate-ping"></div>
                  <div class="w-3.5 h-3.5 rounded-full bg-blue-600 border-2 border-white shadow-md"></div>
                </div>
              `,
              className: "user-location-marker",
              iconSize: isNavigating ? [32, 32] : [24, 24],
              iconAnchor: isNavigating ? [16, 16] : [12, 12]
            })}
          >
            <Popup>You are here</Popup>
          </Marker>
        )}

        {/* Destination Marker */}
        {isNavigating && destinationPlace && (
          <Marker
            position={[destinationPlace.latitude, destinationPlace.longitude]}
            icon={L.divIcon({
              html: `
                <div class="relative flex items-center justify-center w-8 h-8 rounded-full shadow-lg border-2 border-white bg-red-600">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="text-white transform rotate-45"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                </div>
              `,
              className: "destination-marker",
              iconSize: [32, 32],
              iconAnchor: [16, 16]
            })}
          />
        )}

        {/* Place Markers (Hidden during navigation for distraction-free mode) */}
        {!isNavigating && places.map((place) => {
          const isSelected = selectedPlace?.id === place.id;
          return (
            <Marker
              key={place.id}
              position={[place.latitude, place.longitude]}
              icon={createCustomIcon(place.type, isSelected)}
              eventHandlers={{
                click: () => {
                  setSelectedPlace(place);
                },
              }}
            >
              <Popup>
                <div className="p-1 font-sans">
                  <h3 className="font-bold text-sm text-primary mb-0.5">
                    {useStore.getState().language === "en" ? place.nameEn : place.nameAr}
                  </h3>
                  <p className="text-xs text-secondary mt-0">
                    {place.type.replace("_", " ")}
                  </p>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Walking Route Line Overlay — styled like Google Maps */}
        {activeRoute && activeRoute.path.length > 0 && (
          <Polyline
            positions={activeRoute.path}
            pathOptions={{
              color: isNavigating ? "#1a73e8" : "#8ab4f8",
              weight: isNavigating ? 10 : 8,
              opacity: isNavigating ? 0.9 : 0.75,
              lineCap: "round",
              lineJoin: "round",
            }}
          />
        )}
      </MapContainer>
    </div>
  </div>
);
}
