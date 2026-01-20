import { NextResponse } from "next/server";
import { connectOnce } from "@/server/db/mongoose";

export async function GET() {
  try {
    await connectOnce();
    return NextResponse.json({ ok: true, db: "connected" });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        db: "disconnected",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 503 }
    );
  }
}
