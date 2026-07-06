import { RouteData, NavInstruction } from "../types";
import { CampusBoundaryService } from "./campusBoundary";
import { useStore } from "../hooks/useStore";

// Helper to calculate distance in meters between two coordinates using Haversine formula
export function getHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) *
      Math.cos(phi2) *
      Math.sin(deltaLambda / 2) *
      Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // in meters
}

function getStepInstructionEn(type: string, modifier: string, name: string): string {
  const street = name ? `onto ${name}` : "along the path";
  const direction = modifier ? modifier.replace("-", " ") : "";
  
  switch (type) {
    case "depart":
      return `Head ${direction} ${street}`;
    case "arrive":
      return "Arrive at your destination";
    case "turn":
      return `Turn ${direction} ${street}`;
    case "new name":
      return `Continue ${street}`;
    case "straight":
      return `Go straight ${street}`;
    case "fork":
      return `Take the fork ${direction} ${street}`;
    case "roundabout":
      return `Enter roundabout and take exit ${direction}`;
    case "merge":
      return `Merge ${direction} ${street}`;
    default:
      return `Continue ${direction} ${street}`;
  }
}

function getStepInstructionAr(type: string, modifier: string, name: string): string {
  const arModifier = getArModifier(modifier);
  const street = name ? `إلى ${name}` : "على طول الممر";
  
  switch (type) {
    case "depart":
      return `ابدأ السير ${arModifier} ${street}`;
    case "arrive":
      return "الوصول إلى وجهتك";
    case "turn":
      return `انعطف ${arModifier} ${street}`;
    case "new name":
      return `تابع السير ${street}`;
    case "straight":
      return `تابع السير مباشرة ${street}`;
    case "fork":
      return `اسلك المفرق ${arModifier} ${street}`;
    case "roundabout":
      return `ادخل الدوار واسلك المخرج ${arModifier}`;
    case "merge":
      return `اندمج ${arModifier} ${street}`;
    default:
      return `تابع السير ${arModifier} ${street}`;
  }
}

function getArModifier(modifier: string): string {
  switch (modifier) {
    case "left":
      return "يساراً";
    case "right":
      return "يميناً";
    case "sharp left":
      return "يساراً بشكل حاد";
    case "sharp right":
      return "يميناً بشكل حاد";
    case "slight left":
      return "قليلاً نحو اليسار";
    case "slight right":
      return "قليلاً نحو اليمين";
    case "straight":
      return "مباشرة";
    case "uturn":
      return "للدوران للخلف";
    default:
      return "";
  }
}

// Generate bilingual walking instructions using the public OSRM foot routing endpoint
export async function generateRoute(
  startPlace: { latitude: number; longitude: number; nameEn?: string; nameAr?: string },
  destinationPlace: { latitude: number; longitude: number; nameEn?: string; nameAr?: string }
): Promise<RouteData | null> {
  const startLat = startPlace.latitude;
  const startLng = startPlace.longitude;
  const destLat = destinationPlace.latitude;
  const destLng = destinationPlace.longitude;

  const url = `https://router.project-osrm.org/route/v1/foot/${startLng},${startLat};${destLng},${destLat}?overview=full&geometries=geojson&steps=true`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("OSRM routing request failed");
    const data = await res.json();

    if (data.code !== "Ok" || !data.routes || data.routes.length === 0) {
      return null;
    }

    const route = data.routes[0];
    // OSRM returns geometry coordinates as [longitude, latitude]
    const path: [number, number][] = route.geometry.coordinates.map((coord: [number, number]) => [
      coord[1],
      coord[0]
    ] as [number, number]);

    // Verify first route coordinate is inside campus boundary
    if (path.length > 0) {
      const [startLatCoord, startLngCoord] = path[0];
      if (!CampusBoundaryService.isInsideCampus(startLatCoord, startLngCoord)) {
        const lang = useStore.getState().language;
        alert(lang === "en"
          ? "The snapped starting point is outside Cairo University.\nPlease choose another starting point."
          : "نقطة البداية المحددة تقع خارج جامعة القاهرة بعد مطابقتها للطريق.\nيرجى اختيار نقطة بداية أخرى.");
        return null;
      }
    }

    // Verify every coordinate in the route remains inside campus boundary
    for (const [lat, lng] of path) {
      if (!CampusBoundaryService.isInsideCampus(lat, lng)) {
        const lang = useStore.getState().language;
        alert(lang === "en"
          ? "Unable to calculate a campus-only walking route."
          : "تعذر حساب مسار مشي داخل الحرم الجامعي فقط.");
        return null;
      }
    }

    const distance = Math.round(route.distance);
    // Average walking duration in minutes
    const duration = Math.max(1, Math.round(route.duration / 60));

    const instructions: NavInstruction[] = [];

    if (route.legs && route.legs[0] && route.legs[0].steps) {
      const steps = route.legs[0].steps;
      for (const step of steps) {
        const type = step.maneuver.type;
        const modifier = step.maneuver.modifier || "";
        const name = step.name || "";
        const stepDist = Math.round(step.distance);
        const location = step.maneuver.location; // [lon, lat]

        const instructionEn = getStepInstructionEn(type, modifier, name);
        const instructionAr = getStepInstructionAr(type, modifier, name);

        instructions.push({
          instructionEn,
          instructionAr,
          distance: stepDist,
          coordinate: [location[1], location[0]] as [number, number]
        });
      }
    }

    if (instructions.length === 0) {
      instructions.push({
        instructionEn: "Depart toward destination",
        instructionAr: "التحرك نحو الوجهة",
        distance: distance,
        coordinate: [startLat, startLng]
      });
    }

    return {
      path,
      distance,
      duration,
      instructions
    };
  } catch (error) {
    console.error("OSRM Routing Error:", error);
    return null;
  }
}
