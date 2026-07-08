import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import prisma from "@/database/db";
import crypto from "crypto";

export const dynamic = "force-dynamic";

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
    const { nameEn, nameAr, displayNameAr, aliases, descriptionEn, descriptionAr, type, latitude, longitude, floor, roomNumber, buildingId } = body;

    if (!nameEn || !nameAr || !type || !buildingId || latitude === undefined || longitude === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const id = crypto.randomUUID();

    const parsedFloor = (floor !== undefined && floor !== null && floor !== "") ? parseInt(floor) : null;
    const safeFloor = (parsedFloor !== null && isNaN(parsedFloor)) ? null : parsedFloor;

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
        floor: safeFloor,
        roomNumber,
        buildingId
      }
    });

    revalidatePath("/");
    revalidatePath("/search");
    revalidatePath("/navigation");
    revalidatePath("/directory");

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

    console.log(`[API References PUT] Received ID to update: "${id}"`);

    if (!id) {
      return NextResponse.json({ error: "Missing reference ID" }, { status: 400 });
    }

    // Check if the reference exists
    const existing = await prisma.place.findUnique({
      where: { id }
    });

    if (!existing) {
      console.log(`[API References PUT] Reference not found in database for ID: "${id}"`);
      return NextResponse.json({ error: `Reference with ID "${id}" not found.` }, { status: 404 });
    }

    const parsedFloor = (floor !== undefined && floor !== null && floor !== "") ? parseInt(floor) : null;
    const safeFloor = (parsedFloor !== null && isNaN(parsedFloor)) ? null : parsedFloor;

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
        floor: safeFloor,
        roomNumber,
        buildingId
      }
    });

    revalidatePath("/");
    revalidatePath("/search");
    revalidatePath("/navigation");
    revalidatePath("/directory");

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("[API References PUT] Error updating reference:", error);
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

    // Check if the reference exists
    const existing = await prisma.place.findUnique({
      where: { id }
    });

    if (!existing) {
      console.log(`[API References DELETE] Reference with ID "${id}" not found. No-op.`);
      return NextResponse.json({ error: `Reference with ID "${id}" not found.` }, { status: 404 });
    }

    await prisma.place.delete({
      where: { id }
    });

    revalidatePath("/");
    revalidatePath("/search");
    revalidatePath("/navigation");
    revalidatePath("/directory");

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("[API References DELETE] Error deleting reference:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
