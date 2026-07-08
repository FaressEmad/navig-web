"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "../hooks/useStore";
import { useTranslation } from "../hooks/useTranslation";
import { CampusBoundaryService } from "../services/campusBoundary";
import { 
  Compass, 
  Search, 
  Map, 
  Info, 
  Mail, 
  User, 
  Sun, 
  Moon, 
  Globe 
} from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const pathname = usePathname();
  const { language, setLanguage, theme, toggleTheme, setTheme } = useStore();
  const { t } = useTranslation();

  const setBoundaryGeoJSON = useStore((state) => state.setBoundaryGeoJSON);

  // Initialize theme from store on mount
  useEffect(() => {
    setTheme(theme);
  }, [theme, setTheme]);

  // Load Cairo University boundaries GeoJSON on startup using CampusBoundaryService
  useEffect(() => {
    CampusBoundaryService.loadBoundary()
      .then((data) => {
        setBoundaryGeoJSON(data);
      })
      .catch((err) => {
        console.error("Error loading boundary GeoJSON:", err);
      });
  }, [setBoundaryGeoJSON]);

  const isRtl = language === "ar";
  const dir = isRtl ? "rtl" : "ltr";

  // Desktop Navigation items
  const navItems = [
    { name: t("directory"), href: "/directory", icon: Compass },
    { name: t("about"), href: "/about", icon: Info },
    { name: t("contact"), href: "/contact", icon: Mail },
  ];

  return (
    <div 
      className={`min-h-screen flex flex-col font-sans bg-background text-on-background transition-colors duration-300`}
      dir={dir}
      lang={language}
    >
      {/* Top Header Navigation (Desktop focused, clean on mobile) */}
      <header className="sticky top-0 z-40 w-full glass-card border-b border-outline-variant/10 shadow-sm flex items-center justify-between px-margin-mobile md:px-margin-desktop py-4">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 select-none hover:opacity-90 transition-opacity">
          <div className="w-10 h-10 rounded-lg bg-white p-1 flex items-center justify-center shadow-sm flex-shrink-0 border border-outline-variant/10">
            <img 
              src="/images/cairo_university_logo.png" 
              alt="Cairo University Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <span className="text-xl md:text-2xl font-black tracking-tight text-primary font-sans">
            {t("appName")}
          </span>
        </Link>

        {/* Desktop Menu */}
        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-semibold transition-all py-1 border-b-2 hover:text-primary ${
                  isActive 
                    ? "text-primary border-primary font-bold" 
                    : "text-secondary border-transparent"
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Language Selector */}
          <button
            onClick={() => setLanguage(language === "en" ? "ar" : "en")}
            className="p-2.5 rounded-full hover:bg-surface-variant/20 transition-all active:scale-95 flex items-center justify-center text-secondary hover:text-primary"
            aria-label="Toggle language"
          >
            <Globe className="w-5 h-5" />
            <span className="text-xs font-bold mx-1 uppercase">
              {language === "en" ? "AR" : "EN"}
            </span>
          </button>

          {/* Theme Selector */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-full hover:bg-surface-variant/20 transition-all active:scale-95 flex items-center justify-center text-secondary hover:text-primary"
            aria-label="Toggle theme"
          >
            {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>

          {/* Admin Login Button */}
          <Link
            href="/login"
            className="p-2.5 rounded-full hover:bg-surface-variant/20 transition-all active:scale-95 flex items-center justify-center text-secondary hover:text-primary"
            title={t("login")}
          >
            <User className="w-5 h-5" />
          </Link>

          {/* Explore Map Call-To-Action (Desktop only) */}
          <Link
            href="/search"
            className="hidden md:inline-flex bg-primary hover:bg-primary-container text-white px-5 py-2 rounded-full text-sm font-bold shadow-md shadow-primary/10 transition-all active:scale-95"
          >
            {t("exploreBtn")}
          </Link>
        </div>
      </header>

      {/* Main Dynamic View with Slide Transition */}
      <main className="flex-1 flex flex-col relative w-full overflow-x-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="flex-1 flex flex-col w-full"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile Floating Bottom Bar (App-like feel, only active on mobile devices) */}
      <div className="md:hidden fixed bottom-6 left-4 right-4 z-40 bg-surface-lowest/90 backdrop-blur-xl border border-outline-variant/10 rounded-2xl shadow-xl py-3 px-6 flex items-center justify-around">
        <Link href="/" className={`flex flex-col items-center gap-1 text-xs font-semibold ${pathname === "/" ? "text-primary" : "text-secondary"}`}>
          <Compass className="w-5 h-5" />
          <span>Home</span>
        </Link>
        <Link href="/search" className={`flex flex-col items-center gap-1 text-xs font-semibold ${pathname === "/search" ? "text-primary" : "text-secondary"}`}>
          <Map className="w-5 h-5" />
          <span>Map</span>
        </Link>
        <Link href="/directory" className={`flex flex-col items-center gap-1 text-xs font-semibold ${pathname === "/directory" ? "text-primary" : "text-secondary"}`}>
          <Search className="w-5 h-5" />
          <span>Browse</span>
        </Link>
        <Link href="/about" className={`flex flex-col items-center gap-1 text-xs font-semibold ${pathname === "/about" ? "text-primary" : "text-secondary"}`}>
          <Info className="w-5 h-5" />
          <span>Info</span>
        </Link>
      </div>

      {/* Desktop/Tablet Bottom Safe Area Padding for mobile floating nav */}
      <div className="md:hidden h-24" />
    </div>
  );
}
