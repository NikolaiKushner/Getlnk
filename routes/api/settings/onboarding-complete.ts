import { define } from "../../../utils.ts";
import { getSession } from "../../../lib/auth.ts";
import { createSupabaseClient } from "../../../lib/supabase.ts";

// POST /api/settings/onboarding-complete — Mark onboarding as completed or skipped
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

      const supabase = createSupabaseClient(session.accessToken);

      const { error } = await supabase
        .from("user_profiles")
        .update({ onboarding_completed: true })
        .eq("id", session.user.id);

      if (error) {
        console.error("Error completing onboarding:", error);
        return new Response(
          JSON.stringify({ error: "Failed to update onboarding status" }),
          {
            status: 500,
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      return new Response(
        JSON.stringify({ success: true }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      );
    } catch (err) {
      return new Response(
        JSON.stringify({
          error: err instanceof Error ? err.message : "Unknown error",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }
  },
});
