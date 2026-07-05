"use client";

import React from "react";
import Layout from "../../components/Layout";
import { useTranslation } from "../../hooks/useTranslation";
import { Info, HelpCircle, MapPin, Compass, Users } from "lucide-react";

export default function AboutPage() {
  const { t } = useTranslation();

  return (
    <Layout>
      <div className="flex-1 w-full max-w-4xl mx-auto py-12 px-margin-mobile md:px-margin-desktop flex flex-col gap-10">
        
        {/* Title */}
        <div className="text-center md:text-left border-b border-outline-variant/10 pb-6">
          <h1 className="text-3xl font-black text-on-surface tracking-tight">{t("about")}</h1>
          <p className="text-sm md:text-base text-secondary mt-2">Learn more about the CU Navigate wayfinding project.</p>
        </div>

        {/* Project Description Content Card */}
        <div className="grid md:grid-cols-12 gap-8 items-start">
          <div className="md:col-span-8 flex flex-col gap-6 text-left">
            <h2 className="text-xl font-black text-on-surface flex items-center gap-2">
              <Compass className="w-5 h-5 text-primary" />
              <span>Smart Campus Navigation</span>
            </h2>
            <p className="text-sm text-secondary leading-relaxed">
              Cairo University is a large city-scale campus spanning over hundreds of feddans. With thousands of students walking between historical lecture halls, faculties, student affairs offices, and service centers daily, navigation can be extremely challenging, especially for freshmen and visitors.
            </p>
            <p className="text-sm text-secondary leading-relaxed">
              <strong>CU Navigate</strong> is an Apple Maps-inspired mobile-first Progressive Web App (PWA) designed to solve this exact problem. By indexing all faculties, gates, administrative buildings, classrooms, and libraries, the app provides students with high-precision indoor and outdoor walking paths.
            </p>
            <p className="text-sm text-secondary leading-relaxed">
              The project is campus-specific, focused exclusively on Cairo University main campus inside Giza. There is no global search or extraneous external data, ensuring that the interface remains hyper-focused and highly optimized.
            </p>
          </div>

          {/* Quick Info Sidebar */}
          <div className="md:col-span-4 bg-surface-container/40 border border-outline-variant/10 rounded-2xl p-5 flex flex-col gap-4 text-left">
            <h3 className="font-bold text-sm text-on-surface flex items-center gap-2">
              <Info className="w-4 h-4 text-primary" />
              <span>Quick Facts</span>
            </h3>
            
            <div className="flex flex-col gap-3 text-xs font-semibold text-secondary">
              <div className="flex justify-between py-1.5 border-b border-outline-variant/5">
                <span>Version</span>
                <span className="text-on-surface">1.0.0 (PWA)</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-outline-variant/5">
                <span>Coverage</span>
                <span className="text-on-surface">CU Giza Campus</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-outline-variant/5">
                <span>Language</span>
                <span className="text-on-surface">Bilingual (EN / AR)</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span>Login</span>
                <span className="text-on-surface">Admins Only</span>
              </div>
            </div>
          </div>
        </div>

        {/* Project Team Card */}
        <div className="p-6 md:p-8 bg-surface-lowest border border-outline-variant/10 rounded-3xl text-left flex flex-col gap-4">
          <h2 className="text-xl font-black text-on-surface flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            <span>Developer Team</span>
          </h2>
          <p className="text-sm text-secondary leading-relaxed">
            CU Navigate was developed by a team of Cairo University software engineers, designers, and mapping experts. Our goal is to make campus navigation frictionless, helping students focus on their academic studies rather than finding classrooms.
          </p>
        </div>

      </div>
    </Layout>
  );
}
