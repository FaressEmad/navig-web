"use client";

import React from "react";
import { useStore } from "../hooks/useStore";
import { useTranslation } from "../hooks/useTranslation";
import { Place } from "../types";
import { generateRoute } from "../services/routing";
import { 
  X, 
  Navigation, 
  MapPin, 
  Layers, 
  BookOpen, 
  Calendar,
  Building,
  School,
  CornerDownRight,
  Info
} from "lucide-react";

interface PlaceDetailsCardProps {
  places: Place[];
}

export default function PlaceDetailsCard({ places }: PlaceDetailsCardProps) {
  const { t, language } = useTranslation();
  const { 
    selectedPlace, 
    setSelectedPlace,
    setStartPlace,
    setDestinationPlace,
    setIsNavigating,
    setActiveRoute,
    setActiveSheet,
    userLocation
  } = useStore();

  if (!selectedPlace) return null;

  const isRtl = language === "ar";
  const name = language === "en" ? selectedPlace.nameEn : selectedPlace.nameAr;
  const desc = language === "en" ? selectedPlace.descriptionEn : selectedPlace.descriptionAr;

  // Filter classrooms/offices that are located inside this specific building
  const indoorRooms = places.filter(p => p.buildingId === selectedPlace.id);

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
      startPoint = places.find(p => p.id === "gate-1") || places[0];
    }

    setStartPlace(startPoint);
    setDestinationPlace(selectedPlace);

    const nodes = useStore.getState().nodes;
    const edges = useStore.getState().edges;
    const route = generateRoute(startPoint, selectedPlace, nodes, edges);
    
    if (route) {
      setActiveRoute(route);
    } else {
      // Fallback route line
      setActiveRoute({
        path: [[startPoint.latitude, startPoint.longitude], [selectedPlace.latitude, selectedPlace.longitude]],
        distance: 380,
        duration: 5,
        instructions: [
          { instructionEn: "Depart from starting point", instructionAr: "التحرك من نقطة البداية", distance: 380, coordinate: [startPoint.latitude, startPoint.longitude] }
        ]
      });
    }
    
    setIsNavigating(true);
    setActiveSheet("navigation");
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

  const IconComponent = getIcon(selectedPlace.type);

  return (
    <div className="w-full flex flex-col h-full bg-surface">
      {/* Visual Header Image or solid stylized color block */}
      <div className="relative h-44 w-full bg-gradient-to-tr from-secondary to-primary/80 flex items-center justify-center text-white overflow-hidden flex-shrink-0">
        <div className="absolute inset-0 bg-black/20 z-10" />
        <div className="relative z-20 flex flex-col items-center gap-2 px-6 text-center">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center">
            <IconComponent className="w-6 h-6 text-white" />
          </div>
          <span className="text-xs font-bold tracking-widest uppercase bg-white/20 backdrop-blur-sm px-2.5 py-1 rounded-full">
            {selectedPlace.type.replace("_", " ")}
          </span>
        </div>
        <button 
          onClick={() => setSelectedPlace(null)}
          className="absolute top-4 right-4 z-20 p-2 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full text-white transition-all active:scale-95"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Info Content Area */}
      <div className="flex-1 overflow-y-auto p-5 flex flex-col justify-between">
        <div className="flex flex-col gap-4">
          <div className="text-left">
            <h2 className="text-xl font-black text-on-surface leading-tight mb-2">{name}</h2>
            {desc && <p className="text-sm text-secondary leading-relaxed">{desc}</p>}
          </div>

          {/* Coordinate Meta details */}
          <div className="flex items-center gap-4 text-xs font-semibold text-secondary bg-surface-container/50 p-3.5 rounded-2xl border border-outline-variant/5">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-primary" />
              <span>{selectedPlace.latitude.toFixed(5)}, {selectedPlace.longitude.toFixed(5)}</span>
            </div>
            {selectedPlace.floor !== null && (
              <div className="flex items-center gap-1.5 border-l border-outline-variant/20 pl-4">
                <Layers className="w-4 h-4 text-secondary" />
                <span>{t("floorAbbr")} {selectedPlace.floor}</span>
              </div>
            )}
          </div>

          {/* Room references list inside the building */}
          {selectedPlace.type === "FACULTY_BUILDING" && (
            <div className="flex flex-col gap-2.5">
              <h3 className="font-bold text-sm text-on-surface flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-primary" />
                <span>{t("referencesLabel")}</span>
              </h3>
              {indoorRooms.length === 0 ? (
                <p className="text-xs font-medium text-secondary italic py-2 pl-2">
                  {t("noReferences")}
                </p>
              ) : (
                <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto scrollbar-hide">
                  {indoorRooms.map((room) => {
                    const roomName = language === "en" ? room.nameEn : room.nameAr;
                    return (
                      <div 
                        key={room.id}
                        onClick={() => setSelectedPlace(room)}
                        className="flex items-center justify-between p-2.5 px-3 bg-surface-container hover:bg-surface-container-high rounded-xl cursor-pointer transition-all active:scale-[0.98] border border-outline-variant/5"
                      >
                        <div className="flex items-center gap-2 text-left">
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
          )}
        </div>

        {/* Start Navigation Action button */}
        <div className="pt-6">
          <button
            onClick={handleStartNav}
            className="w-full bg-primary hover:bg-primary-container text-white py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <Navigation className="w-4 h-4 transform rotate-45" />
            <span>{t("startNav")}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
