"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Layout from "../../components/Layout";
import CampusMap from "../../components/CampusMap";
import { useStore } from "../../hooks/useStore";
import { useTranslation } from "../../hooks/useTranslation";
import { Place, NavigationNode, NavigationEdge } from "../../types";
import { generateRoute, getHaversineDistance } from "../../services/routing";
import { CampusBoundaryService } from "../../services/campusBoundary";
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
    setEdges,
    isAutoFollowEnabled,
    setAutoFollowEnabled,
    currentUserLocation,
    setCurrentUserLocation,
    userHeading,
    setUserHeading,
    isMapReady
  } = useStore();

  const watchIdRef = useRef<number | null>(null);
  const prevLocRef = useRef<[number, number] | null>(null);

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

  // Set up watchPosition to track location and dynamically update route
  useEffect(() => {
    if (!isMapReady) return; // Wait until Leaflet Map is fully created and loaded
    if (typeof window === "undefined" || !navigator.geolocation) return;

    let lastLocation: [number, number] | null = null;

    const handleSuccess = async (position: GeolocationPosition) => {
      if (!destinationPlace) return;
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      // Validate that the GPS coordinate is inside Cairo University before updating location states.
      // This prevents raw browser GPS coords from overriding the user's manual starting point
      // or flying the map outside campus bounds when testing from a remote physical location.
      if (!CampusBoundaryService.isInsideCampus(lat, lng)) {
        console.warn("GPS location is outside Cairo University boundary. Ignoring coordinate updates.");
        return;
      }

      const newLoc: [number, number] = [lat, lng];

      // Update global current user location state
      setCurrentUserLocation(newLoc);

      // Update location dot
      setUserLocation(newLoc);

      // Calculate user heading (rotate navigation arrow)
      let heading = position.coords.heading;
      if (heading === null || heading === undefined || isNaN(heading)) {
        if (prevLocRef.current) {
          const prev = prevLocRef.current;
          heading = calculateBearing(prev[0], prev[1], lat, lng);
        } else {
          heading = 0;
        }
      }
      setUserHeading(heading);
      prevLocRef.current = newLoc;

      // Check arrival (remaining distance < 10 meters)
      const distToDest = getHaversineDistance(lat, lng, destinationPlace.latitude, destinationPlace.longitude);
      if (distToDest < 10) {
        alert(language === "en" ? "You have arrived." : "لقد وصلت إلى وجهتك.");
        if (watchIdRef.current !== null) {
          navigator.geolocation.clearWatch(watchIdRef.current);
          watchIdRef.current = null;
        }
        setIsNavigating(false);
        setAutoFollowEnabled(true);
        router.push("/search");
        return;
      }

      // Off-route check: recalculate if user leaves current route by more than 20 meters
      if (activeRoute && activeRoute.path.length > 0) {
        const minDistanceToRoute = getMinDistanceToRoute(lat, lng, activeRoute.path);
        if (minDistanceToRoute > 20) {
          console.log(`User off-route by ${minDistanceToRoute.toFixed(1)}m. Recalculating route...`);
          const startPoint: Place = {
            id: "current-location",
            nameEn: "Current Location",
            nameAr: "موقعك الحالي",
            descriptionEn: "Current detected user location",
            descriptionAr: "موقع المستخدم الحالي المكتشف",
            type: "LANDMARK",
            latitude: lat,
            longitude: lng,
            floor: null,
            roomNumber: null,
            facultyId: null,
            buildingId: null,
          };

          const route = await generateRoute(startPoint, destinationPlace);
          if (route) {
            setActiveRoute(route);
            setCurrentStepIndex(0);
          }
          lastLocation = newLoc;
          return;
        }
      }

      // Check distance from previous location to avoid updating on tiny jitter
      let shouldRecalculate = false;
      if (!lastLocation) {
        shouldRecalculate = true;
      } else {
        const distanceMoved = getHaversineDistance(
          lastLocation[0],
          lastLocation[1],
          lat,
          lng
        );
        // Only recalculate route if moved by more than 2 meters
        if (distanceMoved > 2) {
          shouldRecalculate = true;
        }
      }

      if (shouldRecalculate) {
        lastLocation = newLoc;

        if (isNavigating && destinationPlace) {
          const startPoint: Place = {
            id: "current-location",
            nameEn: "Current Location",
            nameAr: "موقعك الحالي",
            descriptionEn: "Current detected user location",
            descriptionAr: "موقع المستخدم الحالي المكتشف",
            type: "LANDMARK",
            latitude: lat,
            longitude: lng,
            floor: null,
            roomNumber: null,
            facultyId: null,
            buildingId: null,
          };

          const route = await generateRoute(startPoint, destinationPlace);
          if (route) {
            setActiveRoute(route);
            setCurrentStepIndex(0);
          }
        }
      }
    };

    const handleError = (err: GeolocationPositionError) => {
      console.error("GPS Watch Error: ", err);
    };

    const watchId = navigator.geolocation.watchPosition(handleSuccess, handleError, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    });

    watchIdRef.current = watchId;

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [destinationPlace, isNavigating, nodes, edges, activeRoute, language, isMapReady, setActiveRoute, setCurrentStepIndex, setUserLocation, setCurrentUserLocation, setUserHeading, setAutoFollowEnabled, router]);

  const handleRecenter = () => {
    const targetLoc = userLocation || currentUserLocation;
    if (targetLoc) {
      flyTo(targetLoc, 19);
      setAutoFollowEnabled(true);
    }
  };

  const handleToggleAutoFollow = () => {
    if (isAutoFollowEnabled) {
      setAutoFollowEnabled(false);
    } else {
      handleRecenter();
    }
  };

  const handleCancelNavigation = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsNavigating(false);
    setAutoFollowEnabled(true);
    router.push("/search");
  };

  // Center on mount
  useEffect(() => {
    if (currentUserLocation) {
      handleRecenter();
    } else if (activeRoute && activeRoute.path.length > 0) {
      flyTo(activeRoute.path[0], 19);
    }
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
    <div className="relative w-full h-screen overflow-hidden" dir={language === "ar" ? "rtl" : "ltr"}>
      
      {/* FULLSCREEN MAP — 100% of the screen */}
      <div className="w-full h-full absolute inset-0 z-10">
        <CampusMap places={places} />
      </div>

      {/* TOP FLOATING CARD: Destination info + ETA + Step Instruction */}
      <div className="absolute top-0 left-0 right-0 z-20 pointer-events-none pt-4 px-4 max-w-md mx-auto">
        <div className="pointer-events-auto bg-white/95 dark:bg-surface-lowest/95 backdrop-blur-2xl rounded-2xl p-4 shadow-xl border border-outline-variant/10 flex flex-col gap-2.5">
          
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
          </div>

          {/* Metrics (ETA + Distance Remaining) */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-surface-container/40 p-2.5 rounded-xl border border-outline-variant/5">
              <span className="text-[9px] text-secondary font-bold uppercase block">{language === "en" ? "Remaining Distance" : "المسافة المتبقية"}</span>
              <span className="text-sm font-black text-on-surface">{activeRoute.distance} m</span>
            </div>
            <div className="bg-surface-container/40 p-2.5 rounded-xl border border-outline-variant/5">
              <span className="text-[9px] text-secondary font-bold uppercase block">{language === "en" ? "ETA" : "الوقت المتوقع"}</span>
              <span className="text-sm font-black text-on-surface">{activeRoute.duration} min</span>
            </div>
          </div>

          {/* Active Navigation Instruction banner */}
          {activeRoute.instructions.length > 0 && (
            <div className="flex items-center gap-2.5 bg-primary/5 p-3 rounded-xl border border-primary/10">
              <Compass className="w-4.5 h-4.5 text-primary flex-shrink-0 animate-spin" />
              <p className="text-[11px] md:text-xs font-black text-on-surface leading-normal">
                {language === "en"
                  ? activeRoute.instructions[currentStepIndex]?.instructionEn
                  : activeRoute.instructions[currentStepIndex]?.instructionAr}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* RESUME FOLLOWING BUTTON — floating pill just above the bottom card */}
      {!isAutoFollowEnabled && (userLocation || currentUserLocation) && (
        <div className="absolute bottom-24 left-0 right-0 z-20 flex justify-center pointer-events-none">
          <button
            onClick={handleRecenter}
            className="pointer-events-auto bg-primary hover:bg-primary-container text-white px-5 py-3 rounded-full font-bold text-xs shadow-xl border border-primary/20 flex items-center gap-2 transition-all active:scale-95 cursor-pointer animate-bounce"
          >
            <Crosshair className="w-4 h-4 text-white" />
            <span>{language === "en" ? "Resume Following" : "استئناف التتبع"}</span>
          </button>
        </div>
      )}

      {/* RECENTER BUTTON — floating round button on the bottom right (mimics Google/Apple Maps placement) */}
      <div className="absolute bottom-24 right-4 z-20 pointer-events-none">
        <button
          onClick={handleRecenter}
          disabled={!userLocation && !currentUserLocation}
          className={`pointer-events-auto w-11 h-11 rounded-full shadow-lg flex items-center justify-center transition-all active:scale-95 cursor-pointer border ${
            (!userLocation && !currentUserLocation)
              ? "bg-surface-container/40 text-secondary/30 border-outline-variant/5 cursor-not-allowed opacity-50"
              : isAutoFollowEnabled
                ? "bg-primary text-white border-primary/20 animate-pulse"
                : "bg-white dark:bg-surface-lowest text-secondary border-outline-variant/15"
          }`}
          title={language === "en" ? "Recenter Map" : "توسيط الخريطة"}
        >
          <Crosshair className="w-5 h-5" />
        </button>
      </div>

      {/* BOTTOM FLOATING CARD: Actions + Compass Needle */}
      <div className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none pb-6 px-4 max-w-md mx-auto">
        <div className="pointer-events-auto bg-white/95 dark:bg-surface-lowest/95 backdrop-blur-2xl rounded-2xl p-4 shadow-2xl border border-outline-variant/10 flex items-center justify-between gap-4">
          
          {/* Exit Button */}
          <button
            onClick={handleCancelNavigation}
            className="bg-red-500/10 hover:bg-red-500/20 text-red-600 border border-red-500/15 py-3.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer flex-1"
          >
            <X className="w-4 h-4" />
            <span>{language === "en" ? "Exit Navigation" : "خروج من الملاحة"}</span>
          </button>

          {/* Dynamic Compass needle */}
          <div className="flex items-center gap-2.5 bg-surface-container/50 px-4 py-2.5 rounded-xl border border-outline-variant/5 flex-shrink-0">
            <Compass 
              className="w-4.5 h-4.5 text-primary transition-transform duration-300"
              style={{ transform: `rotate(${-userHeading}deg)` }}
            />
            <span className="text-[10px] font-black text-on-surface">
              {Math.round(userHeading)}° N
            </span>
          </div>

        </div>
      </div>

    </div>
  );
}

// Standalone mathematical helpers for geodesic bearing and route proximity
function calculateBearing(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const toDeg = (rad: number) => (rad * 180) / Math.PI;

  const phi1 = toRad(lat1);
  const phi2 = toRad(lat2);
  const deltaLambda = toRad(lon2 - lon1);

  const y = Math.sin(deltaLambda) * Math.cos(phi2);
  const x = Math.cos(phi1) * Math.sin(phi2) - Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda);
  
  let bearing = toDeg(Math.atan2(y, x));
  return (bearing + 360) % 360;
}

function getMinDistanceToRoute(userLat: number, userLng: number, path: [number, number][]): number {
  let minDistance = Infinity;
  for (const [lat, lng] of path) {
    const dist = getHaversineDistance(userLat, userLng, lat, lng);
    if (dist < minDistance) {
      minDistance = dist;
    }
  }
  return minDistance;
}
