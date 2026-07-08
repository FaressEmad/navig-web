"use client";

import * as turf from "@turf/turf";
import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Layout from "../../components/Layout";
import CampusMap from "../../components/CampusMap";
import { useStore } from "../../hooks/useStore";
import { useTranslation } from "../../hooks/useTranslation";
import { Place, NavigationNode, NavigationEdge } from "../../types";
import { generateRoute } from "../../services/routing";
import { CampusBoundaryService } from "../../services/campusBoundary";
import { 
  Navigation2, 
  MapPin,
  Search,
  Crosshair,
  X,
  ChevronRight,
  Locate,
  ArrowRight,
  Building,
  Compass
} from "lucide-react";

interface SearchPageClientProps {
  places: Place[];
  nodes: NavigationNode[];
  edges: NavigationEdge[];
}

export default function SearchPageClient({ places, nodes, edges }: SearchPageClientProps) {
  const router = useRouter();
  const { t, language } = useTranslation();
  const { 
    setStartPlace,
    setDestinationPlace,
    setActiveRoute,
    setIsNavigating,
    setCurrentStepIndex,
    userLocation,
    setUserLocation,
    flyTo,
    setNodes,
    setEdges,
    boundaryGeoJSON,
    startPlace,
    destinationPlace,
    isSelectingManualStart,
    setSelectingManualStart,
    setCurrentUserLocation
  } = useStore();

  const isRtl = language === "ar";

  // Route setup local state
  const [startQuery, setStartQuery] = useState("");
  const [destQuery, setDestQuery] = useState("");
  const [activeField, setActiveField] = useState<"start" | "dest" | null>(null);
  const [isDetectingGPS, setIsDetectingGPS] = useState(false);
  const [showOutsideModal, setShowOutsideModal] = useState(false);

  // Sync input values with store selection state dynamically
  useEffect(() => {
    if (startPlace) {
      setStartQuery(language === "en" ? startPlace.nameEn : startPlace.nameAr);
    } else {
      setStartQuery("");
    }
  }, [startPlace, language]);

  useEffect(() => {
    if (destinationPlace) {
      setDestQuery(language === "en" ? destinationPlace.nameEn : destinationPlace.nameAr);
    } else {
      setDestQuery("");
    }
  }, [destinationPlace, language]);

  // Initialize nodes/edges on mount
  useEffect(() => {
    setNodes(nodes);
    setEdges(edges);
    // Center map on campus clock tower on startup
    flyTo([30.0275, 31.2085], 16);
  }, [nodes, edges, setNodes, setEdges]);

  // Filtered search results (restricted to campus boundary only)
  const searchResults = useMemo(() => {
    const insideBoundaryPlaces = places.filter((place) => {
      if (!boundaryGeoJSON) return true;
      const polyFeature = boundaryGeoJSON.type === "FeatureCollection" ? boundaryGeoJSON.features[0] : boundaryGeoJSON;
      const pt = turf.point([place.longitude, place.latitude]);
      return turf.booleanPointInPolygon(pt, polyFeature);
    });

    const query = activeField === "start" ? startQuery : destQuery;
    if (!query.trim()) return insideBoundaryPlaces;

    return insideBoundaryPlaces.filter((place) => {
      const q = query.toLowerCase();
      const nameEn = place.nameEn.toLowerCase();
      const nameAr = place.nameAr.toLowerCase();
      const displayAr = (place.displayNameAr || "").toLowerCase();
      const aliases = place.aliases ? place.aliases.toLowerCase().split(",") : [];
      const matchesAliases = aliases.some(a => a.trim().includes(q));

      return nameEn.includes(q) || nameAr.includes(q) || displayAr.includes(q) || matchesAliases;
    });
  }, [activeField, startQuery, destQuery, places, boundaryGeoJSON]);

  // Handle selecting a place from search results
  const handleSelectPlace = (place: Place) => {
    if (activeField === "start") {
      setStartPlace(place);
      // Move the blue dot to the selected start location
      setUserLocation([place.latitude, place.longitude]);
    } else if (activeField === "dest") {
      setDestinationPlace(place);
    }
    setActiveField(null);
    flyTo([place.latitude, place.longitude], 17);
  };

  // Browser GPS current location selection handler with Turf.js validation
  const handleUseCurrentLocation = () => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      alert(language === "en" 
        ? "Geolocation is not supported by your browser." 
        : "تحديد الموقع الجغرافي غير مدعوم في متصفحك.");
      return;
    }

    setIsDetectingGPS(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsDetectingGPS(false);
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        // Set current user location state for any received GPS updates
        setCurrentUserLocation([lat, lng]);

        const isInside = CampusBoundaryService.isInsideCampus(lat, lng);

        if (!isInside) {
          // Show custom modal dialog, reset route selection, and abort
          setShowOutsideModal(true);
          setStartPlace(null);
          setStartQuery("");
          return;
        }

        // Inside campus: continue normally
        const currentStart: Place = {
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

        setStartPlace(currentStart);
        setUserLocation([lat, lng]);
        setActiveField(null);
        flyTo([lat, lng], 17);
      },
      (error) => {
        setIsDetectingGPS(false);
        console.warn("GPS detection failed:", error);
        alert(language === "en" 
          ? "Failed to detect your GPS location. Please choose a starting point manually." 
          : "فشل تحديد موقعك الجغرافي. يرجى اختيار نقطة البداية يدوياً.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Launch navigation
  const handleStartNavigation = async () => {
    // Determine start coordinates
    let startCoords: [number, number];

    if (startPlace) {
      startCoords = [startPlace.latitude, startPlace.longitude];
    } else {
      alert(language === "en" ? "Please select a starting point." : "يرجى اختيار نقطة البداية.");
      return;
    }

    if (!destinationPlace) {
      alert(language === "en" ? "Please select a destination." : "يرجى اختيار الوجهة.");
      return;
    }

    // Double check that both start and destination are inside the boundary
    if (!CampusBoundaryService.isInsideCampus(startPlace.latitude, startPlace.longitude) ||
        !CampusBoundaryService.isInsideCampus(destinationPlace.latitude, destinationPlace.longitude)) {
      alert(language === "en"
        ? "Cannot start navigation. Both start and destination locations must be inside Cairo University."
        : "لا يمكن بدء الملاحة. يجب أن تكون كل من نقطة البداية والوجهة داخل جامعة القاهرة.");
      return;
    }

    // Set global store userLocation state to start coordinates
    setUserLocation(startCoords);

    // Compute route using OSRM
    const route = await generateRoute(startPlace, destinationPlace);
    if (route) {
      setActiveRoute(route);
    } else {
      // Fallback straight line route
      setActiveRoute({
        path: [startCoords, [destinationPlace.latitude, destinationPlace.longitude]],
        distance: Math.round(
          haversineDistance(startCoords[0], startCoords[1], destinationPlace.latitude, destinationPlace.longitude)
        ),
        duration: Math.round(
          haversineDistance(startCoords[0], startCoords[1], destinationPlace.latitude, destinationPlace.longitude) / 1.3 / 60
        ),
        instructions: [
          {
            instructionEn: `Walk towards ${destinationPlace.nameEn}`,
            instructionAr: `امشِ باتجاه ${destinationPlace.nameAr}`,
            distance: Math.round(
              haversineDistance(startCoords[0], startCoords[1], destinationPlace.latitude, destinationPlace.longitude)
            ),
            coordinate: [destinationPlace.latitude, destinationPlace.longitude]
          }
        ]
      });
    }

    setIsNavigating(true);
    setCurrentStepIndex(0);
    router.push("/navigation");
  };

  // Helper: Haversine distance in meters
  function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371e3;
    const toRad = (d: number) => (d * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  const canStart = startPlace && destinationPlace;

  return (
    <Layout>
      <div className="flex-1 flex flex-col md:flex-row relative w-full h-[calc(100vh-73px)] overflow-hidden">
        
        {/* Fullscreen Map Background */}
        <div className="absolute inset-0 z-10 w-full h-full">
          <CampusMap places={places} />
        </div>

        {/* Subtle glassmorphic overlay to make the route card stand out */}
        <div className="absolute inset-0 bg-black/15 dark:bg-black/35 backdrop-blur-[1px] z-20 pointer-events-none" />

        {/* Banner informing the user to tap the map during manual starting point selection */}
        {isSelectingManualStart && (
          <div className="absolute top-4 left-4 right-4 z-40 max-w-md mx-auto pointer-events-none">
            <div className="bg-primary text-white p-4 rounded-2xl shadow-xl border border-primary/20 flex items-center justify-between pointer-events-auto animate-bounce">
              <div className="flex items-center gap-2.5">
                <Compass className="w-5 h-5 animate-spin" />
                <p className="text-xs font-bold">
                  {language === "en"
                    ? "Tap anywhere inside Cairo University to choose your starting point."
                    : "انقر في أي مكان داخل جامعة القاهرة لاختيار نقطة البداية."}
                </p>
              </div>
              <button
                onClick={() => setSelectingManualStart(false)}
                className="p-1 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Custom dialog shown if the user GPS coordinate check fails */}
        {showOutsideModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm bg-surface-lowest border border-outline-variant/15 rounded-3xl shadow-2xl overflow-hidden p-6 flex flex-col items-center text-center gap-5">
              <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-600 flex items-center justify-center">
                <MapPin className="w-6 h-6" />
              </div>
              
              <div>
                <h3 className="text-base font-black text-on-surface mb-2">
                  {language === "en" ? "Outside Cairo University" : "خارج جامعة القاهرة"}
                </h3>
                <p className="text-xs text-secondary leading-relaxed">
                  {language === "en" 
                    ? "Your current GPS location is outside Cairo University."
                    : "موقعك الجغرافي الحالي خارج جامعة القاهرة."}
                  <br />
                  {language === "en"
                    ? "Please choose one of the following options."
                    : "يرجى اختيار أحد الخيارات التالية."}
                </p>
              </div>

              <div className="flex flex-col gap-2 w-full mt-2">
                <button
                  onClick={() => {
                    setShowOutsideModal(false);
                    setSelectingManualStart(true);
                  }}
                  className="w-full bg-primary hover:bg-primary-container text-white py-3 rounded-xl font-bold text-xs transition-all active:scale-[0.98] cursor-pointer"
                >
                  {language === "en" ? "Use Manual Starting Point" : "تحديد نقطة بداية يدوياً"}
                </button>
                
                <button
                  onClick={() => {
                    setShowOutsideModal(false);
                    handleUseCurrentLocation();
                  }}
                  className="w-full bg-surface-container hover:bg-surface-container-high text-on-surface py-3 rounded-xl font-bold text-xs transition-all active:scale-[0.98] border border-outline-variant/10 cursor-pointer"
                >
                  {language === "en" ? "Try Again" : "إعادة المحاولة"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Route Setup Floating Card — overlays the background (Hidden during manual starting point selection) */}
        {!isSelectingManualStart && (
          <div className="absolute inset-0 z-30 flex items-end md:items-center justify-center pointer-events-none p-4 md:p-8">
          <div className="pointer-events-auto w-full max-w-md bg-surface-lowest/95 backdrop-blur-2xl border border-outline-variant/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden">

            {/* Header */}
            <div className="p-5 pb-3 border-b border-outline-variant/5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <Compass className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h2 className="text-sm font-black text-on-surface">{t("planRoute")}</h2>
                  <p className="text-[10px] text-secondary font-semibold">{t("planRouteDesc")}</p>
                </div>
              </div>
            </div>

            {/* Route Inputs */}
            <div className="p-5 flex flex-col gap-3">

              {/* START POINT */}
              <div className="flex items-stretch gap-2">
                <div className="flex flex-col items-center justify-center pt-1">
                  <div className="w-3 h-3 rounded-full bg-blue-500 border-2 border-blue-300 shadow-sm" />
                  <div className="w-[2px] flex-1 bg-outline-variant/15 my-1" />
                </div>
                <div className="flex-1 flex flex-col gap-1.5">
                  <label className="text-[9px] font-bold text-secondary uppercase tracking-wider pl-0.5">
                    {t("fromLabel")}
                  </label>

                  {/* Pick manually */}
                  <div className="relative">
                    <input
                      type="text"
                      value={startQuery}
                      onChange={(e) => {
                        setStartQuery(e.target.value);
                        setActiveField("start");
                        setStartPlace(null);
                      }}
                      onFocus={() => setActiveField("start")}
                      placeholder={language === "en" ? "Search starting place..." : "...ابحث عن نقطة بداية"}
                      className="w-full bg-surface-container border border-outline-variant/10 rounded-xl px-3 py-2.5 text-xs text-on-surface outline-none placeholder:text-secondary/50 focus:border-primary/30 transition-all"
                    />
                    {startPlace && (
                      <button onClick={() => { setStartPlace(null); setStartQuery(""); }} className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-secondary hover:text-on-surface">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* DESTINATION POINT */}
              <div className="flex items-stretch gap-2">
                <div className="flex flex-col items-center justify-center pt-1">
                  <div className="w-3 h-3 rounded-full bg-red-500 border-2 border-red-300 shadow-sm" />
                </div>
                <div className="flex-1 flex flex-col gap-1.5">
                  <label className="text-[9px] font-bold text-secondary uppercase tracking-wider pl-0.5">
                    {t("toLabel")}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={destQuery}
                      onChange={(e) => {
                        setDestQuery(e.target.value);
                        setActiveField("dest");
                        setDestinationPlace(null);
                      }}
                      onFocus={() => setActiveField("dest")}
                      placeholder={language === "en" ? "Where are you going?" : "...إلى أين تريد الذهاب؟"}
                      className="w-full bg-surface-container border border-outline-variant/10 rounded-xl px-3 py-2.5 text-xs text-on-surface outline-none placeholder:text-secondary/50 focus:border-primary/30 transition-all"
                    />
                    {destinationPlace && (
                      <button onClick={() => { setDestinationPlace(null); setDestQuery(""); }} className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-secondary hover:text-on-surface">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Search Results Dropdown */}
              {activeField && (
                <div className="max-h-[200px] overflow-y-auto bg-surface-container/50 border border-outline-variant/5 rounded-2xl divide-y divide-outline-variant/5">
                  {activeField === "start" && (
                    <button
                      onClick={handleUseCurrentLocation}
                      disabled={isDetectingGPS}
                      className="w-full flex items-center gap-3 p-3 hover:bg-primary/5 transition-all text-left active:scale-[0.98] border-b border-outline-variant/10 text-primary font-bold cursor-pointer disabled:opacity-50"
                    >
                      <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                        <Locate className={`w-3.5 h-3.5 ${isDetectingGPS ? "animate-spin" : ""}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-primary truncate">
                          {isDetectingGPS 
                            ? (language === "en" ? "Detecting GPS location..." : "جاري تحديد موقعك الجغرافي...")
                            : (language === "en" ? "Use My Current Location" : "استخدم موقعي الحالي")}
                        </p>
                      </div>
                    </button>
                  )}
                  {searchResults.length === 0 ? (
                    <div className="p-4 text-center text-xs text-secondary">
                      {language === "en" ? "No places found." : "لا توجد أماكن."}
                    </div>
                  ) : (
                    searchResults.map((place) => (
                      <button
                        key={place.id}
                        onClick={() => handleSelectPlace(place)}
                        className="w-full flex items-center gap-3 p-3 hover:bg-primary/5 transition-all text-left active:scale-[0.98]"
                      >
                        <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                          <Building className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-on-surface truncate">
                            {language === "en" ? place.nameEn : (place.displayNameAr || place.nameAr)}
                          </p>
                          <p className="text-[10px] text-secondary truncate">
                            {language === "en" ? place.nameAr : place.nameEn} · {place.type.replace("_", " ")}
                          </p>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-secondary flex-shrink-0" />
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Start Navigation Button */}
            <div className="p-5 pt-0">
              <button
                onClick={handleStartNavigation}
                disabled={!canStart}
                className={`w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2.5 transition-all active:scale-[0.97] shadow-lg cursor-pointer ${
                  canStart
                    ? "bg-primary hover:bg-primary-container text-white shadow-primary/20"
                    : "bg-surface-container text-secondary/50 cursor-not-allowed shadow-none"
                }`}
              >
                <Navigation2 className="w-4.5 h-4.5 transform rotate-45" />
                <span>{language === "en" ? "Start Navigation" : "ابدأ الملاحة"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
        )}

      </div>
    </Layout>
  );
}
