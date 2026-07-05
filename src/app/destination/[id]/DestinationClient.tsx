"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore } from "../../../hooks/useStore";
import { useTranslation } from "../../../hooks/useTranslation";
import { Place } from "../../../types";
import { generateRoute } from "../../../services/routing";
import { 
  ArrowLeft, 
  MapPin, 
  Layers, 
  BookOpen, 
  Navigation,
  School,
  Building,
  CornerDownRight,
  Info
} from "lucide-react";

interface DestinationClientProps {
  place: Place;
  allPlaces: Place[];
}

export default function DestinationClient({ place, allPlaces }: DestinationClientProps) {
  const router = useRouter();
  const { t, language } = useTranslation();
  const { 
    setStartPlace,
    setDestinationPlace,
    setIsNavigating,
    setActiveRoute,
    setActiveSheet,
    setSelectedPlace,
    userLocation
  } = useStore();

  const isRtl = language === "ar";
  const name = language === "en" ? place.nameEn : place.nameAr;
  const desc = language === "en" ? place.descriptionEn : place.descriptionAr;

  const handleStartNav = () => {
    const currentLoc = userLocation;
    let startPoint: Place;

    if (currentLoc) {
      startPoint = {
        id: "current-location",
        nameEn: "Current Location",
        nameAr: "موقعك الحالي",
        descriptionEn: "Current detected user location",
        descriptionAr: "موقع المستخدم الحالي المكتشف",
        type: "LANDMARK",
        latitude: currentLoc[0],
        longitude: currentLoc[1],
        floor: null,
        roomNumber: null,
        facultyId: null,
        buildingId: null,
      };
    } else {
      startPoint = allPlaces.find(p => p.id === "gate-1") || allPlaces[0];
    }

    setStartPlace(startPoint);
    setDestinationPlace(place);
    setSelectedPlace(place);

    const nodes = useStore.getState().nodes;
    const edges = useStore.getState().edges;
    const route = generateRoute(startPoint, place, nodes, edges);
    
    if (route) {
      setActiveRoute(route);
    } else {
      // Fallback
      setActiveRoute({
        path: [[startPoint.latitude, startPoint.longitude], [place.latitude, place.longitude]],
        distance: 380,
        duration: 5,
        instructions: [
          { instructionEn: "Depart from starting point", instructionAr: "التحرك من نقطة البداية", distance: 380, coordinate: [startPoint.latitude, startPoint.longitude] }
        ]
      });
    }
    
    setIsNavigating(true);
    setActiveSheet("navigation");
    router.push("/search");
  };

  // Get type icon
  const getIcon = (type: string) => {
    switch (type) {
      case "FACULTY_BUILDING": return School;
      case "GATE": return MapPin;
      case "LANDMARK": return Info;
      default: return Building;
    }
  };

  const IconComponent = getIcon(place.type);

  return (
    <div className="flex-1 flex flex-col md:py-8 items-center px-margin-mobile md:px-margin-desktop bg-background/50">
      <div className="w-full max-w-2xl bg-surface-lowest rounded-3xl border border-outline-variant/10 shadow-xl overflow-hidden flex flex-col">
        {/* Visual Header Image or solid stylized color block */}
        <div className="relative h-56 w-full bg-gradient-to-tr from-secondary to-primary/80 flex items-center justify-center text-white overflow-hidden">
          <div className="absolute inset-0 bg-black/30 z-10" />
          <div className="relative z-20 flex flex-col items-center gap-2 px-6 text-center">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center">
              <IconComponent className="w-7 h-7 text-white" />
            </div>
            <span className="text-xs font-black tracking-widest uppercase bg-white/25 backdrop-blur-sm px-3.5 py-1.5 rounded-full">
              {place.type.replace("_", " ")}
            </span>
          </div>
          <button 
            onClick={() => router.back()}
            className="absolute top-4 left-4 z-20 p-2.5 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full text-white transition-all active:scale-95 flex items-center justify-center"
          >
            <ArrowLeft className={`w-4 h-4 ${isRtl ? "rotate-180" : ""}`} />
          </button>
        </div>

        {/* Info Content Area */}
        <div className="p-6 md:p-8 flex flex-col gap-6">
          <div className="text-left border-b border-outline-variant/10 pb-6">
            <h2 className="text-2xl font-black text-on-surface leading-tight mb-3">{name}</h2>
            {desc ? (
              <p className="text-sm md:text-base text-secondary leading-relaxed">{desc}</p>
            ) : (
              <p className="text-sm text-secondary italic">No description available in this language.</p>
            )}
          </div>

          {/* Coordinate Meta details */}
          <div className="flex items-center gap-4 text-xs font-bold text-secondary bg-surface-container/50 p-4 rounded-2xl border border-outline-variant/5">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-primary" />
              <span>{place.latitude.toFixed(5)}, {place.longitude.toFixed(5)}</span>
            </div>
            {place.floor !== null && (
              <div className="flex items-center gap-1.5 border-l border-outline-variant/20 pl-4">
                <Layers className="w-4 h-4 text-secondary" />
                <span>{t("floorAbbr")} {place.floor}</span>
              </div>
            )}
          </div>

          {/* Room references list inside the building */}
          <div className="flex flex-col gap-3 border-b border-outline-variant/10 pb-6">
            <h3 className="font-bold text-sm text-on-surface flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-primary" />
              <span>{t("referencesLabel")}</span>
            </h3>
            {!place.indoorPlaces || place.indoorPlaces.length === 0 ? (
              <p className="text-xs font-medium text-secondary italic py-2 pl-2">
                {t("noReferences")}
              </p>
            ) : (
              <div className="grid sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto scrollbar-hide">
                {place.indoorPlaces.map((room) => {
                  const roomName = language === "en" ? room.nameEn : room.nameAr;
                  return (
                    <div 
                      key={room.id}
                      onClick={() => {
                        setSelectedPlace(room);
                        router.push("/search");
                      }}
                      className="flex items-center justify-between p-3 bg-surface-container hover:bg-surface-container-high rounded-xl cursor-pointer transition-all active:scale-[0.98] border border-outline-variant/5"
                    >
                      <div className="flex items-center gap-2 text-left min-w-0">
                        <CornerDownRight className="w-3.5 h-3.5 text-secondary flex-shrink-0" />
                        <span className="text-xs font-bold text-on-surface truncate">{roomName}</span>
                      </div>
                      {room.floor !== null && (
                        <span className="text-[10px] font-bold bg-secondary/10 text-secondary px-2 py-0.5 rounded-md">
                          {t("floorAbbr")} {room.floor}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Start Navigation Action button */}
          <div className="pt-2">
            <button
              onClick={handleStartNav}
              className="w-full bg-primary hover:bg-primary-container text-white py-4 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <Navigation className="w-4 h-4 transform rotate-45" />
              <span>{t("getDirections")}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
