import { NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/database/db";

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();
    console.log(`[Login API] Incoming request for username: "${username}"`);

    if (!username || !password) {
      console.log("[Login API] Error: Missing username or password");
      return NextResponse.json({ error: "Missing username or password" }, { status: 400 });
    }

    // Try finding by exact match
    let admin = await prisma.admin.findUnique({
      where: { username },
    });

    // If not found, try case-insensitive query for robust lookups
    if (!admin) {
      console.log(`[Login API] User "${username}" not found by findUnique. Trying case-insensitive findFirst...`);
      admin = await prisma.admin.findFirst({
        where: {
          username: {
            equals: username,
            mode: "insensitive"
          }
        }
      });
    }

    console.log("[Login API] Query completed. User found:", admin ? "YES" : "NO");
    if (admin) {
      console.log(`[Login API] Database record: username="${admin.username}", passwordHash="${admin.passwordHash}"`);
    }

    if (!admin) {
      console.log(`[Login API] Failure reason: User "${username}" not found in database`);
      return NextResponse.json({ error: "Invalid admin credentials" }, { status: 401 });
    }

    const passwordHash = crypto.createHash("sha256").update(password).digest("hex");
    console.log(`[Login API] Computed hash for input: "${passwordHash}"`);

    const isMatch = admin.passwordHash === passwordHash;
    console.log(`[Login API] Password match result: ${isMatch}`);

    if (!isMatch) {
      console.log("[Login API] Failure reason: Password hash mismatch");
      return NextResponse.json({ error: "Invalid admin credentials" }, { status: 401 });
    }

    console.log(`[Login API] Login success for user: "${admin.username}"`);
    return NextResponse.json({ success: true, username: admin.username });
  } catch (error: any) {
    console.error("[Login API] Exception during login flow:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
