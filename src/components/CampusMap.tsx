"use client";

import React from "react";
import dynamic from "next/dynamic";
import { Place } from "../types";

// Dynamically load the actual Leaflet Map implementation with Server-Side Rendering (SSR) disabled
// This prevents Next.js compiler from attempting to compile window/leaflet variables on the server.
const CampusMapInner = dynamic(
  () => import("./CampusMapInner"),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-surface-container/20 flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold text-secondary animate-pulse">Loading smart map canvas...</p>
      </div>
    )
  }
);

interface CampusMapProps {
  places: Place[];
}

export default function CampusMap({ places }: CampusMapProps) {
  return (
    <div className="w-full h-full bg-surface relative">
      <CampusMapInner places={places} />
    </div>
  );
}
