"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";

interface AdminMapSelectorProps {
  latitude: number;
  longitude: number;
  onChange: (lat: number, lng: number) => void;
}

// Inner helper component to listen to map clicks
function MapClickHandler({ onChange }: { onChange: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onChange(e.latlng.lat, e.latlng.lng);
    }
  });
  return null;
}

export default function AdminMapSelector({ latitude, longitude, onChange }: AdminMapSelectorProps) {
  const markerRef = useRef<L.Marker | null>(null);

  // Re-adjust icon defaults for Leaflet marker assets
  useEffect(() => {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
      iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
      shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    });
  }, []);

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const latLng = marker.getLatLng();
          onChange(latLng.lat, latLng.lng);
        }
      },
    }),
    [onChange]
  );

  return (
    <div className="w-full h-64 rounded-2xl overflow-hidden border border-outline-variant/10 shadow-inner relative z-10">
      <MapContainer
        center={[latitude || 30.0275, longitude || 31.2085]}
        zoom={17}
        className="w-full h-full"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {/* Listen to map clicks */}
        <MapClickHandler onChange={onChange} />

        {/* Draggable marker */}
        <Marker
          draggable={true}
          eventHandlers={eventHandlers}
          position={[latitude || 30.0275, longitude || 31.2085]}
          ref={markerRef}
        />
      </MapContainer>
      
      {/* Visual HUD overlay clue */}
      <div className="absolute bottom-2.5 left-2.5 z-20 bg-black/75 backdrop-blur-sm text-white text-[9px] font-bold px-2 py-1 rounded">
        Drag marker or click map to update coordinates
      </div>
    </div>
  );
}
