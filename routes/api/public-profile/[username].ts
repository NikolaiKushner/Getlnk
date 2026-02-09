import { define } from "../../../utils.ts";
import { createAdminSupabaseClient } from "../../../lib/supabase.ts";
import type { PublicProfile } from "../../../lib/database.types.ts";

// GET /api/public-profile/:username - Get a public profile by username (public endpoint)
export const handler = define.handlers({
  async GET(ctx) {
    try {
      const username = ctx.params.username;

      if (!username) {
        return new Response(
          JSON.stringify({ error: "Username is required" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      // Use admin client to fetch public profiles (bypasses RLS for published check)
      const supabase = createAdminSupabaseClient();

      // Get the public profile
      const { data: profile, error: profileError } = await supabase
        .from("public_profiles")
        .select("*")
        .eq("username", username)
        .eq("is_published", true)
        .single();

      const typedProfile = profile as PublicProfile | null;

      if (profileError || !typedProfile) {
        return new Response(
          JSON.stringify({ error: "Profile not found" }),
          {
            status: 404,
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      // Get the links for this profile
      const { data: links, error: linksError } = await supabase
        .from("links")
        .select("id, title, url, icon, position")
        .eq("user_id", typedProfile.user_id)
        .eq("is_active", true)
        .order("position", { ascending: true });

      if (linksError) {
        console.error("Error fetching links:", linksError);
      }

      // Increment page views (fire and forget)
      supabase
        .from("public_profiles")
        .update({ page_views: typedProfile.page_views + 1 })
        .eq("id", typedProfile.id)
        .then(() => {});

      return new Response(
        JSON.stringify({
          profile: {
            username: typedProfile.username,
            display_name: typedProfile.display_name,
            bio: typedProfile.bio,
            avatar_url: typedProfile.avatar_url,
            theme: typedProfile.theme,
          },
          links: links || [],
        }),
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
