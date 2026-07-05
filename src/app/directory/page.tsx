import React from "react";
import prisma from "@/database/db";
import DirectoryClient from "./DirectoryClient";
import Layout from "@/components/Layout";
import { Place, PlaceType } from "@/types";

export const dynamic = "force-dynamic";

export default async function DirectoryPage() {
  const dbPlaces = await prisma.place.findMany({
    include: {
      faculty: true,
    },
  });

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

  return (
    <Layout>
      <DirectoryClient places={places} />
    </Layout>
  );
}
