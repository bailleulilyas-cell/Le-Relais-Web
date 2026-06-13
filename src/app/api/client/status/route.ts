import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { projets } from "@/lib/schema";
import { getSession } from "@/lib/session";

export const runtime = "nodejs";

/**
 * Vérifie en direct si le site du client répond.
 * Retourne { status: 'online' | 'offline' | 'none', time_ms? }.
 */
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ status: "none" }, { status: 401 });
    }

    const db = getDb();
    const rows = await db
      .select({ urlSite: projets.urlSite })
      .from(projets)
      .where(eq(projets.userId, session.userId))
      .limit(1);

    const url = rows[0]?.urlSite?.trim();
    if (!url) return NextResponse.json({ status: "none" });

    const target = /^https?:\/\//i.test(url) ? url : `https://${url}`;
    const start = Date.now();
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 6000);
      const res = await fetch(target, {
        method: "GET",
        redirect: "follow",
        signal: ctrl.signal,
        headers: { "User-Agent": "LeRelaisWeb-StatusCheck/1.0" },
      });
      clearTimeout(timer);
      const timeMs = Date.now() - start;
      const online = res.status > 0 && res.status < 500;
      return NextResponse.json({ status: online ? "online" : "offline", time_ms: timeMs });
    } catch {
      return NextResponse.json({ status: "offline" });
    }
  } catch (e) {
    console.error("status:", e);
    return NextResponse.json({ status: "none" }, { status: 500 });
  }
}
