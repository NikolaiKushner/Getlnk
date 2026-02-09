import { define } from "../../../utils.ts";
import { getSession } from "../../../lib/auth.ts";
import { createSupabaseClient } from "../../../lib/supabase.ts";

// POST /api/links/reorder - Reorder links
export const handler = define.handlers({
  async POST(ctx) {
    try {
      const session = await getSession(ctx.req);
      if (!session) {
        return new Response(
          JSON.stringify({ error: "Unauthorized" }),
          {
            status: 401,
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      const body = await ctx.req.json();
      const { linkIds } = body;

      if (!Array.isArray(linkIds) || linkIds.length === 0) {
        return new Response(
          JSON.stringify({ error: "linkIds array is required" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      const supabase = createSupabaseClient(session.accessToken);

      // Update positions for each link
      const updates = linkIds.map((id: string, index: number) =>
        supabase
          .from("links")
          .update({ position: index })
          .eq("id", id)
          .eq("user_id", session.user.id)
      );

      await Promise.all(updates);

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
