import React from "react";
import prisma from "@/database/db";
import { notFound } from "next/navigation";
import Layout from "@/components/Layout";
import { Place, PlaceType } from "@/types";
import DestinationClient from "./DestinationClient";

interface DestinationPageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

export default async function DestinationPage({ params }: DestinationPageProps) {
  const { id } = await params;

  const placeData = await prisma.place.findUnique({
    where: { id },
    include: {
      faculty: true,
    },
  });

  if (!placeData) {
    return notFound();
  }

  const dbIndoorPlaces = await prisma.place.findMany({
    where: { buildingId: id },
  });

  const dbAllPlaces = await prisma.place.findMany({
    include: { faculty: true },
  });

  const place: Place = {
    id: placeData.id,
    nameEn: placeData.nameEn,
    nameAr: placeData.nameAr,
    descriptionEn: placeData.descriptionEn,
    descriptionAr: placeData.descriptionAr,
    type: placeData.type as PlaceType,
    latitude: placeData.latitude,
    longitude: placeData.longitude,
    floor: placeData.floor,
    roomNumber: placeData.roomNumber,
    facultyId: placeData.facultyId,
    buildingId: placeData.buildingId,
    faculty: placeData.faculty ? {
      id: placeData.faculty.id,
      nameEn: placeData.faculty.nameEn,
      nameAr: placeData.faculty.nameAr,
      descriptionEn: placeData.faculty.descriptionEn,
      descriptionAr: placeData.faculty.descriptionAr,
      latitude: placeData.faculty.latitude,
      longitude: placeData.faculty.longitude,
    } : null,
    indoorPlaces: dbIndoorPlaces.map(r => ({
      id: r.id,
      nameEn: r.nameEn,
      nameAr: r.nameAr,
      descriptionEn: r.descriptionEn,
      descriptionAr: r.descriptionAr,
      type: r.type as PlaceType,
      latitude: r.latitude,
      longitude: r.longitude,
      floor: r.floor,
      roomNumber: r.roomNumber,
      facultyId: r.facultyId,
      buildingId: r.buildingId,
    })),
  };

  const allPlaces: Place[] = dbAllPlaces.map((p) => ({
    id: p.id,
    nameEn: p.nameEn,
    nameAr: p.nameAr,
    descriptionEn: p.descriptionEn,
    descriptionAr: p.descriptionAr,
    type: p.type as any,
    latitude: p.latitude,
    longitude: p.longitude,
    floor: p.floor,
    roomNumber: p.roomNumber,
    facultyId: p.facultyId,
    buildingId: p.buildingId,
  }));

  return (
    <Layout>
      <DestinationClient place={place} allPlaces={allPlaces} />
    </Layout>
  );
}
