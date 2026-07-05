"use client";

import React, { useEffect, useRef } from "react";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useStore } from "../hooks/useStore";
import { Place } from "../types";

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

// Map controller: only reacts to explicit flyTo requests via a counter
function MapController() {
  const map = useMap();
  const mapCenter = useStore((state) => state.mapCenter);
  const mapZoom = useStore((state) => state.mapZoom);
  const flyToCounter = useStore((state) => state.flyToCounter);
  const lastProcessedRef = useRef(0);

  useEffect(() => {
    // Only fly when a new explicit request comes in (counter incremented)
    if (flyToCounter > lastProcessedRef.current) {
      lastProcessedRef.current = flyToCounter;
      map.flyTo(mapCenter, mapZoom, {
        animate: true,
        duration: 0.8,
      });
    }
  }, [flyToCounter, mapCenter, mapZoom, map]);

  // Invalidate map size after container resizes (fixes blank tiles)
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 300);
    return () => clearTimeout(timer);
  }, [map]);

  return null;
}

// Sync user's manual zoom/pan back to store (so we don't override it)
function MapEventSync() {
  useMapEvents({
    moveend: () => {
      // We don't sync back to store — we just let the user move freely
      // Only explicit flyTo calls (via counter) will move the map
    },
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
    destinationPlace
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
    <div className="w-full h-full relative">
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

        {/* Dynamic Map Controller — only moves on explicit flyTo calls */}
        <MapController />
        <MapEventSync />

        {/* User Location Pulsing Dot */}
        {userLocation && (
          <Marker 
            position={userLocation}
            icon={L.divIcon({
              html: `
                <div class="relative flex items-center justify-center w-6 h-6">
                  <div class="absolute w-full h-full bg-blue-500/30 rounded-full animate-ping"></div>
                  <div class="w-3.5 h-3.5 rounded-full bg-blue-600 border-2 border-white shadow-md"></div>
                </div>
              `,
              className: "user-location-marker",
              iconSize: [24, 24],
              iconAnchor: [12, 12]
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

        {/* Place Markers */}
        {places.map((place) => {
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

        {/* Active Route Line Overlay */}
        {isNavigating && activeRoute && activeRoute.path.length > 0 && (
          <Polyline
            positions={activeRoute.path}
            pathOptions={{
              color: "#ba0034", // Electric Pink Route Line
              weight: 6,
              opacity: 0.85,
              lineCap: "round",
              lineJoin: "round",
            }}
          />
        )}
      </MapContainer>
    </div>
  );
}
