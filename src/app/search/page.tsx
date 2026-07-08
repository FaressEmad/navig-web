import React from "react";
import prisma from "@/database/db";
import SearchPageClient from "./SearchPageClient";
import { Place, NavigationNode, NavigationEdge, PlaceType } from "@/types";

export const dynamic = "force-dynamic";

export default async function SearchPage() {
  // Fetch campus places, faculties, nodes, and edges
  const dbPlaces = await prisma.place.findMany({
    include: {
      faculty: true,
    },
  });

  const dbNodes = await prisma.navigationNode.findMany();
  const dbEdges = await prisma.navigationEdge.findMany();

  const places: Place[] = dbPlaces.map((p) => ({
    id: p.id,
    nameEn: p.nameEn,
    nameAr: p.nameAr,
    descriptionEn: p.descriptionEn,
    descriptionAr: p.descriptionAr,
    type: p.type as PlaceType,
    latitude: p.latitude,
    longitude: p.longitude,
    floor: p.floor,
    roomNumber: p.roomNumber,
    facultyId: p.facultyId,
    buildingId: p.buildingId,
    indoorX: p.indoorX,
    indoorY: p.indoorY,
    faculty: p.faculty ? {
      id: p.faculty.id,
      nameEn: p.faculty.nameEn,
      nameAr: p.faculty.nameAr,
      descriptionEn: p.faculty.descriptionEn,
      descriptionAr: p.faculty.descriptionAr,
      latitude: p.faculty.latitude,
      longitude: p.faculty.longitude,
    } : null,
  }));

  const nodes: NavigationNode[] = dbNodes.map((n) => ({
    id: n.id,
    name: n.name,
    latitude: n.latitude,
    longitude: n.longitude,
    floor: n.floor,
  }));

  const edges: NavigationEdge[] = dbEdges.map((e) => ({
    id: e.id,
    sourceId: e.sourceId,
    targetId: e.targetId,
    distance: e.distance,
  }));

  return <SearchPageClient places={places} nodes={nodes} edges={edges} />;
}
