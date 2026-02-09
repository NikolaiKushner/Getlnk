import { define } from "../../../utils.ts";
import { getSession, getUserProfile } from "../../../lib/auth.ts";
import { createSupabaseClient } from "../../../lib/supabase.ts";
import type { Database } from "../../../lib/database.types.ts";
import { getPlanLimits } from "../../../lib/plans.ts";

interface DailyStats {
  date: string;
  views: number;
  clicks: number;
}

interface TopLink {
  id: string;
  title: string;
  url: string;
  clicks: number;
}

interface AnalyticsResponse {
  totalViews: number;
  totalClicks: number;
  topLinks: TopLink[];
  dailyStats: DailyStats[];
  plan: {
    current: string;
    analyticsRetentionDays: number;
    hasReferrers: boolean;
    hasCountries: boolean;
    hasExport: boolean;
  };
}

type PublicProfile = Database["public"]["Tables"]["public_profiles"]["Row"];
type Link = Database["public"]["Tables"]["links"]["Row"];
type PageAnalytics = Database["public"]["Tables"]["page_analytics"]["Row"];

export const handler = define.handlers({
  async GET(ctx) {
    try {
      const session = await getSession(ctx.req);
      if (!session) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }

      const url = new URL(ctx.req.url);
      const days = url.searchParams.get("days");

      // Get user's plan to enforce analytics retention limits
      const userProfileData = await getUserProfile(
        session.user.id,
        session.accessToken,
      );
      const userPlan = userProfileData?.plan || "free";
      const planLimits = getPlanLimits(userPlan);
      // Parse days parameter
      let daysBack = 30; // default
      if (days === "7") daysBack = 7;
      else if (days === "30") daysBack = 30;
      else if (days === "all") daysBack = 365 * 10; // 10 years

      // Enforce plan retention limit: clamp daysBack to plan max
      if (
        planLimits.analyticsRetentionDays !== -1 &&
        daysBack > planLimits.analyticsRetentionDays
      ) {
        daysBack = planLimits.analyticsRetentionDays;
      }

      const supabase = createSupabaseClient(session.accessToken);

      // Get user's public profile
      const { data: profile } = await supabase
        .from("public_profiles")
        .select("id, page_views")
        .eq("user_id", session.user.id)
        .single();

      if (!profile) {
        return new Response(JSON.stringify({ data: null }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      const typedProfile = profile as PublicProfile;

      // Get all links with click counts
      const { data: links } = await supabase
        .from("links")
        .select("id, title, url, clicks")
        .eq("user_id", session.user.id)
        .order("clicks", { ascending: false })
        .limit(5);

      const typedLinks =
        links as (Pick<Link, "id" | "title" | "url" | "clicks"> | null)[];

      const topLinks = (typedLinks || [])
        .filter((link) => link !== null)
        .map((link) => ({
          id: link.id,
          title: link.title,
          url: link.url,
          clicks: link.clicks || 0,
        }));

      // Calculate total clicks
      const totalClicks = topLinks.reduce((sum, link) => sum + link.clicks, 0);

      // Get daily stats from page_analytics
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysBack);

      const { data: analyticsData } = await supabase
        .from("page_analytics")
        .select("event_type, created_at")
        .eq("profile_id", typedProfile.id)
        .gte("created_at", cutoffDate.toISOString());

      const typedAnalyticsData = analyticsData as PageAnalytics[];

      // Process daily stats
      const dailyMap = new Map<string, { views: number; clicks: number }>();

      if (typedAnalyticsData) {
        for (const event of typedAnalyticsData) {
          const date = new Date(event.created_at)
            .toISOString()
            .split("T")[0];

          if (!dailyMap.has(date)) {
            dailyMap.set(date, { views: 0, clicks: 0 });
          }

          const stats = dailyMap.get(date)!;
          if (event.event_type === "page_view") {
            stats.views += 1;
          } else if (event.event_type === "link_click") {
            stats.clicks += 1;
          }
        }
      }

      // Convert map to sorted array
      const dailyStats: DailyStats[] = Array.from(dailyMap.entries())
        .map(([date, stats]) => ({
          date,
          views: stats.views,
          clicks: stats.clicks,
        }))
        .sort((a, b) => a.date.localeCompare(b.date));

      // If no analytics data, use profile totals
      let totalViews = typedProfile.page_views || 0;

      // If we have daily stats, recalculate total from those
      if (dailyStats.length > 0) {
        totalViews = dailyStats.reduce((sum, day) => sum + day.views, 0);
      }

      const response: AnalyticsResponse = {
        totalViews,
        totalClicks,
        topLinks,
        dailyStats,
        plan: {
          current: userPlan,
          analyticsRetentionDays: planLimits.analyticsRetentionDays,
          hasReferrers: planLimits.analyticsReferrers,
          hasCountries: planLimits.analyticsCountries,
          hasExport: planLimits.analyticsExport,
        },
      };

      return new Response(JSON.stringify({ data: response }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Analytics error:", error);
      return new Response(
        JSON.stringify({
          error: error instanceof Error
            ? error.message
            : "Failed to fetch analytics",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }
  },
});
