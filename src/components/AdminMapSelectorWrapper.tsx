"use client";

import React from "react";
import dynamic from "next/dynamic";

const AdminMapSelector = dynamic(() => import("./AdminMapSelector"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-64 bg-surface-container rounded-2xl flex items-center justify-center border border-outline-variant/10 text-xs font-semibold text-secondary">
      Loading interactive map editor...
    </div>
  )
});

interface WrapperProps {
  latitude: number;
  longitude: number;
  onChange: (lat: number, lng: number) => void;
}

export default function AdminMapSelectorWrapper(props: WrapperProps) {
  return <AdminMapSelector {...props} />;
}
