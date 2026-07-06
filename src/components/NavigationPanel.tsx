"use client";

import React from "react";
import { useStore } from "../hooks/useStore";
import { useTranslation } from "../hooks/useTranslation";
import { 
  ArrowLeft, 
  MapPin, 
  UserRound, 
  Compass, 
  CheckCircle2, 
  Route, 
  Navigation,
  ChevronRight,
  Footprints
} from "lucide-react";

export default function NavigationPanel() {
  const { t, language } = useTranslation();
  const { 
    startPlace, 
    destinationPlace, 
    activeRoute, 
    isNavigating,
    setIsNavigating,
    currentStepIndex,
    setCurrentStepIndex,
    setActiveSheet,
    setSelectedPlace,
    setAutoFollowEnabled
  } = useStore();

  if (!isNavigating || !activeRoute || !destinationPlace) return null;

  const steps = activeRoute.instructions;
  const activeStep = steps[currentStepIndex];

  const handleNextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleEndNavigation = () => {
    setIsNavigating(false);
    setActiveSheet("search");
    setSelectedPlace(null);
    setAutoFollowEnabled(true);
  };

  const isRtl = language === "ar";
  const startName = startPlace 
    ? (language === "en" ? startPlace.nameEn : startPlace.nameAr)
    : t("currentLocLabel");
  const destName = language === "en" ? destinationPlace.nameEn : destinationPlace.nameAr;

  return (
    <div className="w-full flex flex-col h-full bg-surface">
      {/* Top Wayfinding Progress Header */}
      <div className="p-4 border-b border-outline-variant/10 flex items-center justify-between bg-primary/5">
        <div className="flex items-center gap-3">
          <button 
            onClick={handleEndNavigation}
            className="p-2 rounded-full hover:bg-surface-variant/40 transition-all text-secondary"
          >
            <ArrowLeft className={`w-5 h-5 ${isRtl ? "rotate-180" : ""}`} />
          </button>
          <div className="text-left">
            <span className="text-[10px] font-bold tracking-wider text-primary uppercase">{t("navigatingTo")}</span>
            <h4 className="font-bold text-sm text-on-surface truncate max-w-[200px] md:max-w-xs">{destName}</h4>
          </div>
        </div>
        <div className="bg-primary text-white rounded-full p-2.5 shadow-md shadow-primary/10">
          <Navigation className="w-4 h-4 transform rotate-45" />
        </div>
      </div>

      {/* ETA and Distance Summary panel */}
      <div className="p-4 grid grid-cols-2 gap-3 border-b border-outline-variant/5">
        <div className="p-3 bg-surface-container rounded-2xl flex flex-col items-center justify-center">
          <Footprints className="w-5 h-5 text-primary mb-1" />
          <span className="text-[10px] text-secondary font-semibold">{t("remainingDist")}</span>
          <span className="text-sm font-black text-on-surface">
            {activeRoute.distance} {t("meters")}
          </span>
        </div>
        <div className="p-3 bg-surface-container rounded-2xl flex flex-col items-center justify-center">
          <Route className="w-5 h-5 text-secondary mb-1" />
          <span className="text-[10px] text-secondary font-semibold">{t("eta")}</span>
          <span className="text-sm font-black text-on-surface">
            {activeRoute.duration} {t("min")}
          </span>
        </div>
      </div>

      {/* Turn-by-Turn Instruction Slider (PWA/Apple maps experience) */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col justify-between">
        {/* Active step display */}
        <div className="my-auto py-6 flex flex-col items-center text-center px-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-6 animate-bounce">
            <Compass className="w-8 h-8" />
          </div>
          <span className="text-xs font-bold text-primary mb-2 uppercase tracking-wide">
            {t("step")} {currentStepIndex + 1} / {steps.length}
          </span>
          <h2 className="text-lg font-black text-on-surface max-w-sm leading-snug">
            {language === "en" ? activeStep.instructionEn : activeStep.instructionAr}
          </h2>
          <p className="text-sm text-secondary font-bold mt-2">
            {activeStep.distance} {t("meters")}
          </p>
        </div>

        {/* Action Controls for steps */}
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handlePrevStep}
              disabled={currentStepIndex === 0}
              className="py-3 px-4 rounded-xl text-xs font-bold bg-surface-container text-secondary disabled:opacity-40 hover:bg-surface-container-high transition-all active:scale-95 border border-outline-variant/10"
            >
              {isRtl ? "الخطوة السابقة" : "Previous Step"}
            </button>
            <button
              onClick={handleNextStep}
              disabled={currentStepIndex === steps.length - 1}
              className="py-3 px-4 rounded-xl text-xs font-bold bg-primary text-white disabled:opacity-40 hover:bg-primary-container transition-all active:scale-95 shadow-md shadow-primary/10"
            >
              {isRtl ? "الخطوة التالية" : "Next Step"}
            </button>
          </div>

          {/* Arrived! Close route Button */}
          {currentStepIndex === steps.length - 1 ? (
            <button
              onClick={handleEndNavigation}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>{t("finishNav")}</span>
            </button>
          ) : (
            <button
              onClick={handleEndNavigation}
              className="w-full border-2 border-outline-variant/20 hover:bg-surface-container text-on-surface py-3 rounded-xl font-bold text-sm transition-all active:scale-95"
            >
              {t("finishNav")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
