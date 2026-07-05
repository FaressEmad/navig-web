"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useTranslation } from "../../hooks/useTranslation";
import { Place } from "../../types";
import { 
  Search, 
  MapPin, 
  School, 
  BookOpen, 
  Activity, 
  Building, 
  Milestone,
  ArrowUpRight,
  Compass
} from "lucide-react";

interface DirectoryClientProps {
  places: Place[];
}

export default function DirectoryClient({ places }: DirectoryClientProps) {
  const { t, language } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const isRtl = language === "ar";

  // Categories definition
  const categories = [
    { id: "FACULTY_BUILDING", label: t("catFaculty"), icon: School, count: places.filter(p => p.type === "FACULTY_BUILDING").length },
    { id: "LECTURE_HALL", label: t("catHalls"), icon: BookOpen, count: places.filter(p => p.type === "LECTURE_HALL").length },
    { id: "GATE", label: t("catGates"), icon: Milestone, count: places.filter(p => p.type === "GATE").length },
    { id: "SERVICE", label: t("catServices"), icon: Activity, count: places.filter(p => p.type === "SERVICE").length },
    { id: "OFFICE", label: t("catOffices"), icon: Building, count: places.filter(p => p.type === "OFFICE").length },
  ];

  // Filtering places in the directory based on search query, category, and fuzzy aliases matching
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
                          
    const matchesCategory = !activeCategory || place.type === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex-1 w-full max-w-6xl mx-auto py-10 px-margin-mobile md:px-margin-desktop flex flex-col gap-8">
      {/* Title */}
      <div className="text-center md:text-left border-b border-outline-variant/10 pb-6 flex flex-col gap-2">
        <h1 className="text-3xl font-black text-on-surface tracking-tight">{t("directoryTitle")}</h1>
        <p className="text-sm md:text-base text-secondary">{t("directorySubtitle")}</p>
      </div>

      {/* Directory Search & Filters */}
      <div className="grid md:grid-cols-12 gap-6 items-center">
        {/* Search */}
        <div className="md:col-span-5 relative flex items-center bg-surface-container rounded-2xl p-1 px-3.5 shadow-inner border border-outline-variant/5">
          <Search className="w-5 h-5 text-secondary flex-shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("searchDirectory")}
            className="w-full bg-transparent border-0 outline-none focus:ring-0 py-2.5 px-3 text-sm text-on-surface"
          />
        </div>

        {/* Categories scroll (horizontal on mobile, flex wrap on desktop) */}
        <div className="md:col-span-7 overflow-x-auto scrollbar-hide flex gap-2 select-none py-1">
          <button
            onClick={() => setActiveCategory(null)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap active:scale-95 border border-transparent ${
              activeCategory === null
                ? "bg-primary text-white shadow-md shadow-primary/15"
                : "bg-surface-container text-secondary hover:text-primary hover:border-outline-variant/20"
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>{t("allCategories")} ({places.length})</span>
          </button>

          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(isSelected ? null : cat.id)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap active:scale-95 border border-transparent ${
                  isSelected
                    ? "bg-primary text-white shadow-md shadow-primary/15"
                    : "bg-surface-container text-secondary hover:text-primary hover:border-outline-variant/20"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label} ({cat.count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Directory Grid */}
      {filteredPlaces.length === 0 ? (
        <div className="text-center py-16 text-secondary border border-dashed border-outline-variant/20 rounded-3xl">
          <MapPin className="w-10 h-10 mx-auto mb-3 text-outline-variant opacity-60" />
          <p className="text-base font-semibold">{t("searchResultEmpty")}</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
          {filteredPlaces.map((place) => {
            const name = language === "en" ? place.nameEn : place.nameAr;
            const desc = language === "en" ? place.descriptionEn : place.descriptionAr;
            const categoryObj = categories.find(c => c.id === place.type);
            const CategoryIcon = categoryObj ? categoryObj.icon : MapPin;

            return (
              <Link
                key={place.id}
                href={`/destination/${place.id}`}
                className="group w-full flex flex-col justify-between p-5 bg-surface-lowest hover:bg-surface-container/30 border border-outline-variant/10 rounded-2xl hover:border-primary/20 transition-all duration-300 shadow-sm cursor-pointer hover:shadow-md active:scale-[0.98]"
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2.5 bg-secondary-container/10 text-secondary rounded-xl group-hover:bg-primary/10 group-hover:text-primary transition-all">
                      <CategoryIcon className="w-5 h-5" />
                    </div>
                    <span className="p-1 rounded-full text-secondary opacity-0 group-hover:opacity-100 transition-opacity">
                      <ArrowUpRight className="w-4 h-4" />
                    </span>
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-sm text-on-surface mb-2 truncate group-hover:text-primary transition-colors">
                      {name}
                    </h3>
                    <p className="text-xs text-secondary leading-relaxed line-clamp-2">
                      {desc || "No description available."}
                    </p>
                  </div>
                </div>
                {place.floor !== null && (
                  <div className="mt-4 pt-3 border-t border-outline-variant/5 flex justify-between items-center text-[10px] font-bold text-secondary">
                    <span>{t("floorAbbr")} {place.floor}</span>
                    {place.roomNumber && <span>Room {place.roomNumber}</span>}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
