import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/studio/auth";

export async function GET() {
  try {
    const payload = await verifyAuth();
    return NextResponse.json({ sub: payload.sub, role: payload.role });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
