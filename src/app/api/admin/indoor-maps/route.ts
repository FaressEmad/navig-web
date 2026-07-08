import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import prisma from "@/database/db";

export const dynamic = "force-dynamic";

// GET: Retrieve all indoor maps (optionally filtered by buildingId)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const buildingId = searchParams.get("buildingId");

    const query: any = {};
    if (buildingId) {
      query.buildingId = buildingId;
    }

    const indoorMaps = await prisma.indoorMap.findMany({
      where: query,
      orderBy: {
        floor: "asc"
      }
    });

    return NextResponse.json(indoorMaps);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Upload/Create a new floor indoor map
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { buildingId, floor, imageUrl } = body;

    if (!buildingId || floor === undefined || !imageUrl) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const floorNum = parseInt(floor);
    if (isNaN(floorNum)) {
      return NextResponse.json({ error: "Floor must be a valid integer" }, { status: 400 });
    }

    // Check if the floor plan already exists for this building
    const existing = await prisma.indoorMap.findUnique({
      where: {
        buildingId_floor: {
          buildingId,
          floor: floorNum
        }
      }
    });

    if (existing) {
      return NextResponse.json({ error: `An indoor map for floor ${floorNum} already exists for this building.` }, { status: 400 });
    }

    const map = await prisma.indoorMap.create({
      data: {
        buildingId,
        floor: floorNum,
        imageUrl
      }
    });

    // Invalidate caches
    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/search");
    revalidatePath("/navigation");
    revalidatePath("/directory");

    return NextResponse.json(map, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT: Update an existing floor indoor map
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, buildingId, floor, imageUrl } = body;

    if (!id || !buildingId || floor === undefined || !imageUrl) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const floorNum = parseInt(floor);
    if (isNaN(floorNum)) {
      return NextResponse.json({ error: "Floor must be a valid integer" }, { status: 400 });
    }

    // Check if map exists
    const existing = await prisma.indoorMap.findUnique({
      where: { id }
    });

    if (!existing) {
      return NextResponse.json({ error: `Indoor map with ID "${id}" not found.` }, { status: 404 });
    }

    // Verify uniqueness for other maps
    const conflicts = await prisma.indoorMap.findFirst({
      where: {
        buildingId,
        floor: floorNum,
        id: { not: id }
      }
    });

    if (conflicts) {
      return NextResponse.json({ error: `An indoor map for floor ${floorNum} already exists for this building.` }, { status: 400 });
    }

    const updated = await prisma.indoorMap.update({
      where: { id },
      data: {
        buildingId,
        floor: floorNum,
        imageUrl
      }
    });

    // Invalidate caches
    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/search");
    revalidatePath("/navigation");
    revalidatePath("/directory");

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE: Remove a floor plan map
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing indoor map ID" }, { status: 400 });
    }

    // Check if exists
    const existing = await prisma.indoorMap.findUnique({
      where: { id }
    });

    if (!existing) {
      return NextResponse.json({ error: `Indoor map with ID "${id}" not found.` }, { status: 404 });
    }

    await prisma.indoorMap.delete({
      where: { id }
    });

    // Invalidate caches
    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/search");
    revalidatePath("/navigation");
    revalidatePath("/directory");

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
