import { NextResponse } from "next/server";
import { and, desc, eq, gte, sql } from "drizzle-orm";
import { db } from "@/db";
import { links, pageAnalytics, publicProfiles } from "@/db/schema";
import { ensureUserProfile } from "@/lib/auth";

export async function GET(req: Request) {
  const profile = await ensureUserProfile();
  if (!profile) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const publicProfile = await db.query.publicProfiles.findFirst({
    where: eq(publicProfiles.userId, profile.id),
  });
  if (!publicProfile) {
    return NextResponse.json({
      data: { pageViews: 0, linkClicks: 0, topLinks: [], recentEvents: [] },
    });
  }

  const days = Number(new URL(req.url).searchParams.get("days") ?? "30");
  const since = new Date();
  since.setDate(since.getDate() - (Number.isFinite(days) ? days : 30));

  const [views] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(pageAnalytics)
    .where(
      and(
        eq(pageAnalytics.profileId, publicProfile.id),
        eq(pageAnalytics.eventType, "page_view"),
        gte(pageAnalytics.createdAt, since),
      ),
    );

  const [clicks] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(pageAnalytics)
    .where(
      and(
        eq(pageAnalytics.profileId, publicProfile.id),
        eq(pageAnalytics.eventType, "link_click"),
        gte(pageAnalytics.createdAt, since),
      ),
    );

  const userLinks = await db.query.links.findMany({
    where: eq(links.userId, profile.id),
    orderBy: [desc(links.clicks)],
  });

  const recentEvents = await db.query.pageAnalytics.findMany({
    where: and(
      eq(pageAnalytics.profileId, publicProfile.id),
      gte(pageAnalytics.createdAt, since),
    ),
    orderBy: [desc(pageAnalytics.createdAt)],
    limit: 20,
  });

  return NextResponse.json({
    data: {
      pageViews: views?.count ?? 0,
      totalPageViews: publicProfile.pageViews,
      linkClicks: clicks?.count ?? 0,
      topLinks: userLinks.slice(0, 10),
      recentEvents,
    },
  });
}
