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
  X,
  Map,
  AlertCircle
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

  // Indoor Maps Popup States
  const [showIndoorModal, setShowIndoorModal] = useState(false);
  const [indoorMaps, setIndoorMaps] = useState<any[]>([]);
  const [activeFloor, setActiveFloor] = useState<number>(0);
  const [userIndoorPos, setUserIndoorPos] = useState<{ x: number, y: number } | null>(null);
  const [indoorLanguage, setIndoorLanguage] = useState<"en" | "ar">("en");
  const [isLoadingMaps, setIsLoadingMaps] = useState(false);
  
  // Routing error state for non-blocking UI alert
  const [routeError, setRouteError] = useState<string | null>(null);

  // Sync indoor language preference with app language initial setup
  useEffect(() => {
    setIndoorLanguage(language);
  }, [language]);

  // Load building floor map blueprints when navigation starts
  useEffect(() => {
    if (destinationPlace && destinationPlace.buildingId) {
      setIsLoadingMaps(true);
      fetch(`/api/admin/indoor-maps?buildingId=${destinationPlace.buildingId}`)
        .then(res => res.json())
        .then(data => {
          setIndoorMaps(data);
          setIsLoadingMaps(false);
          // Default active floor to target reference floor
          if (destinationPlace.floor !== null) {
            setActiveFloor(destinationPlace.floor);
          } else {
            setActiveFloor(0);
          }
        })
        .catch(err => {
          console.error("Failed to load building maps:", err);
          setIsLoadingMaps(false);
        });
    }
  }, [destinationPlace]);

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

          const route = await generateRoute(startPoint, destinationPlace, true);
          if (route) {
            setActiveRoute(route);
            setCurrentStepIndex(0);
            setRouteError(null);
          } else {
            // Set local route error message
            const isStartInside = CampusBoundaryService.isInsideCampus(lat, lng);
            if (!isStartInside) {
              setRouteError(language === "en" 
                ? "Your current GPS location is outside Cairo University boundary." 
                : "موقعك الجغرافي الحالي خارج حدود جامعة القاهرة.");
            } else {
              setRouteError(language === "en"
                ? "Unable to calculate a campus-only walking route."
                : "تعذر حساب مسار مشي داخل الحرم الجامعي فقط.");
            }

            // Fallback straight-line route from current location to destination
            // This resets the user back onto the active route path, stopping the infinite recalculation loop
            const dist = Math.round(getHaversineDistance(lat, lng, destinationPlace.latitude, destinationPlace.longitude));
            setActiveRoute({
              path: [[lat, lng], [destinationPlace.latitude, destinationPlace.longitude]],
              distance: dist,
              duration: Math.max(1, Math.round(dist / 1.3 / 60)),
              instructions: [
                {
                  instructionEn: `Walk towards ${destinationPlace.nameEn || "destination"}`,
                  instructionAr: `امشِ باتجاه ${destinationPlace.nameAr || "الوجهة"}`,
                  distance: dist,
                  coordinate: [destinationPlace.latitude, destinationPlace.longitude]
                }
              ]
            });
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

          const route = await generateRoute(startPoint, destinationPlace, true);
          if (route) {
            setActiveRoute(route);
            setCurrentStepIndex(0);
            setRouteError(null);
          } else {
            // Also fall back to a straight line route if standard recalculation fails
            const dist = Math.round(getHaversineDistance(lat, lng, destinationPlace.latitude, destinationPlace.longitude));
            setActiveRoute({
              path: [[lat, lng], [destinationPlace.latitude, destinationPlace.longitude]],
              distance: dist,
              duration: Math.max(1, Math.round(dist / 1.3 / 60)),
              instructions: [
                {
                  instructionEn: `Walk towards ${destinationPlace.nameEn || "destination"}`,
                  instructionAr: `امشِ باتجاه ${destinationPlace.nameAr || "الوجهة"}`,
                  distance: dist,
                  coordinate: [destinationPlace.latitude, destinationPlace.longitude]
                }
              ]
            });
            setCurrentStepIndex(0);
          }
        }
      }
    };

    const handleError = (err: GeolocationPositionError) => {
      console.warn("GPS Watch Error: ", err);
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
  }, [destinationPlace, isNavigating, nodes, edges, activeRoute, language, isMapReady, setActiveRoute, setCurrentStepIndex, setUserLocation, setCurrentUserLocation, setUserHeading, setAutoFollowEnabled, router, setRouteError]);

  // Listen to mobile device orientation/compass events to rotate the map
  useEffect(() => {
    if (typeof window === "undefined" || !window.addEventListener) return;
    if (!isNavigating) return;

    const handleOrientation = (e: DeviceOrientationEvent) => {
      let heading = 0;
      
      // On iOS devices, e.webkitCompassHeading exists
      if ((e as any).webkitCompassHeading !== undefined) {
        heading = (e as any).webkitCompassHeading;
      } else if (e.alpha !== null && e.alpha !== undefined) {
        // e.alpha is 0 to 360, relative to where the phone was pointing when initialized
        // if absolute is supported (Android Chrome), it is relative to magnetic north.
        heading = 360 - e.alpha;
      } else {
        return;
      }

      // Round to 1 decimal place to prevent sub-pixel layout thrashing
      const roundedHeading = Math.round(heading * 10) / 10;
      setUserHeading(roundedHeading);
    };

    // Request iOS orientation permission if required
    const requestiOSPermission = async () => {
      const DeviceOrientationEventAny = DeviceOrientationEvent as any;
      if (
        DeviceOrientationEventAny &&
        typeof DeviceOrientationEventAny.requestPermission === "function"
      ) {
        try {
          const permissionState = await DeviceOrientationEventAny.requestPermission();
          if (permissionState === "granted") {
            window.addEventListener("deviceorientation", handleOrientation, true);
          }
        } catch (err) {
          console.warn("DeviceOrientation permission request failed:", err);
        }
      } else {
        // Non-iOS or absolute orientation supported natively
        const windowAny = window as any;
        if ("ondeviceorientationabsolute" in windowAny) {
          windowAny.addEventListener("deviceorientationabsolute", handleOrientation, true);
        } else {
          windowAny.addEventListener("deviceorientation", handleOrientation, true);
        }
      }
    };

    requestiOSPermission();

    return () => {
      window.removeEventListener("deviceorientation", handleOrientation, true);
      window.removeEventListener("deviceorientationabsolute", handleOrientation, true);
    };
  }, [isNavigating, setUserHeading]);

  const handleRecenter = () => {
    const targetLoc = userLocation || currentUserLocation;
    if (targetLoc) {
      flyTo(targetLoc, 20); // Zoom in to level 20 close-up
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

          {/* Route Recalculation Error Banner */}
          {routeError && (
            <div className="flex items-start gap-2.5 bg-red-500/10 dark:bg-red-500/20 p-3 rounded-xl border border-red-500/20 text-red-700 dark:text-red-300 relative">
              <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5 animate-pulse" />
              <div className="flex-1">
                <span className="text-[11px] md:text-xs font-bold leading-normal">
                  {routeError}
                </span>
              </div>
              <button 
                onClick={() => setRouteError(null)} 
                className="text-red-700 dark:text-red-300 hover:text-red-950 dark:hover:text-red-100 flex-shrink-0 p-0.5 cursor-pointer transition-all hover:scale-105 active:scale-95"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

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
        <div className="pointer-events-auto bg-white/95 dark:bg-surface-lowest/95 backdrop-blur-2xl rounded-2xl p-4 shadow-2xl border border-outline-variant/10 flex flex-col gap-3">
          
          {destinationPlace.buildingId && (
            <button
              onClick={() => setShowIndoorModal(true)}
              className="w-full bg-primary hover:bg-primary-container text-white py-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer shadow-md"
            >
              <Map className="w-4 h-4" />
              <span>{language === "en" ? "Check For indoor location" : "التحقق من الموقع الداخلي"}</span>
            </button>
          )}

          <div className="flex items-center justify-between gap-4 w-full">
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

      {/* INDOOR NAV MODAL */}
      {showIndoorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 transition-all">
          <div 
            className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-outline-variant/15 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-fadeIn"
            dir={indoorLanguage === "ar" ? "rtl" : "ltr"}
          >
            
            {/* Header: Title + Language Switcher + Close */}
            <div className="p-5 pb-3 border-b border-outline-variant/10 flex justify-between items-center bg-surface-container/20">
              <div className="flex items-center gap-2 text-left">
                <Map className="w-5 h-5 text-primary" />
                <div>
                  <h3 className="text-sm md:text-base font-black text-on-surface">
                    {indoorLanguage === "en" ? "Indoor Navigator" : "الملاحة الداخلية"}
                  </h3>
                  <p className="text-[10px] text-secondary font-medium mt-0.5">
                    {indoorLanguage === "en" ? "Interactive blueprint layout routing" : "مخطط تفاعلي لمسار الملاحة"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {/* Language selection toggles */}
                <div className="bg-surface-container border border-outline-variant/10 rounded-xl p-1 flex items-center gap-1">
                  <button
                    onClick={() => setIndoorLanguage("en")}
                    className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all ${indoorLanguage === "en" ? "bg-primary text-white" : "text-secondary hover:text-on-surface"}`}
                  >
                    EN
                  </button>
                  <button
                    onClick={() => setIndoorLanguage("ar")}
                    className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all ${indoorLanguage === "ar" ? "bg-primary text-white" : "text-secondary hover:text-on-surface"}`}
                  >
                    AR
                  </button>
                </div>

                <button 
                  onClick={() => { setShowIndoorModal(false); setUserIndoorPos(null); }}
                  className="p-1.5 hover:bg-surface-variant/20 rounded-full text-secondary hover:text-on-surface transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Floor Tabs switcher */}
            <div className="p-4 border-b border-outline-variant/5 bg-surface-container/5 overflow-x-auto flex flex-row gap-2 flex-nowrap scrollbar-hide">
              {[0, 1, 2, 3, 4].map((floorNum) => {
                const floorNamesEn = ["Ground Floor", "1st Floor", "2nd Floor", "3rd Floor", "4th Floor"];
                const floorNamesAr = ["الطابق الأرضي", "الطابق الأول", "الطابق الثاني", "الطابق الثالث", "الطابق الرابع"];
                const floorLabel = indoorLanguage === "en" ? floorNamesEn[floorNum] : floorNamesAr[floorNum];

                return (
                  <button
                    key={floorNum}
                    onClick={() => {
                      setActiveFloor(floorNum);
                      setUserIndoorPos(null);
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex-shrink-0 active:scale-95 ${
                      activeFloor === floorNum 
                        ? "bg-primary text-white shadow-md shadow-primary/10" 
                        : "bg-surface-container border border-outline-variant/10 text-secondary hover:text-on-surface"
                    }`}
                  >
                    {floorLabel}
                  </button>
                );
              })}
            </div>

            {/* Modal Body / Map */}
            <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4 text-center justify-center">
              {(() => {
                const currentMap = indoorMaps.find(m => m.floor === activeFloor);

                if (!currentMap) {
                  const floorNamesEn = ["Ground Floor", "1st Floor", "2nd Floor", "3rd Floor", "4th Floor"];
                  const floorNamesAr = ["الطابق الأرضي", "الطابق الأول", "الطابق الثاني", "الطابق الثالث", "الطابق الرابع"];
                  const errorEn = `There's no ${floorNamesEn[activeFloor].toLowerCase()}`;
                  const errorAr = `لا يوجد ${floorNamesAr[activeFloor]}`;
                  
                  return (
                    <div className="py-12 flex flex-col items-center justify-center gap-3 animate-fadeIn">
                      <div className="w-12 h-12 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center">
                        <AlertCircle className="w-6 h-6" />
                      </div>
                      <h4 className="font-black text-sm text-on-surface">
                        {indoorLanguage === "en" ? "Floor Map Not Available" : "مخطط الطابق غير متوفر"}
                      </h4>
                      <p className="text-xs text-red-500 font-bold leading-normal">
                        {indoorLanguage === "en" ? errorEn : errorAr}
                      </p>
                    </div>
                  );
                }

                // Map exist: render layout
                const isCorrectFloor = activeFloor === destinationPlace.floor;
                const hasDestinationCoords = destinationPlace.indoorX !== null && destinationPlace.indoorY !== null;
                const destRoomName = indoorLanguage === "en" ? destinationPlace.nameEn : (destinationPlace.displayNameAr || destinationPlace.nameAr);

                return (
                  <div className="flex flex-col gap-4 animate-fadeIn">
                    
                    {/* Status callout banner */}
                    <div className={`p-3.5 rounded-2xl text-xs font-bold flex gap-2.5 items-center text-left ${
                      !userIndoorPos 
                        ? "bg-primary/5 border border-primary/10 text-primary"
                        : !isCorrectFloor
                          ? "bg-amber-500/10 border border-amber-500/20 text-amber-600 animate-pulse"
                          : !hasDestinationCoords
                            ? "bg-amber-500/10 border border-amber-500/20 text-amber-600"
                            : "bg-emerald-500/10 border border-emerald-500/20 text-emerald-600"
                    }`}>
                      <AlertCircle className="w-5 h-5 flex-shrink-0" />
                      <span>
                        {!userIndoorPos ? (
                          indoorLanguage === "en"
                            ? "Please click anywhere on the floor map image to set where you are standing."
                            : "يرجى النقر على صورة مخطط الطابق لتحديد مكان وقوفك."
                        ) : !isCorrectFloor ? (
                          (() => {
                            const destFloorEn = ["Ground Floor", "1st Floor", "2nd Floor", "3rd Floor", "4th Floor"][destinationPlace.floor || 0];
                            const destFloorAr = ["الطابق الأرضي", "الطابق الأول", "الطابق الثاني", "الطابق الثالث", "الطابق الرابع"][destinationPlace.floor || 0];
                            return indoorLanguage === "en"
                              ? `Go to the ${destFloorEn}`
                              : `اذهب إلى ${destFloorAr}`;
                          })()
                        ) : !hasDestinationCoords ? (
                          indoorLanguage === "en"
                            ? "Destination coordinates have not been set on this floor plan by the administrator yet."
                            : "لم يتم تعيين إحداثيات الوجهة على هذا المخطط من قبل المسؤول بعد."
                        ) : (
                          indoorLanguage === "en"
                            ? `Perfect! Direct indoor wayfinding path to "${destRoomName}" loaded.`
                            : `ممتاز! تم تحميل مسار الملاحة الداخلية المباشر إلى "${destRoomName}".`
                        )}
                      </span>
                    </div>

                    {/* Interactive Click Map */}
                    <div 
                      className="relative bg-slate-900 border border-outline-variant/15 rounded-2xl overflow-hidden flex items-center justify-center p-3 cursor-crosshair select-none max-h-[450px] w-full"
                    >
                      <div
                        onClick={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          const x = ((e.clientX - rect.left) / rect.width) * 100;
                          const y = ((e.clientY - rect.top) / rect.height) * 100;
                          setUserIndoorPos({ x, y });
                        }}
                        className="relative inline-block max-w-full"
                      >
                        <img
                          src={currentMap.imageUrl}
                          alt="Floor blueprint plan"
                          className="max-w-full max-h-[380px] object-contain pointer-events-none block"
                        />

                        {/* Line connecting user and target (only when correct floor) */}
                        {userIndoorPos && isCorrectFloor && hasDestinationCoords && (
                          <>
                            <style>{`
                              @keyframes indoorDash {
                                to {
                                  stroke-dashoffset: -20;
                                }
                              }
                            `}</style>
                            <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
                              <line
                                x1={`${userIndoorPos.x}%`}
                                y1={`${userIndoorPos.y}%`}
                                x2={`${destinationPlace.indoorX}%`}
                                y2={`${destinationPlace.indoorY}%`}
                                stroke="#e51245"
                                strokeWidth="4.5"
                                strokeDasharray="6,6"
                                style={{ animation: 'indoorDash 1s linear infinite' }}
                              />
                            </svg>
                          </>
                        )}

                        {/* User Current Position Pin */}
                        {userIndoorPos && (
                          <div
                            style={{ left: `${userIndoorPos.x}%`, top: `${userIndoorPos.y}%` }}
                            className="absolute w-4.5 h-4.5 -ml-2.25 -mt-2.25 bg-blue-500 rounded-full border-2 border-white shadow-xl flex items-center justify-center pointer-events-none animate-pulse z-20"
                          >
                            <div className="w-1.5 h-1.5 bg-white rounded-full" />
                          </div>
                        )}

                        {/* Target Destination Pin (only visible on correct floor) */}
                        {isCorrectFloor && hasDestinationCoords && (
                          <div
                            style={{ left: `${destinationPlace.indoorX}%`, top: `${destinationPlace.indoorY}%` }}
                            className="absolute w-5 h-5 -ml-2.5 -mt-2.5 flex items-center justify-center z-25 group"
                          >
                            <MapPin className="w-5 h-5 text-red-500 filter drop-shadow-md animate-bounce" />
                            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded shadow-lg whitespace-nowrap font-black">
                              {destRoomName}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-outline-variant/10 bg-surface-container/20 flex justify-end">
              <button
                onClick={() => { setShowIndoorModal(false); setUserIndoorPos(null); }}
                className="bg-primary hover:bg-primary-container text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-md"
              >
                {indoorLanguage === "en" ? "Close" : "إغلاق"}
              </button>
            </div>

          </div>
        </div>
      )}

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
