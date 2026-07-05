"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Layout from "../../components/Layout";
import CampusMap from "../../components/CampusMap";
import { useStore } from "../../hooks/useStore";
import { useTranslation } from "../../hooks/useTranslation";
import { Place, NavigationNode, NavigationEdge } from "../../types";
import { generateRoute } from "../../services/routing";
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
    setEdges
  } = useStore();

  const isRtl = language === "ar";

  // Route setup local state
  const [startQuery, setStartQuery] = useState("");
  const [destQuery, setDestQuery] = useState("");
  const [selectedStart, setSelectedStart] = useState<Place | null>(null);
  const [selectedDest, setSelectedDest] = useState<Place | null>(null);
  const [activeField, setActiveField] = useState<"start" | "dest" | null>(null);
  // Initialize nodes/edges on mount
  useEffect(() => {
    setNodes(nodes);
    setEdges(edges);
    // Center map on campus clock tower on startup
    flyTo([30.0275, 31.2085], 16);
  }, [nodes, edges, setNodes, setEdges]);

  // Filtered search results
  const searchResults = useMemo(() => {
    const query = activeField === "start" ? startQuery : destQuery;
    if (!query.trim()) return places;

    return places.filter((place) => {
      const q = query.toLowerCase();
      const nameEn = place.nameEn.toLowerCase();
      const nameAr = place.nameAr.toLowerCase();
      const displayAr = (place.displayNameAr || "").toLowerCase();
      const aliases = place.aliases ? place.aliases.toLowerCase().split(",") : [];
      const matchesAliases = aliases.some(a => a.trim().includes(q));

      return nameEn.includes(q) || nameAr.includes(q) || displayAr.includes(q) || matchesAliases;
    });
  }, [activeField, startQuery, destQuery, places]);

  // Handle selecting a place from search results
  const handleSelectPlace = (place: Place) => {
    if (activeField === "start") {
      setSelectedStart(place);
      setStartQuery(language === "en" ? place.nameEn : place.nameAr);
      // Move the blue dot to the selected start location
      setUserLocation([place.latitude, place.longitude]);
    } else if (activeField === "dest") {
      setSelectedDest(place);
      setDestQuery(language === "en" ? place.nameEn : place.nameAr);
    }
    setActiveField(null);
    flyTo([place.latitude, place.longitude], 17);
  };

  // Launch navigation
  const handleStartNavigation = () => {
    // Determine start coordinates
    let startCoords: [number, number];
    let startPlaceObj: Place;

    if (selectedStart) {
      startCoords = [selectedStart.latitude, selectedStart.longitude];
      startPlaceObj = selectedStart;
    } else {
      alert(language === "en" ? "Please select a starting point." : "يرجى اختيار نقطة البداية.");
      return;
    }

    if (!selectedDest) {
      alert(language === "en" ? "Please select a destination." : "يرجى اختيار الوجهة.");
      return;
    }

    // Set global store state
    setStartPlace(startPlaceObj);
    setDestinationPlace(selectedDest);
    setUserLocation(startCoords);

    // Compute route using Dijkstra
    const route = generateRoute(startPlaceObj, selectedDest, nodes, edges);
    if (route) {
      setActiveRoute(route);
    } else {
      // Fallback straight line route
      setActiveRoute({
        path: [startCoords, [selectedDest.latitude, selectedDest.longitude]],
        distance: Math.round(
          haversineDistance(startCoords[0], startCoords[1], selectedDest.latitude, selectedDest.longitude)
        ),
        duration: Math.round(
          haversineDistance(startCoords[0], startCoords[1], selectedDest.latitude, selectedDest.longitude) / 1.3 / 60
        ),
        instructions: [
          {
            instructionEn: `Walk towards ${selectedDest.nameEn}`,
            instructionAr: `امشِ باتجاه ${selectedDest.nameAr}`,
            distance: Math.round(
              haversineDistance(startCoords[0], startCoords[1], selectedDest.latitude, selectedDest.longitude)
            ),
            coordinate: [selectedDest.latitude, selectedDest.longitude]
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

  const canStart = selectedStart && selectedDest;

  return (
    <Layout>
      <div className="flex-1 flex flex-col md:flex-row relative w-full h-[calc(100vh-73px)] overflow-hidden">

        {/* Map Background — always visible behind the form */}
        <div className="flex-1 h-full relative">
          <CampusMap places={places} />
        </div>

        {/* Route Setup Floating Card — overlays the map */}
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
                        setSelectedStart(null);
                      }}
                      onFocus={() => setActiveField("start")}
                      placeholder={language === "en" ? "Search starting place..." : "...ابحث عن نقطة بداية"}
                      className="w-full bg-surface-container border border-outline-variant/10 rounded-xl px-3 py-2.5 text-xs text-on-surface outline-none placeholder:text-secondary/50 focus:border-primary/30 transition-all"
                    />
                    {selectedStart && (
                      <button onClick={() => { setSelectedStart(null); setStartQuery(""); }} className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-secondary hover:text-on-surface">
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
                        setSelectedDest(null);
                      }}
                      onFocus={() => setActiveField("dest")}
                      placeholder={language === "en" ? "Where are you going?" : "...إلى أين تريد الذهاب؟"}
                      className="w-full bg-surface-container border border-outline-variant/10 rounded-xl px-3 py-2.5 text-xs text-on-surface outline-none placeholder:text-secondary/50 focus:border-primary/30 transition-all"
                    />
                    {selectedDest && (
                      <button onClick={() => { setSelectedDest(null); setDestQuery(""); }} className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-secondary hover:text-on-surface">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Search Results Dropdown */}
              {activeField && (
                <div className="max-h-[200px] overflow-y-auto bg-surface-container/50 border border-outline-variant/5 rounded-2xl divide-y divide-outline-variant/5">
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

      </div>
    </Layout>
  );
}
