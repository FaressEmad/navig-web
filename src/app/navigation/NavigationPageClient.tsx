"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Layout from "../../components/Layout";
import CampusMap from "../../components/CampusMap";
import { useStore } from "../../hooks/useStore";
import { useTranslation } from "../../hooks/useTranslation";
import { Place, NavigationNode, NavigationEdge } from "../../types";
import { generateRoute } from "../../services/routing";
import { 
  MapPin, 
  Compass, 
  Play, 
  Square,
  Crosshair,
  X
} from "lucide-react";

interface NavigationPageClientProps {
  places: Place[];
  nodes: NavigationNode[];
  edges: NavigationEdge[];
}

export default function NavigationPageClient({ places, nodes, edges }: NavigationPageClientProps) {
  const router = useRouter();
  const { t, language } = useTranslation();
  const { 
    startPlace,
    destinationPlace, 
    activeRoute, 
    setActiveRoute,
    isNavigating,
    setIsNavigating,
    currentStepIndex,
    setCurrentStepIndex,
    userLocation,
    setUserLocation,
    flyTo,
    setNodes,
    setEdges
  } = useStore();



  // Initialize nodes/edges
  useEffect(() => {
    setNodes(nodes);
    setEdges(edges);
  }, [nodes, edges, setNodes, setEdges]);

  // If user lands here without selecting a route, redirect to search
  useEffect(() => {
    if (!destinationPlace) {
      router.push("/search");
    }
  }, [destinationPlace, router]);

  const handleRecenter = () => {
    if (userLocation) {
      flyTo(userLocation, 17);
    } else if (startPlace) {
      flyTo([startPlace.latitude, startPlace.longitude], 17);
    } else {
      flyTo([30.0275, 31.2085], 16);
    }
  };

  const handleCancelNavigation = () => {
    setIsNavigating(false);
    router.push("/search");
  };

  // Center on mount
  useEffect(() => {
    handleRecenter();
  }, []);

  // Loading / redirect guard
  if (!destinationPlace || !activeRoute) {
    return (
      <Layout>
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-sm font-semibold text-secondary">
            {language === "en" ? "Preparing navigation..." : "...جاري تجهيز الملاحة"}
          </p>
        </div>
      </Layout>
    );
  }

  const destName = language === "en" ? destinationPlace.nameEn : (destinationPlace.displayNameAr || destinationPlace.nameAr);

  return (
    <div className="relative w-full h-screen overflow-hidden">
      
      {/* FULLSCREEN MAP — 100% of the screen */}
      <div className="w-full h-full absolute inset-0 z-10">
        <CampusMap places={places} />
      </div>

      {/* TOP FLOATING CARD: Destination info + ETA */}
      <div className="absolute top-0 left-0 right-0 z-20 pointer-events-none pt-4 px-4 max-w-md mx-auto">
        <div className="pointer-events-auto bg-white/90 dark:bg-surface-lowest/90 backdrop-blur-2xl rounded-2xl p-4 shadow-xl border border-outline-variant/10 flex flex-col gap-2.5">
          
          {/* Destination row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-full bg-red-500/10 text-red-600 flex items-center justify-center flex-shrink-0 animate-pulse">
                <MapPin className="w-4.5 h-4.5" />
              </div>
              <div className="text-left min-w-0">
                <span className="text-[9px] text-secondary font-bold uppercase tracking-wider block">
                  {language === "en" ? "Navigating To" : "الملاحة إلى"}
                </span>
                <h3 className="text-xs md:text-sm font-black text-on-surface truncate">
                  {destName}
                </h3>
              </div>
            </div>
            <button 
              onClick={handleCancelNavigation}
              className="p-1.5 rounded-full hover:bg-surface-variant/40 text-secondary transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-surface-container/40 p-2.5 rounded-xl border border-outline-variant/5">
              <span className="text-[9px] text-secondary font-bold uppercase block">{language === "en" ? "Distance" : "المسافة"}</span>
              <span className="text-sm font-black text-on-surface">{activeRoute.distance} m</span>
            </div>
            <div className="bg-surface-container/40 p-2.5 rounded-xl border border-outline-variant/5">
              <span className="text-[9px] text-secondary font-bold uppercase block">{language === "en" ? "ETA" : "الوقت المتوقع"}</span>
              <span className="text-sm font-black text-on-surface">{activeRoute.duration} min</span>
            </div>
          </div>

          {/* Next instruction */}
          {activeRoute.instructions.length > 0 && (
            <div className="flex items-center gap-2 bg-primary/5 p-2.5 rounded-xl border border-primary/10">
              <Compass className="w-4 h-4 text-primary flex-shrink-0" />
              <p className="text-[10px] md:text-xs font-bold text-on-surface truncate">
                {language === "en"
                  ? activeRoute.instructions[currentStepIndex]?.instructionEn
                  : activeRoute.instructions[currentStepIndex]?.instructionAr}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* BOTTOM FLOATING CARD: Controls */}
      <div className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none pb-6 px-4 max-w-md mx-auto">
        <div className="pointer-events-auto bg-white/90 dark:bg-surface-lowest/90 backdrop-blur-2xl rounded-[2rem] p-5 shadow-2xl border border-outline-variant/10 flex flex-col gap-4">
          
          {/* Control buttons */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={handleRecenter}
              className="bg-surface-container hover:bg-surface-container-high text-on-surface border border-outline-variant/10 py-3.5 px-2 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
            >
              <Crosshair className="w-4 h-4 text-primary" />
              <span>{language === "en" ? "Recenter Map" : "توسيط الخريطة"}</span>
            </button>

            <button
              onClick={handleCancelNavigation}
              className="bg-red-500/10 hover:bg-red-500/20 text-red-600 border border-red-500/15 py-3.5 px-2 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
            >
              <X className="w-4 h-4" />
              <span>{language === "en" ? "Cancel Navigation" : "إلغاء الملاحة"}</span>
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
