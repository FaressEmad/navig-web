import { create } from "zustand";
import { Place, RouteData, NavigationNode, NavigationEdge } from "../types";

interface AppState {
  // Locale state
  language: "en" | "ar";
  setLanguage: (lang: "en" | "ar") => void;

  // Theme state
  theme: "light" | "dark";
  toggleTheme: () => void;
  setTheme: (theme: "light" | "dark") => void;

  // Search & Filters
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string | null;
  setSelectedCategory: (category: string | null) => void;

  // Map & Place Selection
  selectedPlace: Place | null;
  setSelectedPlace: (place: Place | null) => void;
  mapCenter: [number, number];
  setMapCenter: (center: [number, number]) => void;
  mapZoom: number;
  setMapZoom: (zoom: number) => void;
  userLocation: [number, number] | null;
  setUserLocation: (loc: [number, number] | null) => void;

  // Explicit flyTo counter — map only moves when this increments
  flyToCounter: number;
  flyTo: (center: [number, number], zoom: number) => void;

  // Navigation Wayfinding state
  startPlace: Place | null;
  setStartPlace: (place: Place | null) => void;
  destinationPlace: Place | null;
  setDestinationPlace: (place: Place | null) => void;
  isNavigating: boolean;
  setIsNavigating: (nav: boolean) => void;
  activeRoute: RouteData | null;
  setActiveRoute: (route: RouteData | null) => void;
  currentStepIndex: number;
  setCurrentStepIndex: (idx: number) => void;

  // Routing Graph Network Data (nodes and edges seeded from database)
  nodes: NavigationNode[];
  setNodes: (nodes: NavigationNode[]) => void;
  edges: NavigationEdge[];
  setEdges: (edges: NavigationEdge[]) => void;

  // UI Drawer states
  isSearchFocused: boolean;
  setIsSearchFocused: (focus: boolean) => void;
  activeSheet: "search" | "details" | "navigation" | "directory" | null;
  setActiveSheet: (sheet: "search" | "details" | "navigation" | "directory" | null) => void;

  // Auto-follow state for navigation
  isAutoFollowEnabled: boolean;
  setAutoFollowEnabled: (enabled: boolean) => void;

  // Campus Boundary GeoJSON
  boundaryGeoJSON: any | null;
  setBoundaryGeoJSON: (geojson: any | null) => void;

  // Manual start selection mode
  isSelectingManualStart: boolean;
  setSelectingManualStart: (val: boolean) => void;

  // Current user GPS location state
  currentUserLocation: [number, number] | null;
  setCurrentUserLocation: (location: [number, number] | null) => void;

  // Navigation Heading state (degrees)
  userHeading: number;
  setUserHeading: (heading: number) => void;

  // Map Ready state
  isMapReady: boolean;
  setMapReady: (val: boolean) => void;
}

export const useStore = create<AppState>((set) => ({
  // Locale defaults
  language: "en",
  setLanguage: (language) => set({ language }),

  // Theme defaults
  theme: "light",
  toggleTheme: () => set((state) => {
    const nextTheme = state.theme === "light" ? "dark" : "light";
    if (typeof window !== "undefined") {
      const root = window.document.documentElement;
      root.classList.remove(state.theme);
      root.classList.add(nextTheme);
    }
    return { theme: nextTheme };
  }),
  setTheme: (theme) => set(() => {
    if (typeof window !== "undefined") {
      const root = window.document.documentElement;
      root.classList.remove("light", "dark");
      root.classList.add(theme);
    }
    return { theme };
  }),

  // Search
  searchQuery: "",
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  selectedCategory: null,
  setSelectedCategory: (selectedCategory) => set({ selectedCategory }),

  // Map settings (default centered on Cairo University Clock Tower: [30.0275, 31.2085])
  selectedPlace: null,
  setSelectedPlace: (place) => set((state) => ({ 
    selectedPlace: place,
    // Do NOT auto-set mapCenter/mapZoom here — let the caller use flyTo() explicitly
    activeSheet: place ? "details" : state.activeSheet
  })),
  mapCenter: [30.0275, 31.2085],
  setMapCenter: (mapCenter) => set({ mapCenter }),
  mapZoom: 16,
  setMapZoom: (mapZoom) => set({ mapZoom }),
  userLocation: null,
  setUserLocation: (userLocation) => set({ userLocation }),

  // Explicit flyTo — increments counter so map reacts
  flyToCounter: 0,
  flyTo: (center, zoom) => set((state) => ({
    mapCenter: center,
    mapZoom: zoom,
    flyToCounter: state.flyToCounter + 1
  })),

  // Navigation
  startPlace: null,
  setStartPlace: (startPlace) => set({ startPlace }),
  destinationPlace: null,
  setDestinationPlace: (destinationPlace) => set({ destinationPlace }),
  isNavigating: false,
  setIsNavigating: (isNavigating) => set((state) => ({ 
    isNavigating,
    activeSheet: isNavigating ? "navigation" : state.activeSheet
  })),
  activeRoute: null,
  setActiveRoute: (activeRoute) => set({ activeRoute }),
  currentStepIndex: 0,
  setCurrentStepIndex: (currentStepIndex) => set({ currentStepIndex }),

  // Routing Graph Network Data
  nodes: [],
  setNodes: (nodes) => set({ nodes }),
  edges: [],
  setEdges: (edges) => set({ edges }),

  // UI Shell states
  isSearchFocused: false,
  setIsSearchFocused: (isSearchFocused) => set({ isSearchFocused }),
  activeSheet: "search",
  setActiveSheet: (activeSheet) => set({ activeSheet }),

  // Auto-follow defaults
  isAutoFollowEnabled: true,
  setAutoFollowEnabled: (isAutoFollowEnabled) => set({ isAutoFollowEnabled }),

  // Campus Boundary
  boundaryGeoJSON: null,
  setBoundaryGeoJSON: (boundaryGeoJSON) => set({ boundaryGeoJSON }),

  // Manual start selection mode
  isSelectingManualStart: false,
  setSelectingManualStart: (isSelectingManualStart) => set({ isSelectingManualStart }),

  // Current user GPS location defaults
  currentUserLocation: null,
  setCurrentUserLocation: (currentUserLocation) => set({ currentUserLocation }),

  // User Heading defaults
  userHeading: 0,
  setUserHeading: (userHeading) => set({ userHeading }),

  // Map Ready defaults
  isMapReady: false,
  setMapReady: (isMapReady) => set({ isMapReady }),
}));

export default useStore;
