import { NextResponse } from "next/server";
import prisma from "@/database/db";

// GET: Retrieve all references (places that have a parent buildingId)
export async function GET() {
  try {
    const references = await prisma.place.findMany({
      where: {
        buildingId: { not: null }
      },
      include: {
        building: true
      }
    });
    return NextResponse.json(references);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Create a new reference
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, nameEn, nameAr, displayNameAr, aliases, descriptionEn, descriptionAr, type, latitude, longitude, floor, roomNumber, buildingId } = body;

    if (!id || !nameEn || !nameAr || !type || !buildingId || latitude === undefined || longitude === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const reference = await prisma.place.create({
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
        longitude,
        floor: floor !== null ? parseInt(floor) : null,
        roomNumber,
        buildingId
      }
    });

    return NextResponse.json(reference, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT: Update an existing reference
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, nameEn, nameAr, displayNameAr, aliases, descriptionEn, descriptionAr, type, latitude, longitude, floor, roomNumber, buildingId } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing reference ID" }, { status: 400 });
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
        longitude,
        floor: floor !== null ? parseInt(floor) : null,
        roomNumber,
        buildingId
      }
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE: Remove a reference
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing reference ID" }, { status: 400 });
    }

    await prisma.place.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
