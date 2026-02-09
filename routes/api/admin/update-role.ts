import { define } from "../../../utils.ts";
import { getSession, getUserProfile, isSuperAdmin } from "../../../lib/auth.ts";
import { createSupabaseClient } from "../../../lib/supabase.ts";

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

      const profile = await getUserProfile(
        session.user.id,
        session.accessToken,
      );
      if (!profile || !isSuperAdmin(profile)) {
        return new Response(
          JSON.stringify({ error: "Forbidden: Superadmin access required" }),
          {
            status: 403,
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      const body = await ctx.req.json();
      const { userId, role } = body;

      if (!userId || !role) {
        return new Response(
          JSON.stringify({ error: "Missing userId or role" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      if (role !== "regular" && role !== "superadmin") {
        return new Response(
          JSON.stringify({ error: "Invalid role" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      const supabase = createSupabaseClient(session.accessToken);

      const { error } = await supabase
        .from("user_profiles")
        .update({ role })
        .eq("id", userId);

      if (error) {
        console.error("Error updating role:", error);
        return new Response(
          JSON.stringify({ error: "Failed to update role" }),
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
