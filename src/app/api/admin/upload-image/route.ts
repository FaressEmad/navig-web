import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import path from "path";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const validTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif", "image/svg+xml"];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type. Please upload an image file (PNG, JPG, WebP, GIF, SVG)." }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large. Maximum size is 10MB." }, { status: 400 });
    }

    const ext = path.extname(file.name) || ".png";
    const baseName = path.basename(file.name, ext).replace(/[^a-zA-Z0-9_-]/g, "_");
    const fileName = `floors/floor_${Date.now()}_${baseName}${ext}`;

    // Upload directly to Vercel Blob storage (for live Vercel deployments)
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      console.log(`[Upload API] Vercel Blob token detected. Uploading "${fileName}" to cloud storage...`);
      const blob = await put(fileName, file, {
        access: "public",
      });
      return NextResponse.json({ url: blob.url }, { status: 200 });
    } else {
      // Local development fallback: write to public folder if token is not configured locally
      const { writeFile, mkdir } = await import("fs/promises");
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const uploadDir = path.join(process.cwd(), "public", "images", "floors");
      await mkdir(uploadDir, { recursive: true });

      const localFileName = `floor_${Date.now()}_${baseName}${ext}`;
      const filePath = path.join(uploadDir, localFileName);
      await writeFile(filePath, buffer);

      const publicUrl = `/images/floors/${localFileName}`;
      console.log(`[Upload API] Saved locally (No Vercel token): ${publicUrl}`);
      return NextResponse.json({ url: publicUrl }, { status: 200 });
    }
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: `Failed to upload file: ${error.message}` }, { status: 500 });
  }
}
