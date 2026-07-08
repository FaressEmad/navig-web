import React from "react";
import { prisma } from "../database/db";
import LandingPageClient from "./LandingPageClient";

export const dynamic = "force-dynamic";

export default async function LandingPage() {
  // Query counts dynamically from Neon PostgreSQL database
  const totalFaculties = await prisma.faculty.count();
  const totalBuildings = await prisma.place.count({
    where: {
      buildingId: null,
    },
  });
  const totalReferences = await prisma.place.count({
    where: {
      NOT: {
        buildingId: null,
      },
    },
  });

  return (
    <LandingPageClient
      totalFaculties={totalFaculties}
      totalBuildings={totalBuildings}
      totalReferences={totalReferences}
    />
  );
}
