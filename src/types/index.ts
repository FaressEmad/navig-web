export type PlaceType = 
  | "FACULTY_BUILDING" 
  | "LECTURE_HALL" 
  | "OFFICE" 
  | "LABORATORY" 
  | "SERVICE" 
  | "GATE" 
  | "LANDMARK";

export interface Faculty {
  id: string;
  nameEn: string;
  nameAr: string;
  descriptionEn: string | null;
  descriptionAr: string | null;
  latitude: number;
  longitude: number;
}

export interface Place {
  id: string;
  nameEn: string;
  nameAr: string;
  displayNameAr?: string | null;
  aliases?: string | null;
  descriptionEn: string | null;
  descriptionAr: string | null;
  type: PlaceType;
  latitude: number;
  longitude: number;
  floor: number | null;
  roomNumber: string | null;
  facultyId: string | null;
  buildingId: string | null;
  faculty?: Faculty | null;
  parentBuilding?: Place | null;
  indoorPlaces?: Place[];
}

export interface NavigationNode {
  id: string;
  name: string | null;
  latitude: number;
  longitude: number;
  floor: number | null;
}

export interface NavigationEdge {
  id: string;
  sourceId: string;
  targetId: string;
  distance: number;
}

export interface NavInstruction {
  instructionEn: string;
  instructionAr: string;
  distance: number; // in meters
  coordinate: [number, number];
}

export interface RouteData {
  path: [number, number][];
  distance: number; // total meters
  duration: number; // walking time in minutes
  instructions: NavInstruction[];
}
