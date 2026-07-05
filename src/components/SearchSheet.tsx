"use client";

import React, { useRef } from "react";
import { useStore } from "../hooks/useStore";
import { useTranslation } from "../hooks/useTranslation";
import { Place } from "../types";
import { generateRoute } from "../services/routing";
import { 
  Search, 
  MapPin, 
  BookOpen, 
  Compass, 
  X, 
  Navigation,
  School,
  Building,
  Activity,
  Milestone
} from "lucide-react";

interface SearchSheetProps {
  places: Place[];
}

export default function SearchSheet({ places }: SearchSheetProps) {
  const { t, language } = useTranslation();
  const { 
    searchQuery, 
    setSearchQuery, 
    selectedCategory, 
    setSelectedCategory,
    setSelectedPlace,
    setIsSearchFocused,
    isSearchFocused,
    setStartPlace,
    setDestinationPlace,
    setIsNavigating,
    setActiveRoute,
    userLocation
  } = useStore();

  const inputRef = useRef<HTMLInputElement>(null);
  const isRtl = language === "ar";

  // Category tags definitions
  const categories = [
    { id: "FACULTY_BUILDING", label: t("catFaculty"), icon: School },
    { id: "LECTURE_HALL", label: t("catHalls"), icon: BookOpen },
    { id: "GATE", label: t("catGates"), icon: Milestone },
    { id: "SERVICE", label: t("catServices"), icon: Activity },
    { id: "OFFICE", label: t("catOffices"), icon: Building },
  ];

  // Filtering places list based on search query, category, and fuzzy aliases matching
  const filteredPlaces = places.filter((place) => {
    const name = language === "en" ? place.nameEn : place.nameAr;
    const desc = (language === "en" ? place.descriptionEn : place.descriptionAr) || "";
    const displayNameAr = place.displayNameAr || "";
    
    // Fuzzy search through aliases array
    const aliases = place.aliases ? place.aliases.toLowerCase().split(",") : [];
    const matchesAliases = aliases.some(alias => alias.trim().includes(searchQuery.toLowerCase()));

    const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          displayNameAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          matchesAliases;
    
    const matchesCategory = !selectedCategory || place.type === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleSelectPlace = (place: Place) => {
    setSelectedPlace(place);
    setIsSearchFocused(false);
  };

  const handleQuickNav = (place: Place, e: React.MouseEvent) => {
    e.stopPropagation();
    
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
        distance: 300,
        duration: 4,
        instructions: [
          { instructionEn: "Depart toward destination", instructionAr: "التحرك نحو الوجهة", distance: 300, coordinate: [startPoint.latitude, startPoint.longitude] }
        ]
      });
    }
    
    setIsNavigating(true);
  };

  const clearSearch = () => {
    setSearchQuery("");
    if (inputRef.current) inputRef.current.focus();
  };

  return (
    <div className="w-full flex flex-col h-full">
      {/* Search Header Container */}
      <div className="p-4 border-b border-outline-variant/10">
        <div className="relative flex items-center bg-surface-container rounded-2xl p-1 px-3 shadow-inner">
          <Search className="w-5 h-5 text-secondary flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            placeholder={t("searchPlaceholder")}
            className="w-full bg-transparent border-0 outline-none focus:ring-0 py-2.5 px-3 text-sm text-on-surface"
          />
          {searchQuery && (
            <button onClick={clearSearch} className="p-1.5 rounded-full hover:bg-surface-variant/40 transition-all text-secondary">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Category Pills (Horizontal scrolling slider) */}
      <div className="p-3 px-4 overflow-x-auto scrollbar-hide flex gap-2 select-none border-b border-outline-variant/5">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-4 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap active:scale-95 ${
            selectedCategory === null
              ? "bg-primary text-white shadow-md shadow-primary/20"
              : "bg-surface-container text-secondary hover:text-primary"
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>{t("allCategories")}</span>
        </button>

        {categories.map((cat) => {
          const Icon = cat.icon;
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(isSelected ? null : cat.id)}
              className={`px-4 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap active:scale-95 ${
                isSelected
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : "bg-surface-container text-secondary hover:text-primary"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Search Autocomplete List */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
        {filteredPlaces.length === 0 ? (
          <div className="text-center py-8 text-secondary">
            <MapPin className="w-8 h-8 mx-auto mb-2 text-outline-variant opacity-60" />
            <p className="text-sm font-semibold">{t("searchResultEmpty")}</p>
          </div>
        ) : (
          filteredPlaces.map((place) => {
            const name = language === "en" ? place.nameEn : place.nameAr;
            const desc = language === "en" ? place.descriptionEn : place.descriptionAr;
            return (
              <div
                key={place.id}
                onClick={() => handleSelectPlace(place)}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl hover:bg-surface-variant/20 transition-all cursor-pointer border border-transparent hover:border-outline-variant/10 active:scale-[0.98]"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-secondary-container/10 flex items-center justify-center text-secondary-container flex-shrink-0">
                    <MapPin className="w-5 h-5 text-secondary" />
                  </div>
                  <div className="text-left min-w-0">
                    <h4 className="font-bold text-sm text-on-surface truncate">{name}</h4>
                    <p className="text-xs text-secondary truncate max-w-[200px] md:max-w-xs">{desc || place.type.replace("_", " ")}</p>
                  </div>
                </div>
                <button
                  onClick={(e) => handleQuickNav(place, e)}
                  className="p-3 bg-primary/10 hover:bg-primary text-primary hover:text-white rounded-full transition-all active:scale-90"
                  title={t("startNav")}
                >
                  <Navigation className="w-4 h-4 transform rotate-45" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
