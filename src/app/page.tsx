"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Layout from "../components/Layout";
import { useTranslation } from "../hooks/useTranslation";
import { 
  Navigation, 
  Map, 
  Search, 
  Compass, 
  Layers, 
  Smartphone, 
  ShieldCheck, 
  Zap, 
  ChevronDown,
  Globe,
  Star,
  Sparkles,
  MapPin,
  Clock,
  GraduationCap
} from "lucide-react";

export default function LandingPage() {
  const { t, language } = useTranslation();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const isRtl = language === "ar";

  // Mock FAQ Items matching the translation keys
  const faqItems = [
    { q: t("faq1Q"), a: t("faq1A") },
    { q: t("faq2Q"), a: t("faq2A") },
    { q: t("faq3Q"), a: t("faq3A") },
  ];

  // Features mapping
  const features = [
    { title: t("feature1Title"), desc: t("feature1Desc"), icon: Zap, color: "text-amber-500 bg-amber-500/10" },
    { title: t("feature2Title"), desc: t("feature2Desc"), icon: Globe, color: "text-blue-500 bg-blue-500/10" },
    { title: t("feature3Title"), desc: t("feature3Desc"), icon: Smartphone, color: "text-pink-500 bg-pink-500/10" },
    { title: t("feature4Title"), desc: t("feature4Desc"), icon: ShieldCheck, color: "text-emerald-500 bg-emerald-500/10" },
  ];

  // How It Works Steps
  const steps = [
    { number: "01", title: t("howItWorksStep1Title"), desc: t("howItWorksStep1Desc"), icon: Search },
    { number: "02", title: t("howItWorksStep2Title"), desc: t("howItWorksStep2Desc"), icon: Navigation },
    { number: "03", title: t("howItWorksStep3Title"), desc: t("howItWorksStep3Desc"), icon: Compass },
  ];

  return (
    <Layout>
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-28 px-margin-mobile md:px-margin-desktop bg-gradient-to-b from-primary/5 via-transparent to-transparent">
        {/* Ambient Blur Background Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 w-[70%] h-[50%] bg-primary/5 blur-[120px] rounded-full" />
        
        <div className="max-w-6xl mx-auto grid md:grid-cols-12 gap-12 items-center">
          {/* Hero Left Content */}
          <div className="md:col-span-7 text-center md:text-left flex flex-col items-center md:items-start">
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-wider mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Cairo University Official Wayfinding</span>
            </span>
            
            <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight text-on-surface mb-6 max-w-2xl font-sans">
              {t("heroTitle")}{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-container">
                {t("heroTitleHighlight")}
              </span>{" "}
              {t("heroTitleEnd")}
            </h1>
            
            <p className="text-base md:text-lg text-secondary leading-relaxed mb-10 max-w-xl">
              {t("heroSubtitle")}
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Link
                href="/search"
                className="bg-primary hover:bg-primary-container text-white px-8 py-4 rounded-full font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 flex items-center justify-center gap-2 transition-all active:scale-95 text-base"
              >
                <Navigation className="w-4 h-4 transform rotate-45" />
                <span>{t("startNav")}</span>
              </Link>
              <Link
                href="/directory"
                className="border-2 border-outline-variant/35 hover:bg-surface-container text-on-surface px-8 py-4 rounded-full font-bold transition-all flex items-center justify-center gap-2 active:scale-95 text-base"
              >
                <Compass className="w-4 h-4" />
                <span>{t("directory")}</span>
              </Link>
            </div>
            
            {/* Social Proof */}
            <div className="mt-12 flex items-center gap-3">
              <div className="flex -space-x-2">
                <div className="w-9 h-9 rounded-full border-2 border-white bg-slate-200" />
                <div className="w-9 h-9 rounded-full border-2 border-white bg-slate-300" />
                <div className="w-9 h-9 rounded-full border-2 border-white bg-slate-400" />
              </div>
              <p className="text-xs font-semibold text-secondary">
                {t("studentsActive")}
              </p>
            </div>
          </div>

          {/* Hero Right Visual Phone mockup */}
          <div className="md:col-span-5 flex justify-center relative">
            <div className="absolute inset-0 bg-primary/10 blur-[100px] -z-10 rounded-full" />
            <motion.div 
              initial={{ rotate: 4, y: 20 }}
              animate={{ rotate: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative w-full max-w-[320px] aspect-[9/19] bg-slate-950 p-2.5 rounded-[2.5rem] border-[6px] border-slate-900 shadow-2xl overflow-hidden flex flex-col select-none"
            >
              {/* Phone screen mockup */}
              <div className="w-full h-full bg-slate-50 dark:bg-slate-900 rounded-[2rem] overflow-hidden flex flex-col relative transition-colors duration-300">
                {/* Visual Map rendering background */}
                <div 
                  className="absolute inset-0 bg-slate-100/50 dark:bg-slate-900/50 bg-cover bg-center transition-all duration-300 dark:invert-[0.85] dark:hue-rotate-180 dark:brightness-[0.7]" 
                  style={{ backgroundImage: "url('/images/campus_navigation_bg.png')" }} 
                />
                
                {/* Content Overlay */}
                <div className="absolute inset-0 flex flex-col justify-between p-4 z-10">
                  {/* Top search overlay */}
                  <div className="w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-3.5 rounded-2xl shadow-lg border border-slate-150 dark:border-slate-800/80 flex flex-col gap-2 mt-4 transition-colors">
                    <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/70 p-2 rounded-lg transition-colors">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="text-[10px] font-bold text-slate-700 dark:text-slate-350">Main Gate (Gate 1)</span>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/70 p-2 rounded-lg transition-colors">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <span className="text-[10px] font-bold text-slate-900 dark:text-slate-100">Shora Lecture Hall</span>
                    </div>
                  </div>

                  {/* Center pin icon with graduation cap */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="relative flex flex-col items-center justify-center -mt-6">
                      {/* Pulsing ring animation */}
                      <div className="absolute w-12 h-12 bg-primary/20 rounded-full animate-ping opacity-75" />
                      
                      {/* Map Pin base shadow */}
                      <div className="absolute bottom-[-6px] w-8 h-2.5 bg-black/15 dark:bg-black/35 rounded-full blur-[1px]" />
                      
                      {/* The Pin container */}
                      <div className="relative z-10 w-16 h-16 drop-shadow-xl flex items-center justify-center animate-bounce duration-1000">
                        {/* Custom Map Pin SVG in theme colors */}
                        <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow-[0_4px_6px_rgba(186,0,52,0.25)]">
                          {/* Map Pin Outline and Fill */}
                          <path 
                            d="M50,90 C45,80 15,62 15,38 A35,35 0 0,1 85,38 C85,62 55,80 50,90 Z" 
                            fill="url(#pinGrad)" 
                            stroke="#ba0034" 
                            strokeWidth="3" 
                            strokeLinejoin="round" 
                          />
                          {/* Inner circle wrapper */}
                          <circle cx="50" cy="38" r="21" className="fill-white dark:fill-slate-900 transition-colors duration-300" stroke="#ba0034" strokeWidth="2.5" />
                          
                          {/* SVG Gradients definitions */}
                          <defs>
                            <linearGradient id="pinGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                              <stop offset="0%" stopColor="#e51245" />
                              <stop offset="100%" stopColor="#ba0034" />
                            </linearGradient>
                          </defs>
                        </svg>
                        
                        {/* Lucide GraduationCap React Component placed inside the circle */}
                        <div className="absolute top-[38%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[34%] h-[34%] text-primary flex items-center justify-center">
                          <GraduationCap className="w-full h-full stroke-[2.2]" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Navigation steps prompt */}
                  <div className="w-full bg-white dark:bg-slate-900 p-3.5 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between mb-2 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <Compass className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                        <h4 className="text-[11px] font-black text-slate-900 dark:text-slate-100">Turn Right in 50m</h4>
                        <p className="text-[9px] text-slate-500 dark:text-slate-400">Toward Engineering Bldg 3</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-black bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-1 rounded transition-colors">2 min</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. Statistics Section */}
      <section className="py-16 bg-surface-container/30 px-margin-mobile md:px-margin-desktop border-y border-outline-variant/5">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-center text-xs font-black tracking-widest text-primary uppercase mb-12">
            {t("statsTitle")}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            <div className="text-center">
              <span className="block text-4xl md:text-5xl font-black text-primary mb-2">100%</span>
              <p className="text-xs md:text-sm font-semibold text-secondary max-w-[160px] mx-auto">{t("stats1Lbl")}</p>
            </div>
            <div className="text-center">
              <span className="block text-4xl md:text-5xl font-black text-primary mb-2">20+</span>
              <p className="text-xs md:text-sm font-semibold text-secondary max-w-[160px] mx-auto">{t("stats2Lbl")}</p>
            </div>
            <div className="text-center">
              <span className="block text-4xl md:text-5xl font-black text-primary mb-2">1,500+</span>
              <p className="text-xs md:text-sm font-semibold text-secondary max-w-[160px] mx-auto">{t("stats3Lbl")}</p>
            </div>
            <div className="text-center">
              <span className="block text-4xl md:text-5xl font-black text-primary mb-2">0s</span>
              <p className="text-xs md:text-sm font-semibold text-secondary max-w-[160px] mx-auto">{t("stats4Lbl")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. How It Works Section */}
      <section className="py-24 px-margin-mobile md:px-margin-desktop">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-black text-on-surface mb-4">{t("howItWorksTitle")}</h2>
          <div className="w-12 h-1.5 bg-primary rounded-full mx-auto mb-16" />
          
          <div className="grid md:grid-cols-3 gap-8 md:gap-12 relative">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div key={idx} className="relative flex flex-col items-center p-6 bg-surface hover:bg-surface-container/30 border border-outline-variant/10 rounded-2xl transition-all duration-300">
                  <div className="absolute top-4 right-4 text-3xl font-black text-primary/10 select-none">{step.number}</div>
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-6">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-base text-on-surface mb-3">{step.title}</h3>
                  <p className="text-xs md:text-sm text-secondary leading-relaxed max-w-[240px]">{step.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. Features Section */}
      <section className="py-24 bg-surface-container/20 px-margin-mobile md:px-margin-desktop border-y border-outline-variant/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black text-on-surface mb-4">{t("featuresTitle")}</h2>
            <div className="w-12 h-1.5 bg-primary rounded-full mx-auto" />
          </div>
          
          <div className="grid sm:grid-cols-2 gap-6 md:gap-8">
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div key={idx} className="flex gap-4 p-6 bg-surface rounded-2xl border border-outline-variant/10 hover:border-primary/20 transition-all duration-300">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${feat.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-sm text-on-surface mb-2">{feat.title}</h3>
                    <p className="text-xs text-secondary leading-relaxed">{feat.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. Testimonials Section */}
      <section className="py-24 px-margin-mobile md:px-margin-desktop">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-black text-on-surface mb-4">{t("testimonialsTitle")}</h2>
          <div className="w-12 h-1.5 bg-primary rounded-full mx-auto mb-16" />
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-6 md:p-8 bg-surface-container/50 border border-outline-variant/10 rounded-2xl text-left flex flex-col justify-between">
              <div>
                <div className="flex gap-1 mb-4 text-amber-500">
                  <Star className="w-4 h-4 fill-amber-500" /><Star className="w-4 h-4 fill-amber-500" /><Star className="w-4 h-4 fill-amber-500" /><Star className="w-4 h-4 fill-amber-500" /><Star className="w-4 h-4 fill-amber-500" />
                </div>
                <p className="text-sm italic text-secondary leading-relaxed mb-6">
                  &quot;{t("testimonial1Text")}&quot;
                </p>
              </div>
              <h4 className="font-bold text-xs text-on-surface">{t("testimonial1Author")}</h4>
            </div>
            
            <div className="p-6 md:p-8 bg-surface-container/50 border border-outline-variant/10 rounded-2xl text-left flex flex-col justify-between">
              <div>
                <div className="flex gap-1 mb-4 text-amber-500">
                  <Star className="w-4 h-4 fill-amber-500" /><Star className="w-4 h-4 fill-amber-500" /><Star className="w-4 h-4 fill-amber-500" /><Star className="w-4 h-4 fill-amber-500" /><Star className="w-4 h-4 fill-amber-500" />
                </div>
                <p className="text-sm italic text-secondary leading-relaxed mb-6">
                  &quot;{t("testimonial2Text")}&quot;
                </p>
              </div>
              <h4 className="font-bold text-xs text-on-surface">{t("testimonial2Author")}</h4>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FAQ Section */}
      <section className="py-24 bg-surface-container/10 px-margin-mobile md:px-margin-desktop border-t border-outline-variant/5">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black text-on-surface mb-4">{t("faqTitle")}</h2>
            <div className="w-12 h-1.5 bg-primary rounded-full mx-auto" />
          </div>
          
          <div className="flex flex-col gap-4">
            {faqItems.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div 
                  key={idx} 
                  className="bg-surface rounded-2xl border border-outline-variant/10 overflow-hidden transition-all duration-300"
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full p-5 flex items-center justify-between text-left font-bold text-sm md:text-base text-on-surface focus:outline-none"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-5 h-5 text-secondary transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
                  </button>
                  {isOpen && (
                    <div className="p-5 pt-0 border-t border-outline-variant/5 text-xs md:text-sm text-secondary leading-relaxed">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 7. Footer */}
      <footer className="py-12 bg-surface px-margin-mobile md:px-margin-desktop border-t border-outline-variant/10 text-center text-xs text-secondary font-semibold">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <span className="text-primary font-black text-sm">{t("appName")}</span>
          <div className="flex gap-6">
            <Link href="/about" className="hover:text-primary transition-colors">{t("about")}</Link>
            <Link href="/contact" className="hover:text-primary transition-colors">{t("contact")}</Link>
            <Link href="/login" className="hover:text-primary transition-colors">{t("login")}</Link>
          </div>
          <span>&copy; {new Date().getFullYear()} Cairo University. All rights reserved.</span>
        </div>
      </footer>
    </Layout>
  );
}
