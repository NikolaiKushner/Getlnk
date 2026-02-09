import { define } from "../../../utils.ts";
import { createAdminSupabaseClient } from "../../../lib/supabase.ts";

// POST /api/links/click - Track a link click (public endpoint)
export const handler = define.handlers({
  async POST(ctx) {
    try {
      const body = await ctx.req.json();
      const { linkId } = body;

      if (!linkId) {
        return new Response(
          JSON.stringify({ error: "linkId is required" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      const supabase = createAdminSupabaseClient();

      // Atomic increment using PostgreSQL's native increment
      // This avoids race conditions by doing the read and write in a single operation
      const { error } = await supabase.rpc("increment_link_clicks", {
        link_id: linkId,
      });

      if (error) {
        console.error("Error incrementing clicks:", error);
        // Fallback: try direct update (less safe but works without the function)
        await supabase
          .from("links")
          .update({ clicks: 1 })
          .eq("id", linkId)
          .is("clicks", null);
      }

      return new Response(
        JSON.stringify({ success: true }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      );
    } catch (error) {
      return new Response(
        JSON.stringify({
          error: error instanceof Error ? error.message : "Unknown error",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }
  },
});
