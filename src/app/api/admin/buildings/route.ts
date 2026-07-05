import { NextResponse } from "next/server";
import prisma from "@/database/db";

// GET: Retrieve all buildings (places that are faculty buildings or don't have a parent buildingId)
export async function GET() {
  try {
    const buildings = await prisma.place.findMany({
      where: {
        OR: [
          { type: "FACULTY_BUILDING" },
          { buildingId: null }
        ]
      },
      include: {
        faculty: true
      }
    });
    return NextResponse.json(buildings);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Create a new building
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, nameEn, nameAr, displayNameAr, aliases, descriptionEn, descriptionAr, type, latitude, longitude } = body;

    if (!id || !nameEn || !nameAr || !type || latitude === undefined || longitude === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const building = await prisma.place.create({
      data: {
        id,
        nameEn,
        nameAr,
        displayNameAr: displayNameAr || null,
        aliases: aliases || null,
        descriptionEn,
        descriptionAr,
        type,
        latitude,
        longitude
      }
    });

    return NextResponse.json(building, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT: Update an existing building
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, nameEn, nameAr, displayNameAr, aliases, descriptionEn, descriptionAr, type, latitude, longitude } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing building ID" }, { status: 400 });
    }

    const updated = await prisma.place.update({
      where: { id },
      data: {
        nameEn,
        nameAr,
        displayNameAr: displayNameAr || null,
        aliases: aliases || null,
        descriptionEn,
        descriptionAr,
        type,
        latitude,
        longitude
      }
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE: Remove a building
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing building ID" }, { status: 400 });
    }

    // First delete any references inside this building to maintain database integrity
    await prisma.place.deleteMany({
      where: { buildingId: id }
    });

    await prisma.place.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
