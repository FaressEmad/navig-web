import React from "react";
import prisma from "@/database/db";
import AdminDashboardClient from "./AdminDashboardClient";
import Layout from "@/components/Layout";
import { Faculty, Place, PlaceType, NavigationNode, NavigationEdge } from "@/types";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const dbFaculties = await prisma.faculty.findMany();
  const dbPlaces = await prisma.place.findMany({ include: { faculty: true } });
  const dbNodes = await prisma.navigationNode.findMany();
  const dbEdges = await prisma.navigationEdge.findMany();

  const faculties: Faculty[] = dbFaculties.map((f) => ({
    id: f.id,
    nameEn: f.nameEn,
    nameAr: f.nameAr,
    descriptionEn: f.descriptionEn,
    descriptionAr: f.descriptionAr,
    latitude: f.latitude,
    longitude: f.longitude,
  }));

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

  const nodes: NavigationNode[] = dbNodes.map(n => ({
    id: n.id,
    name: n.name,
    latitude: n.latitude,
    longitude: n.longitude,
    floor: n.floor
  }));

  const edges: NavigationEdge[] = dbEdges.map(e => ({
    id: e.id,
    sourceId: e.sourceId,
    targetId: e.targetId,
    distance: e.distance
  }));

  return (
    <Layout>
      <AdminDashboardClient
        faculties={faculties}
        places={places}
        nodes={nodes}
        edges={edges}
      />
    </Layout>
  );
}
