import { NextResponse } from "next/server";
import prisma from "@/database/db";

// Simple CSV helper to parse raw CSV text into objects based on header keys
function parseCSV(text: string) {
  const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length === 0) return [];

  const headers = lines[0].split(",").map(h => h.trim());
  const results: any[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map(v => v.trim());
    if (values.length < headers.length) continue;

    const obj: any = {};
    headers.forEach((header, index) => {
      // Clean quotes if wrap-enclosed
      let val = values[index];
      if (val.startsWith('"') && val.endsWith('"')) {
        val = val.slice(1, -1);
      }
      obj[header] = val;
    });
    results.push(obj);
  }

  return results;
}

export async function POST(request: Request) {
  try {
    const { csvType, csvText } = await request.json();

    if (!csvType || !csvText) {
      return NextResponse.json({ error: "Missing csvType or csvText parameters" }, { status: 400 });
    }

    const rows = parseCSV(csvText);
    if (rows.length === 0) {
      return NextResponse.json({ error: "No records found in CSV file" }, { status: 400 });
    }

    let importedCount = 0;

    if (csvType === "buildings") {
      for (const row of rows) {
        if (!row.id || !row.nameEn || !row.nameAr) continue;

        await prisma.place.upsert({
          where: { id: row.id },
          update: {
            nameEn: row.nameEn,
            nameAr: row.nameAr,
            displayNameAr: row.displayNameAr || row.nameAr || null,
            aliases: row.aliases || null,
            descriptionEn: row.descriptionEn || null,
            descriptionAr: row.descriptionAr || null,
            type: row.type || "FACULTY_BUILDING",
            latitude: parseFloat(row.latitude) || 30.0275,
            longitude: parseFloat(row.longitude) || 31.2085,
          },
          create: {
            id: row.id,
            nameEn: row.nameEn,
            nameAr: row.nameAr,
            displayNameAr: row.displayNameAr || row.nameAr || null,
            aliases: row.aliases || null,
            descriptionEn: row.descriptionEn || null,
            descriptionAr: row.descriptionAr || null,
            type: row.type || "FACULTY_BUILDING",
            latitude: parseFloat(row.latitude) || 30.0275,
            longitude: parseFloat(row.longitude) || 31.2085,
          }
        });
        importedCount++;
      }
    } else if (csvType === "references") {
      for (const row of rows) {
        if (!row.id || !row.nameEn || !row.nameAr || !row.buildingId) continue;

        await prisma.place.upsert({
          where: { id: row.id },
          update: {
            nameEn: row.nameEn,
            nameAr: row.nameAr,
            displayNameAr: row.displayNameAr || row.nameAr || null,
            aliases: row.aliases || null,
            descriptionEn: row.descriptionEn || null,
            descriptionAr: row.descriptionAr || null,
            type: row.type || "LECTURE_HALL",
            latitude: parseFloat(row.latitude) || 30.0275,
            longitude: parseFloat(row.longitude) || 31.2085,
            floor: row.floor ? parseInt(row.floor) : null,
            roomNumber: row.roomNumber || null,
            buildingId: row.buildingId
          },
          create: {
            id: row.id,
            nameEn: row.nameEn,
            nameAr: row.nameAr,
            displayNameAr: row.displayNameAr || row.nameAr || null,
            aliases: row.aliases || null,
            descriptionEn: row.descriptionEn || null,
            descriptionAr: row.descriptionAr || null,
            type: row.type || "LECTURE_HALL",
            latitude: parseFloat(row.latitude) || 30.0275,
            longitude: parseFloat(row.longitude) || 31.2085,
            floor: row.floor ? parseInt(row.floor) : null,
            roomNumber: row.roomNumber || null,
            buildingId: row.buildingId
          }
        });
        importedCount++;
      }
    } else {
      return NextResponse.json({ error: "Invalid csvType value" }, { status: 400 });
    }

    return NextResponse.json({ success: true, count: importedCount });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
