"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/hooks/useTranslation";
import { Faculty, Place, NavigationNode, NavigationEdge, PlaceType } from "@/types";
import AdminMapSelectorWrapper from "@/components/AdminMapSelectorWrapper";
import { 
  Building, 
  MapPin, 
  Compass, 
  Route, 
  Plus, 
  LogOut,
  FolderOpen,
  Settings,
  Database,
  Trash2,
  Lock,
  ListFilter,
  Search,
  Upload,
  Edit2,
  FileSpreadsheet,
  CheckCircle,
  AlertTriangle,
  HelpCircle
} from "lucide-react";

interface AdminDashboardClientProps {
  faculties: Faculty[];
  places: Place[];
  nodes: NavigationNode[];
  edges: NavigationEdge[];
}

export default function AdminDashboardClient({ 
  faculties, 
  places: initialPlaces, 
  nodes, 
  edges 
}: AdminDashboardClientProps) {
  const router = useRouter();
  const { t, language } = useTranslation();
  const [authorized, setAuthorized] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "buildings" | "references" | "categories" | "settings">("overview");

  // Dynamic state for places list managed during session
  const [places, setPlaces] = useState<Place[]>(initialPlaces);
  
  // Search and filter queries
  const [searchQuery, setSearchQuery] = useState("");

  // CRUD Forms State: Buildings
  const [isEditingBuilding, setIsEditingBuilding] = useState(false);
  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(null);
  const [buildingForm, setBuildingForm] = useState({
    id: "",
    nameEn: "",
    nameAr: "",
    displayNameAr: "",
    aliases: "",
    descriptionEn: "",
    descriptionAr: "",
    type: "FACULTY_BUILDING",
    latitude: 30.0275,
    longitude: 31.2085,
    imageUrl: ""
  });

  // Image Upload Preview State
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // CRUD Forms State: References (indoor rooms/halls)
  const [isEditingRef, setIsEditingRef] = useState(false);
  const [selectedRefId, setSelectedRefId] = useState<string | null>(null);
  const [refForm, setRefForm] = useState({
    id: "",
    nameEn: "",
    nameAr: "",
    displayNameAr: "",
    aliases: "",
    descriptionEn: "",
    descriptionAr: "",
    type: "LECTURE_HALL",
    floor: 0,
    roomNumber: "",
    buildingId: ""
  });

  // CSV Import state
  const [importStatus, setImportStatus] = useState<{ type: "success" | "error" | null, message: string }>({ type: null, message: "" });
  const [importType, setImportType] = useState<"buildings" | "references">("buildings");
  const [csvText, setCsvText] = useState("");

  // Verify session authorization
  useEffect(() => {
    if (typeof window !== "undefined") {
      const session = localStorage.getItem("cu_navigate_admin_session");
      if (!session) {
        router.push("/login");
      } else {
        setAuthorized(true);
      }
    }
  }, [router]);

  // Fetch updated list of places from PostgreSQL endpoints
  const refreshPlaces = async () => {
    try {
      const res = await fetch(`/api/admin/buildings?t=${Date.now()}`, { cache: "no-store" });
      const buildings: Place[] = await res.json();
      const res2 = await fetch(`/api/admin/references?t=${Date.now()}`, { cache: "no-store" });
      const references: Place[] = await res2.json();
      setPlaces([...buildings, ...references]);
    } catch (err) {
      console.error("Refresh failed: ", err);
    }
  };

  // Image upload click handler simulation
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setBuildingForm(prev => ({ ...prev, imageUrl: "/images/faculties/mock-uploaded.jpg" }));
      };
      reader.readAsDataURL(file);
    }
  };

  // CRUD operations: Buildings
  const handleSaveBuilding = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = "/api/admin/buildings";
      const method = selectedBuildingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildingForm)
      });

      if (res.ok) {
        alert(isEditingBuilding ? "Building updated successfully!" : "Building created successfully!");
        setIsEditingBuilding(false);
        setSelectedBuildingId(null);
        setBuildingForm({
          id: "",
          nameEn: "",
          nameAr: "",
          displayNameAr: "",
          aliases: "",
          descriptionEn: "",
          descriptionAr: "",
          type: "FACULTY_BUILDING",
          latitude: 30.0275,
          longitude: 31.2085,
          imageUrl: ""
        });
        setImagePreview(null);
        refreshPlaces();
      } else {
        const data = await res.json();
        alert(`Error: ${data.error}`);
      }
    } catch (err: any) {
      alert(`Request failed: ${err.message}`);
    }
  };

  const handleEditBuildingClick = (b: Place) => {
    setIsEditingBuilding(true);
    setSelectedBuildingId(b.id);
    setBuildingForm({
      id: b.id,
      nameEn: b.nameEn,
      nameAr: b.nameAr,
      displayNameAr: b.displayNameAr || "",
      aliases: b.aliases || "",
      descriptionEn: b.descriptionEn || "",
      descriptionAr: b.descriptionAr || "",
      type: b.type,
      latitude: b.latitude,
      longitude: b.longitude,
      imageUrl: ""
    });
    setImagePreview(null);
  };

  const handleDeleteBuilding = async (id: string) => {
    if (!confirm("Are you sure you want to delete this building? This will remove all references located inside this building.")) return;
    try {
      const res = await fetch(`/api/admin/buildings?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        alert("Building successfully deleted!");
        refreshPlaces();
      } else {
        const data = await res.json();
        alert(`Error: ${data.error}`);
      }
    } catch (err: any) {
      alert(`Deletion failed: ${err.message}`);
    }
  };

  // CRUD operations: References
  const handleSaveRef = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const parentBuilding = places.find(p => p.id === refForm.buildingId);
      if (!parentBuilding) {
        alert("Please select a valid parent building.");
        return;
      }

      // Automatically inherit coordinates from the parent building
      const payload = {
        ...refForm,
        latitude: parentBuilding.latitude,
        longitude: parentBuilding.longitude
      };

      const url = "/api/admin/references";
      const method = selectedRefId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert(isEditingRef ? "Reference updated successfully!" : "Reference created successfully!");
        setIsEditingRef(false);
        setSelectedRefId(null);
        setRefForm({
          id: "",
          nameEn: "",
          nameAr: "",
          displayNameAr: "",
          aliases: "",
          descriptionEn: "",
          descriptionAr: "",
          type: "LECTURE_HALL",
          floor: 0,
          roomNumber: "",
          buildingId: ""
        });
        refreshPlaces();
      } else {
        const data = await res.json();
        alert(`Error: ${data.error}`);
      }
    } catch (err: any) {
      alert(`Request failed: ${err.message}`);
    }
  };

  const handleEditRefClick = (r: Place) => {
    setIsEditingRef(true);
    setSelectedRefId(r.id);
    setRefForm({
      id: r.id,
      nameEn: r.nameEn,
      nameAr: r.nameAr,
      displayNameAr: r.displayNameAr || "",
      aliases: r.aliases || "",
      descriptionEn: r.descriptionEn || "",
      descriptionAr: r.descriptionAr || "",
      type: r.type,
      floor: r.floor || 0,
      roomNumber: r.roomNumber || "",
      buildingId: r.buildingId || ""
    });
  };

  const handleDeleteRef = async (id: string) => {
    if (!confirm("Are you sure you want to delete this reference?")) return;
    try {
      const res = await fetch(`/api/admin/references?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        alert("Reference deleted!");
        refreshPlaces();
      } else {
        const data = await res.json();
        alert(`Error: ${data.error}`);
      }
    } catch (err: any) {
      alert(`Deletion failed: ${err.message}`);
    }
  };

  // CSV Import handling
  const handleCSVImport = async (e: React.FormEvent) => {
    e.preventDefault();
    setImportStatus({ type: null, message: "" });

    if (!csvText.trim()) {
      setImportStatus({ type: "error", message: "Please enter or paste CSV text content." });
      return;
    }

    try {
      const res = await fetch("/api/admin/import-csv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csvType: importType, csvText })
      });

      const data = await res.json();
      if (res.ok) {
        setImportStatus({ type: "success", message: `Successfully imported ${data.count} records!` });
        setCsvText("");
        refreshPlaces();
      } else {
        setImportStatus({ type: "error", message: `Import failed: ${data.error}` });
      }
    } catch (err: any) {
      setImportStatus({ type: "error", message: `Import failed: ${err.message}` });
    }
  };

  // CSV File reader trigger
  const handleCSVFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setCsvText(event.target.result as string);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("cu_navigate_admin_session");
    }
    router.push("/login");
  };

  // Filter buildings list: Places where buildingId is null
  const buildingsList = places.filter(p => p.buildingId === null && 
    (p.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) || 
     p.nameAr.includes(searchQuery) ||
     (p.aliases && p.aliases.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  // Filter references list: Places where buildingId is not null
  const referencesList = places.filter(p => p.buildingId !== null && 
    (p.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) || 
     p.nameAr.includes(searchQuery) ||
     (p.aliases && p.aliases.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  // Categories helper mapping
  const placeCategories = [
    { value: "FACULTY_BUILDING", label: "Faculty Building" },
    { value: "LECTURE_HALL", label: "Lecture Hall" },
    { value: "LABORATORY", label: "Laboratory" },
    { value: "OFFICE", label: "Administrative Office" },
    { value: "SERVICE", label: "Student Service" },
    { value: "GATE", label: "Campus Entrance Gate" },
    { value: "LANDMARK", label: "Campus Landmark" }
  ];

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto py-8 px-margin-mobile md:px-margin-desktop flex flex-col md:grid md:grid-cols-12 gap-8 text-left">
      
      {/* Sidebar Navigation */}
      <div className="md:col-span-3 flex flex-col gap-6">
        <div className="glass-card rounded-2xl p-5 flex items-center gap-3 border border-outline-variant/10">
          <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center font-bold">
            AD
          </div>
          <div>
            <h4 className="font-bold text-sm text-on-surface">Campus Manager</h4>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full font-bold">
              Authorized Administrator
            </span>
          </div>
        </div>

        <div className="flex flex-row md:flex-col bg-surface-container/30 border border-outline-variant/5 rounded-2xl p-2 md:p-2.5 overflow-x-auto md:overflow-visible flex-nowrap md:flex-wrap gap-2 scrollbar-hide">
          <button
            onClick={() => { setActiveTab("overview"); setIsEditingBuilding(false); setIsEditingRef(false); }}
            className={`p-3 rounded-xl text-xs font-bold transition-all flex items-center gap-3 active:scale-95 whitespace-nowrap flex-shrink-0 md:w-full ${
              activeTab === "overview" ? "bg-primary text-white shadow-md" : "text-secondary hover:bg-surface-variant/20 hover:text-primary"
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Overview & CSV Importer</span>
          </button>
          
          <button
            onClick={() => { setActiveTab("buildings"); setIsEditingBuilding(false); setIsEditingRef(false); }}
            className={`p-3 rounded-xl text-xs font-bold transition-all flex items-center gap-3 active:scale-95 whitespace-nowrap flex-shrink-0 md:w-full ${
              activeTab === "buildings" ? "bg-primary text-white shadow-md" : "text-secondary hover:bg-surface-variant/20 hover:text-primary"
            }`}
          >
            <Building className="w-4 h-4" />
            <span>Manage Buildings</span>
          </button>
          
          <button
            onClick={() => { setActiveTab("references"); setIsEditingBuilding(false); setIsEditingRef(false); }}
            className={`p-3 rounded-xl text-xs font-bold transition-all flex items-center gap-3 active:scale-95 whitespace-nowrap flex-shrink-0 md:w-full ${
              activeTab === "references" ? "bg-primary text-white shadow-md" : "text-secondary hover:bg-surface-variant/20 hover:text-primary"
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>References & Rooms</span>
          </button>

          <button
            onClick={() => { setActiveTab("categories"); setIsEditingBuilding(false); setIsEditingRef(false); }}
            className={`p-3 rounded-xl text-xs font-bold transition-all flex items-center gap-3 active:scale-95 whitespace-nowrap flex-shrink-0 md:w-full ${
              activeTab === "categories" ? "bg-primary text-white shadow-md" : "text-secondary hover:bg-surface-variant/20 hover:text-primary"
            }`}
          >
            <FolderOpen className="w-4 h-4" />
            <span>Categories Map</span>
          </button>

          <button
            onClick={() => { setActiveTab("settings"); setIsEditingBuilding(false); setIsEditingRef(false); }}
            className={`p-3 rounded-xl text-xs font-bold transition-all flex items-center gap-3 active:scale-95 whitespace-nowrap flex-shrink-0 md:w-full ${
              activeTab === "settings" ? "bg-primary text-white shadow-md" : "text-secondary hover:bg-surface-variant/20 hover:text-primary"
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Dashboard Settings</span>
          </button>

          <div className="hidden md:block border-t border-outline-variant/10 my-2 pt-2" />

          <button
            onClick={handleLogout}
            className="p-3 rounded-xl text-xs font-bold text-red-500 hover:bg-red-500/10 transition-all flex items-center gap-3 active:scale-95 whitespace-nowrap flex-shrink-0 md:w-full"
          >
            <LogOut className="w-4 h-4" />
            <span>{t("logout")}</span>
          </button>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="md:col-span-9 flex flex-col gap-6">
        
        {/* TAB 1: OVERVIEW & CSV IMPORT */}
        {activeTab === "overview" && (
          <div className="flex flex-col gap-6 animate-fadeIn">
            <div className="border-b border-outline-variant/10 pb-4">
              <h1 className="text-2xl font-black text-on-surface">Campus Administration</h1>
              <p className="text-xs text-secondary mt-1">Manage physical faculties, student rooms, coordinates and wayfinding settings.</p>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-surface-lowest border border-outline-variant/10 rounded-2xl shadow-sm">
                <span className="text-[10px] text-secondary font-bold uppercase tracking-wider block mb-1">Total Buildings</span>
                <span className="text-2xl font-black text-on-surface">{places.filter(p => p.buildingId === null).length}</span>
              </div>
              <div className="p-4 bg-surface-lowest border border-outline-variant/10 rounded-2xl shadow-sm">
                <span className="text-[10px] text-secondary font-bold uppercase tracking-wider block mb-1">Total References</span>
                <span className="text-2xl font-black text-on-surface">{places.filter(p => p.buildingId !== null).length}</span>
              </div>
              <div className="p-4 bg-surface-lowest border border-outline-variant/10 rounded-2xl shadow-sm">
                <span className="text-[10px] text-secondary font-bold uppercase tracking-wider block mb-1">Wayfinding Nodes</span>
                <span className="text-2xl font-black text-on-surface">{nodes.length}</span>
              </div>
              <div className="p-4 bg-surface-lowest border border-outline-variant/10 rounded-2xl shadow-sm">
                <span className="text-[10px] text-secondary font-bold uppercase tracking-wider block mb-1">Routing Edges</span>
                <span className="text-2xl font-black text-on-surface">{edges.length}</span>
              </div>
            </div>

            {/* CSV Import Section */}
            <div className="glass-card rounded-2xl p-6 border border-outline-variant/10 flex flex-col gap-5">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-sm text-on-surface">CSV Importer (Auto Populate Database)</h3>
              </div>

              {importStatus.type && (
                <div className={`p-4 rounded-xl text-xs font-bold flex items-center gap-2 ${
                  importStatus.type === "success" ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-600" : "bg-red-500/10 border border-red-500/20 text-red-600"
                }`}>
                  {importStatus.type === "success" ? <CheckCircle className="w-4 h-4 flex-shrink-0" /> : <AlertTriangle className="w-4 h-4 flex-shrink-0" />}
                  <span>{importStatus.message}</span>
                </div>
              )}

              <form onSubmit={handleCSVImport} className="flex flex-col gap-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-secondary uppercase pl-1">Import Targets</label>
                    <select
                      value={importType}
                      onChange={(e) => setImportType(e.target.value as any)}
                      className="bg-surface-container border border-outline-variant/10 rounded-xl p-2.5 text-xs text-on-surface outline-none"
                    >
                      <option value="buildings">Buildings CSV</option>
                      <option value="references">References CSV</option>
                    </select>
                  </div>
                  
                  <div className="flex flex-col gap-1.5 justify-end">
                    <label className="text-[10px] font-bold text-secondary uppercase pl-1 flex items-center gap-1 cursor-pointer">
                      <Upload className="w-3.5 h-3.5" /> Upload File
                    </label>
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleCSVFileChange}
                      className="w-full bg-surface-container border border-outline-variant/10 rounded-xl p-2 text-xs text-on-surface cursor-pointer"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-secondary uppercase pl-1">CSV Text Data</label>
                  <textarea
                    rows={6}
                    value={csvText}
                    onChange={(e) => setCsvText(e.target.value)}
                    placeholder={
                      importType === "buildings"
                        ? "id,nameEn,nameAr,displayNameAr,aliases,descriptionEn,descriptionAr,type,latitude,longitude\nsci-main,Faculty of Science,كلية العلوم,كلية العلوم,علوم,Chemistry main building,مبنى الكيمياء,FACULTY_BUILDING,30.0288,31.2064"
                        : "id,nameEn,nameAr,displayNameAr,aliases,descriptionEn,descriptionAr,type,latitude,longitude,floor,roomNumber,buildingId\nsci-hall-3,Lecture Hall 3,مدرج 3,مدرج 3,مدرج,Chemistry lecture hall 3,مدرج الكيمياء 3,LECTURE_HALL,30.0289,31.2065,1,103,sci-main"
                    }
                    className="w-full bg-surface-container border border-outline-variant/10 rounded-xl p-3 text-xs text-on-surface outline-none font-mono resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="self-end bg-primary hover:bg-primary-container text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-primary/10 transition-all active:scale-95 cursor-pointer"
                >
                  Process CSV Import
                </button>
              </form>
            </div>

            {/* System Info Callout */}
            <div className="p-4 bg-surface-container/50 border border-outline-variant/10 rounded-2xl text-xs text-secondary leading-relaxed flex gap-3">
              <HelpCircle className="w-5 h-5 text-primary flex-shrink-0" />
              <div>
                <p className="font-bold text-on-surface mb-1">Future Ready Database Architecture</p>
                <p>The system stores `floor` (Future Floor) levels and `roomNumber` (Future Room) references for every indoor space. This allows compiling indoor maps and beacon navigation routing directly on top of the established coordinates layout later.</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: BUILDINGS MANAGEMENT */}
        {activeTab === "buildings" && (
          <div className="flex flex-col gap-6 animate-fadeIn">
            <div className="border-b border-outline-variant/10 pb-4 flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-black text-on-surface">Manage Buildings</h1>
                <p className="text-xs text-secondary mt-1">Add, edit, or delete Cairo University faculties and gates.</p>
              </div>
              {!isEditingBuilding && (
                <button
                  onClick={() => {
                    setIsEditingBuilding(true);
                    setSelectedBuildingId(null);
                    setBuildingForm({
                      id: "",
                      nameEn: "",
                      nameAr: "",
                      displayNameAr: "",
                      aliases: "",
                      descriptionEn: "",
                      descriptionAr: "",
                      type: "FACULTY_BUILDING",
                      latitude: 30.0275,
                      longitude: 31.2085,
                      imageUrl: ""
                    });
                    setImagePreview(null);
                  }}
                  className="bg-primary hover:bg-primary-container text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Building</span>
                </button>
              )}
            </div>

            {/* Building Form */}
            {isEditingBuilding && (
              <form onSubmit={handleSaveBuilding} className="glass-card rounded-2xl p-6 border border-outline-variant/10 flex flex-col gap-5">
                <h3 className="font-bold text-sm text-on-surface flex items-center gap-2">
                  <Edit2 className="w-4 h-4 text-primary" />
                  <span>{selectedBuildingId ? `Edit Building (${selectedBuildingId})` : "Create New Building"}</span>
                </h3>

                <div className="grid sm:grid-cols-2 gap-4">
                  {selectedBuildingId && (
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-secondary uppercase pl-1">Unique ID</label>
                      <input
                        type="text"
                        disabled
                        value={buildingForm.id}
                        className="bg-surface-container border border-outline-variant/10 rounded-xl p-2.5 text-xs text-on-surface outline-none disabled:opacity-50"
                      />
                    </div>
                  )}

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-secondary uppercase pl-1">Building Type</label>
                    <select
                      value={buildingForm.type}
                      onChange={(e) => setBuildingForm({ ...buildingForm, type: e.target.value })}
                      className="bg-surface-container border border-outline-variant/10 rounded-xl p-2.5 text-xs text-on-surface outline-none"
                    >
                      <option value="FACULTY_BUILDING">Faculty Building</option>
                      <option value="GATE">Campus Entrance Gate</option>
                      <option value="LANDMARK">Landmark</option>
                    </select>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-secondary uppercase pl-1">English Official Name</label>
                    <input
                      type="text"
                      required
                      value={buildingForm.nameEn}
                      onChange={(e) => setBuildingForm({ ...buildingForm, nameEn: e.target.value })}
                      className="bg-surface-container border border-outline-variant/10 rounded-xl p-2.5 text-xs text-on-surface outline-none"
                      placeholder="Faculty of Engineering"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-secondary uppercase pl-1">Arabic Official Name</label>
                    <input
                      type="text"
                      required
                      value={buildingForm.nameAr}
                      onChange={(e) => setBuildingForm({ ...buildingForm, nameAr: e.target.value })}
                      className="bg-surface-container border border-outline-variant/10 rounded-xl p-2.5 text-xs text-on-surface outline-none"
                      placeholder="كلية الهندسة"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-secondary uppercase pl-1">Arabic Display Name</label>
                    <input
                      type="text"
                      required
                      value={buildingForm.displayNameAr}
                      onChange={(e) => setBuildingForm({ ...buildingForm, displayNameAr: e.target.value })}
                      className="bg-surface-container border border-outline-variant/10 rounded-xl p-2.5 text-xs text-on-surface outline-none"
                      placeholder="هندسة"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-secondary uppercase pl-1">Aliases (comma separated)</label>
                    <input
                      type="text"
                      value={buildingForm.aliases}
                      onChange={(e) => setBuildingForm({ ...buildingForm, aliases: e.target.value })}
                      className="bg-surface-container border border-outline-variant/10 rounded-xl p-2.5 text-xs text-on-surface outline-none"
                      placeholder="هندسة,كلية الهندسة,Engineering,Faculty of Engineering"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-secondary uppercase pl-1">English Description</label>
                    <textarea
                      rows={2}
                      value={buildingForm.descriptionEn}
                      onChange={(e) => setBuildingForm({ ...buildingForm, descriptionEn: e.target.value })}
                      className="bg-surface-container border border-outline-variant/10 rounded-xl p-2.5 text-xs text-on-surface outline-none resize-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-secondary uppercase pl-1">Arabic Description</label>
                    <textarea
                      rows={2}
                      value={buildingForm.descriptionAr}
                      onChange={(e) => setBuildingForm({ ...buildingForm, descriptionAr: e.target.value })}
                      className="bg-surface-container border border-outline-variant/10 rounded-xl p-2.5 text-xs text-on-surface outline-none resize-none"
                    />
                  </div>
                </div>

                {/* Leaflet Draggable map Selector */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-secondary uppercase pl-1">Coordinates Map Editor (Drag Marker to Locate)</label>
                  <AdminMapSelectorWrapper
                    latitude={buildingForm.latitude}
                    longitude={buildingForm.longitude}
                    onChange={(lat, lng) => setBuildingForm(prev => ({ ...prev, latitude: lat, longitude: lng }))}
                  />
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div className="text-[10px] font-mono text-secondary bg-surface-container p-2 rounded">
                      Latitude: {buildingForm.latitude.toFixed(6)}
                    </div>
                    <div className="text-[10px] font-mono text-secondary bg-surface-container p-2 rounded">
                      Longitude: {buildingForm.longitude.toFixed(6)}
                    </div>
                  </div>
                </div>

                {/* Building Photo Upload */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-secondary uppercase pl-1">Upload Building Image</label>
                  <div className="flex items-center gap-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="bg-surface-container border border-outline-variant/10 rounded-xl p-2 text-xs text-on-surface cursor-pointer"
                    />
                    {imagePreview && (
                      <div className="w-12 h-12 rounded-lg overflow-hidden border border-outline-variant/20 flex-shrink-0">
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => { setIsEditingBuilding(false); setSelectedBuildingId(null); }}
                    className="border border-outline-variant/20 hover:bg-surface-container text-on-surface px-5 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-primary hover:bg-primary-container text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-primary/10 transition-all active:scale-95 cursor-pointer"
                  >
                    Save Building
                  </button>
                </div>
              </form>
            )}

            {/* List and Search Panel */}
            {!isEditingBuilding && (
              <div className="flex flex-col gap-4">
                <div className="relative flex items-center bg-surface-container rounded-2xl p-1 px-3 border border-outline-variant/5 shadow-inner">
                  <Search className="w-4 h-4 text-secondary flex-shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search buildings or aliases..."
                    className="w-full bg-transparent border-0 outline-none focus:ring-0 py-2 px-3 text-xs md:text-sm text-on-surface"
                  />
                </div>

                <div className="bg-surface-lowest border border-outline-variant/10 rounded-2xl overflow-hidden shadow-sm overflow-x-auto">
                  <table className="w-full text-xs text-left text-secondary border-collapse min-w-[700px]">
                    <thead>
                      <tr className="bg-surface-container/30 border-b border-outline-variant/5 text-on-surface font-bold">
                        <th className="p-3.5">ID</th>
                        <th className="p-3.5">Building Name</th>
                        <th className="p-3.5">Aliases</th>
                        <th className="p-3.5">Coordinates</th>
                        <th className="p-3.5 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {buildingsList.map(b => (
                        <tr key={b.id} className="border-b border-outline-variant/5 hover:bg-surface-container/5">
                          <td className="p-3.5 font-mono font-bold text-on-surface">{b.id}</td>
                          <td className="p-3.5">
                            <span className="block font-bold text-on-surface">{b.nameEn}</span>
                            <span className="text-[10px] font-medium text-secondary">{b.nameAr} {b.displayNameAr ? `(${b.displayNameAr})` : ""}</span>
                          </td>
                          <td className="p-3.5 text-secondary max-w-[200px] truncate">{b.aliases || "-"}</td>
                          <td className="p-3.5 font-mono">{b.latitude.toFixed(5)}, {b.longitude.toFixed(5)}</td>
                          <td className="p-3.5">
                            <div className="flex justify-center gap-2">
                              <button
                                onClick={() => handleEditBuildingClick(b)}
                                className="p-1.5 hover:bg-primary/10 text-primary rounded-lg transition-all"
                                title="Edit building details"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteBuilding(b.id)}
                                className="p-1.5 hover:bg-red-500/10 text-red-500 rounded-lg transition-all"
                                title="Delete building"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: REFERENCES & ROOMS MANAGEMENT */}
        {activeTab === "references" && (
          <div className="flex flex-col gap-6 animate-fadeIn">
            <div className="border-b border-outline-variant/10 pb-4 flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-black text-on-surface">Manage References</h1>
                <p className="text-xs text-secondary mt-1">Every building contains unlimited references (lecture halls, labs, administrative offices, etc.).</p>
              </div>
              {!isEditingRef && (
                <button
                  onClick={() => {
                    setIsEditingRef(true);
                    setSelectedRefId(null);
                    setRefForm({
                      id: "",
                      nameEn: "",
                      nameAr: "",
                      displayNameAr: "",
                      aliases: "",
                      descriptionEn: "",
                      descriptionAr: "",
                      type: "LECTURE_HALL",
                      floor: 0,
                      roomNumber: "",
                      buildingId: buildingsList[0]?.id || ""
                    });
                  }}
                  className="bg-primary hover:bg-primary-container text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Reference</span>
                </button>
              )}
            </div>

            {/* Reference Form */}
            {isEditingRef && (
              <form onSubmit={handleSaveRef} className="glass-card rounded-2xl p-6 border border-outline-variant/10 flex flex-col gap-5">
                <h3 className="font-bold text-sm text-on-surface flex items-center gap-2">
                  <Plus className="w-4 h-4 text-primary" />
                  <span>{selectedRefId ? `Edit Reference (${selectedRefId})` : "Create New Reference"}</span>
                </h3>

                <div className="grid sm:grid-cols-2 gap-4">
                  {selectedRefId && (
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-secondary uppercase pl-1">Unique ID</label>
                      <input
                        type="text"
                        disabled
                        value={refForm.id}
                        className="bg-surface-container border border-outline-variant/10 rounded-xl p-2.5 text-xs text-on-surface outline-none disabled:opacity-50"
                      />
                    </div>
                  )}

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-secondary uppercase pl-1">Category Type</label>
                    <select
                      value={refForm.type}
                      onChange={(e) => setRefForm({ ...refForm, type: e.target.value })}
                      className="bg-surface-container border border-outline-variant/10 rounded-xl p-2.5 text-xs text-on-surface outline-none"
                    >
                      <option value="LECTURE_HALL">Lecture Hall</option>
                      <option value="LABORATORY">Laboratory</option>
                      <option value="OFFICE">Office</option>
                      <option value="SERVICE">Service</option>
                    </select>
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-secondary uppercase pl-1">Parent Building</label>
                    <select
                      value={refForm.buildingId}
                      onChange={(e) => setRefForm({ ...refForm, buildingId: e.target.value })}
                      className="bg-surface-container border border-outline-variant/10 rounded-xl p-2.5 text-xs text-on-surface outline-none"
                    >
                      {places.filter(p => p.buildingId === null).map(b => (
                        <option key={b.id} value={b.id}>{b.nameEn} ({b.nameAr})</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-secondary uppercase pl-1">Arabic Display Name</label>
                    <input
                      type="text"
                      required
                      value={refForm.displayNameAr}
                      onChange={(e) => setRefForm({ ...refForm, displayNameAr: e.target.value })}
                      className="bg-surface-container border border-outline-variant/10 rounded-xl p-2.5 text-xs text-on-surface outline-none"
                      placeholder="e.g. مدرج 17"
                    />
                  </div>
                  
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-secondary uppercase pl-1">Aliases (comma separated)</label>
                    <input
                      type="text"
                      value={refForm.aliases}
                      onChange={(e) => setRefForm({ ...refForm, aliases: e.target.value })}
                      className="bg-surface-container border border-outline-variant/10 rounded-xl p-2.5 text-xs text-on-surface outline-none"
                      placeholder="e.g. Hall A, Main Aud, مدرج أ"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-secondary uppercase pl-1">English Official Name</label>
                    <input
                      type="text"
                      required
                      value={refForm.nameEn}
                      onChange={(e) => setRefForm({ ...refForm, nameEn: e.target.value })}
                      className="bg-surface-container border border-outline-variant/10 rounded-xl p-2.5 text-xs text-on-surface outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-secondary uppercase pl-1">Arabic Official Name</label>
                    <input
                      type="text"
                      required
                      value={refForm.nameAr}
                      onChange={(e) => setRefForm({ ...refForm, nameAr: e.target.value })}
                      className="bg-surface-container border border-outline-variant/10 rounded-xl p-2.5 text-xs text-on-surface outline-none"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-secondary uppercase pl-1">Future Floor Level</label>
                    <input
                      type="number"
                      required
                      value={refForm.floor}
                      onChange={(e) => setRefForm({ ...refForm, floor: parseInt(e.target.value) })}
                      className="bg-surface-container border border-outline-variant/10 rounded-xl p-2.5 text-xs text-on-surface outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-secondary uppercase pl-1">Future Room Identifier</label>
                    <input
                      type="text"
                      required
                      value={refForm.roomNumber}
                      onChange={(e) => setRefForm({ ...refForm, roomNumber: e.target.value })}
                      className="bg-surface-container border border-outline-variant/10 rounded-xl p-2.5 text-xs text-on-surface outline-none"
                      placeholder="e.g. 104"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-secondary uppercase pl-1">English Description</label>
                    <textarea
                      rows={2}
                      value={refForm.descriptionEn}
                      onChange={(e) => setRefForm({ ...refForm, descriptionEn: e.target.value })}
                      className="bg-surface-container border border-outline-variant/10 rounded-xl p-2.5 text-xs text-on-surface outline-none resize-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-secondary uppercase pl-1">Arabic Description</label>
                    <textarea
                      rows={2}
                      value={refForm.descriptionAr}
                      onChange={(e) => setRefForm({ ...refForm, descriptionAr: e.target.value })}
                      className="bg-surface-container border border-outline-variant/10 rounded-xl p-2.5 text-xs text-on-surface outline-none resize-none"
                    />
                  </div>
                </div>

                {/* Coordinate Inheritance Callout */}
                <div className="p-4 bg-primary/5 border border-primary/10 rounded-2xl text-xs text-secondary flex gap-2.5 items-center">
                  <MapPin className="w-5 h-5 text-primary flex-shrink-0" />
                  <span>
                    This reference belongs to parent building <strong>{refForm.buildingId}</strong> and will automatically inherit its coordinates.
                  </span>
                </div>

                <div className="flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => { setIsEditingRef(false); setSelectedRefId(null); }}
                    className="border border-outline-variant/20 hover:bg-surface-container text-on-surface px-5 py-2.5 rounded-xl text-xs font-bold transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-primary hover:bg-primary-container text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-primary/10 transition-all cursor-pointer"
                  >
                    Save Reference
                  </button>
                </div>
              </form>
            )}

            {/* Grid references list */}
            {!isEditingRef && (
              <div className="flex flex-col gap-4">
                <div className="relative flex items-center bg-surface-container rounded-2xl p-1 px-3 border border-outline-variant/5 shadow-inner">
                  <Search className="w-4 h-4 text-secondary flex-shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search references or aliases..."
                    className="w-full bg-transparent border-0 outline-none focus:ring-0 py-2 px-3 text-xs md:text-sm text-on-surface"
                  />
                </div>

                <div className="bg-surface-lowest border border-outline-variant/10 rounded-2xl overflow-hidden shadow-sm overflow-x-auto">
                  <table className="w-full text-xs text-left text-secondary border-collapse min-w-[700px]">
                    <thead>
                      <tr className="bg-surface-container/30 border-b border-outline-variant/5 text-on-surface font-bold">
                        <th className="p-3.5">Reference Name</th>
                        <th className="p-3.5">Parent Building</th>
                        <th className="p-3.5">Aliases</th>
                        <th className="p-3.5 text-center">Floor</th>
                        <th className="p-3.5 text-center">Room</th>
                        <th className="p-3.5 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {referencesList.map(ref => (
                        <tr key={ref.id} className="border-b border-outline-variant/5 hover:bg-surface-container/5">
                          <td className="p-3.5">
                            <span className="block font-bold text-on-surface">{ref.nameEn}</span>
                            <span className="text-[10px] font-medium text-secondary">{ref.nameAr} {ref.displayNameAr ? `(${ref.displayNameAr})` : ""}</span>
                          </td>
                          <td className="p-3.5 font-bold text-primary">{ref.buildingId}</td>
                          <td className="p-3.5 text-secondary max-w-[150px] truncate">{ref.aliases || "-"}</td>
                          <td className="p-3.5 text-center font-bold text-on-surface">{ref.floor !== null ? `Floor ${ref.floor}` : "-"}</td>
                          <td className="p-3.5 text-center font-mono">{ref.roomNumber || "-"}</td>
                          <td className="p-3.5">
                            <div className="flex justify-center gap-2">
                              <button
                                onClick={() => handleEditRefClick(ref)}
                                className="p-1.5 hover:bg-primary/10 text-primary rounded-lg"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteRef(ref.id)}
                                className="p-1.5 hover:bg-red-500/10 text-red-500 rounded-lg"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: CATEGORIES OVERVIEW */}
        {activeTab === "categories" && (
          <div className="flex flex-col gap-6 animate-fadeIn">
            <div className="border-b border-outline-variant/10 pb-4">
              <h1 className="text-2xl font-black text-on-surface">Categories Map</h1>
              <p className="text-xs text-secondary mt-1">Review campus classifications indexes.</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {placeCategories.map((cat) => {
                const count = places.filter(p => p.type === cat.value).length;
                return (
                  <div key={cat.value} className="p-5 bg-surface-lowest border border-outline-variant/10 rounded-2xl shadow-sm flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                      <span className="font-bold text-sm text-on-surface">{cat.label}</span>
                      <span className="text-[10px] text-secondary font-mono uppercase">{cat.value}</span>
                    </div>
                    <span className="bg-primary/10 text-primary px-3 py-1.5 rounded-xl font-black text-xs">
                      {count} items
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 5: DASHBOARD SETTINGS */}
        {activeTab === "settings" && (
          <div className="flex flex-col gap-6 animate-fadeIn">
            <div className="border-b border-outline-variant/10 pb-4">
              <h1 className="text-2xl font-black text-on-surface">System Settings</h1>
              <p className="text-xs text-secondary mt-1">Configure administrator permissions, theme colors, and cleanups.</p>
            </div>

            <div className="glass-card rounded-2xl p-6 border border-outline-variant/10 flex flex-col gap-5 text-left">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-sm text-on-surface">General Settings</h3>
              </div>

              <div className="flex justify-between items-center py-2.5 border-b border-outline-variant/5">
                <div>
                  <h4 className="font-bold text-xs text-on-surface">Academic Kinetic Mode</h4>
                  <p className="text-[10px] text-secondary mt-0.5">Toggle electric pink design highlighting</p>
                </div>
                <div className="w-9 h-5 bg-primary rounded-full relative p-0.5 cursor-pointer">
                  <div className="w-4 h-4 bg-white rounded-full shadow-md ml-auto" />
                </div>
              </div>

              <div className="flex justify-between items-center py-2.5 border-b border-outline-variant/5">
                <div>
                  <h4 className="font-bold text-xs text-on-surface">Bilingual English/Arabic Routing</h4>
                  <p className="text-[10px] text-secondary mt-0.5">Allows pathfinder algorithms to generate instructions in Arabic/English RTL</p>
                </div>
                <div className="w-9 h-5 bg-primary rounded-full relative p-0.5 cursor-pointer">
                  <div className="w-4 h-4 bg-white rounded-full shadow-md ml-auto" />
                </div>
              </div>

              <div className="flex justify-between items-center py-2.5">
                <div>
                  <h4 className="font-bold text-xs text-on-surface">Neon PostgreSQL Database Health</h4>
                  <p className="text-[10px] text-secondary mt-0.5">Synchronized via Prisma ORM client</p>
                </div>
                <span className="text-[10px] font-black bg-emerald-500/10 text-emerald-500 px-2.5 py-1 rounded-full">
                  Healthy & Connected
                </span>
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
