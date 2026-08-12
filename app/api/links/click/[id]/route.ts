import { NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { links, pageAnalytics, publicProfiles } from "@/db/schema";

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const link = await db.query.links.findFirst({ where: eq(links.id, id) });
  if (!link || !link.isActive) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await db
    .update(links)
    .set({ clicks: sql`${links.clicks} + 1` })
    .where(eq(links.id, id));

  const profile = await db.query.publicProfiles.findFirst({
    where: eq(publicProfiles.userId, link.userId),
  });

  if (profile) {
    const referrer = req.headers.get("referer");
    const userAgent = req.headers.get("user-agent");
    await db.insert(pageAnalytics).values({
      profileId: profile.id,
      linkId: link.id,
      eventType: "link_click",
      referrer,
      userAgent,
    });
  }

  return NextResponse.json({ data: { url: link.url } });
}
