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

        {/* Project Developer Card */}
        <div className="p-6 md:p-8 bg-surface-lowest border border-outline-variant/10 rounded-3xl text-left flex flex-col md:flex-row gap-8 items-start">
          <div className="flex-1 flex flex-col gap-4">
            <h2 className="text-xl font-black text-on-surface flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              <span>Developer Profile</span>
            </h2>
            <p className="text-sm text-secondary leading-relaxed font-sans">
              CU Navigate is an independent software project developed by Fares Emad, a Computer Science student specializing in Data Science.
            </p>
            <p className="text-sm text-secondary leading-relaxed font-sans">
              The project combines web technologies, digital mapping, and geospatial navigation to improve the campus experience by providing accurate outdoor navigation, searchable campus locations, and an easy-to-manage administrative system.
            </p>
          </div>

          {/* Contact Card */}
          <div className="w-full md:w-80 bg-surface-container/30 border border-outline-variant/10 rounded-2xl p-5 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-black text-lg">
                FE
              </div>
              <div>
                <h3 className="font-bold text-sm text-on-surface">Fares Emad</h3>
                <span className="text-[10px] text-secondary font-semibold block">Computer Science & Data Science</span>
              </div>
            </div>
            
            <div className="flex flex-col gap-2.5 mt-2">
              <a 
                href="https://github.com/FaressEmad" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-950 text-white py-2.5 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
                </svg>
                <span>GitHub Profile</span>
              </a>
              <a 
                href="https://www.linkedin.com/in/faresemad4106/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-[#0077b5] hover:bg-[#00669c] text-white py-2.5 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                <span>LinkedIn Connect</span>
              </a>
            </div>
          </div>
        </div>

      </div>
    </Layout>
  );
}
