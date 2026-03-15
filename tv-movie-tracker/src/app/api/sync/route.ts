import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

function getRedis() {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) {
    return null;
  }
  return new Redis({ url, token });
}

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no I/1/O/0 to avoid confusion
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// GET /api/sync?code=ABC123 — load lists by sync code
export async function GET(req: NextRequest) {
  const redis = getRedis();
  if (!redis) {
    return NextResponse.json(
      { error: "Sync is not configured. See setup instructions." },
      { status: 503 }
    );
  }

  const code = req.nextUrl.searchParams.get("code")?.toUpperCase();
  if (!code || code.length !== 6) {
    return NextResponse.json({ error: "Invalid sync code" }, { status: 400 });
  }

  const data = await redis.get(`sync:${code}`);
  if (!data) {
    return NextResponse.json({ error: "Sync code not found or expired" }, { status: 404 });
  }

  return NextResponse.json(data);
}

// POST /api/sync — create or update sync data
export async function POST(req: NextRequest) {
  const redis = getRedis();
  if (!redis) {
    return NextResponse.json(
      { error: "Sync is not configured. See setup instructions." },
      { status: 503 }
    );
  }

  const body = await req.json();
  const { action, code, lists } = body;

  if (action === "create") {
    // Generate a new sync code and store the lists
    const newCode = generateCode();
    // Make sure code is unique
    const existing = await redis.get(`sync:${newCode}`);
    if (existing) {
      // Extremely unlikely collision — just try again
      const retryCode = generateCode();
      await redis.set(`sync:${retryCode}`, { lists, updatedAt: new Date().toISOString() }, { ex: 90 * 24 * 60 * 60 }); // 90 days
      return NextResponse.json({ code: retryCode });
    }
    await redis.set(`sync:${newCode}`, { lists, updatedAt: new Date().toISOString() }, { ex: 90 * 24 * 60 * 60 });
    return NextResponse.json({ code: newCode });
  }

  if (action === "save") {
    const upperCode = code?.toUpperCase();
    if (!upperCode || upperCode.length !== 6) {
      return NextResponse.json({ error: "Invalid sync code" }, { status: 400 });
    }
    // Verify code exists
    const existing = await redis.get(`sync:${upperCode}`);
    if (!existing) {
      return NextResponse.json({ error: "Sync code not found" }, { status: 404 });
    }
    await redis.set(`sync:${upperCode}`, { lists, updatedAt: new Date().toISOString() }, { ex: 90 * 24 * 60 * 60 });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
