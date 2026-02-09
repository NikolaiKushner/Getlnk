import { define } from "../../../utils.ts";
import { getSession, getUserProfile } from "../../../lib/auth.ts";
import { createSupabaseClient } from "../../../lib/supabase.ts";
import type {
  ProfileTheme,
  PublicProfileInsert,
  PublicProfileUpdate,
} from "../../../lib/database.types.ts";
import {
  canAddSocialLink,
  getMaxBioLength,
  getPlanLimits,
  isThemeAllowed,
} from "../../../lib/plans.ts";

// GET /api/public-profile - Get current user's public profile
// POST /api/public-profile - Create or update public profile
export const handler = define.handlers({
  async GET(ctx) {
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

      const { data: profile, error } = await supabase
        .from("public_profiles")
        .select("*")
        .eq("user_id", session.user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        // PGRST116 = no rows returned
        console.error("Error fetching public profile:", error);
        return new Response(
          JSON.stringify({ error: "Failed to fetch profile" }),
          {
            status: 500,
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      return new Response(
        JSON.stringify({ profile: profile || null }),
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
      const {
        username,
        display_name,
        bio,
        avatar_url,
        theme,
        is_published,
        social_links,
      } = body;

      // Validate username if provided
      if (username !== undefined) {
        if (
          typeof username !== "string" || username.length < 3 ||
          username.length > 30
        ) {
          return new Response(
            JSON.stringify({
              error: "Username must be between 3 and 30 characters",
            }),
            {
              status: 400,
              headers: { "Content-Type": "application/json" },
            },
          );
        }

        if (!/^[a-z0-9_]+$/.test(username)) {
          return new Response(
            JSON.stringify({
              error:
                "Username can only contain lowercase letters, numbers, and underscores",
            }),
            {
              status: 400,
              headers: { "Content-Type": "application/json" },
            },
          );
        }
      }

      // Get user's plan for limit enforcement
      const userProfileData = await getUserProfile(
        session.user.id,
        session.accessToken,
      );
      const userPlan = userProfileData?.plan || "free";
      const planLimits = getPlanLimits(userPlan);

      // Validate bio length against plan limits
      const maxBio = getMaxBioLength(userPlan);
      if (bio !== undefined && bio && bio.length > maxBio) {
        return new Response(
          JSON.stringify({
            error: `Bio must be ${maxBio} characters or less on your current plan`,
            code: "PLAN_LIMIT_REACHED",
            limit: maxBio,
            requiredPlan: userPlan === "free" ? "pro" : "business",
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      // Validate theme against plan allowlist
      const validThemes: ProfileTheme[] = [
        "default",
        "dark",
        "gradient",
        "minimal",
        "ocean",
      ];
      if (theme !== undefined && !validThemes.includes(theme)) {
        return new Response(
          JSON.stringify({ error: "Invalid theme" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      if (theme !== undefined && !isThemeAllowed(userPlan, theme)) {
        return new Response(
          JSON.stringify({
            error: `The "${theme}" theme requires a Pro plan or higher`,
            code: "PLAN_LIMIT_REACHED",
            requiredPlan: "pro",
          }),
          {
            status: 403,
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      // Validate social links count against plan limits
      if (social_links !== undefined && social_links) {
        const filledSocialLinks = Object.values(social_links).filter(
          (v) => !!v,
        ).length;
        if (!canAddSocialLink(userPlan, filledSocialLinks)) {
          return new Response(
            JSON.stringify({
              error: `Free plan allows up to ${planLimits.maxSocialLinks} social links. Upgrade to Pro for unlimited.`,
              code: "PLAN_LIMIT_REACHED",
              limit: planLimits.maxSocialLinks,
              current: filledSocialLinks,
              requiredPlan: "pro",
            }),
            {
              status: 403,
              headers: { "Content-Type": "application/json" },
            },
          );
        }
      }

      const supabase = createSupabaseClient(session.accessToken);

      // Check if profile exists
      const { data: existingProfile } = await supabase
        .from("public_profiles")
        .select("id")
        .eq("user_id", session.user.id)
        .single();

      if (existingProfile) {
        // Update existing profile
        const updateData: PublicProfileUpdate = {};
        if (username !== undefined) updateData.username = username;
        if (display_name !== undefined) updateData.display_name = display_name;
        if (bio !== undefined) updateData.bio = bio;
        if (avatar_url !== undefined) updateData.avatar_url = avatar_url;
        if (theme !== undefined) updateData.theme = theme;
        if (is_published !== undefined) updateData.is_published = is_published;
        if (social_links !== undefined) updateData.social_links = social_links;

        const { data: profile, error } = await supabase
          .from("public_profiles")
          .update(updateData)
          .eq("user_id", session.user.id)
          .select()
          .single();

        if (error) {
          // Check for unique constraint violation on username
          if (error.code === "23505") {
            return new Response(
              JSON.stringify({ error: "Username is already taken" }),
              {
                status: 400,
                headers: { "Content-Type": "application/json" },
              },
            );
          }
          console.error("Error updating public profile:", error);
          return new Response(
            JSON.stringify({ error: "Failed to update profile" }),
            {
              status: 500,
              headers: { "Content-Type": "application/json" },
            },
          );
        }

        return new Response(
          JSON.stringify({ profile }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          },
        );
      } else {
        // Create new profile - username is required
        if (!username) {
          return new Response(
            JSON.stringify({
              error: "Username is required when creating a profile",
            }),
            {
              status: 400,
              headers: { "Content-Type": "application/json" },
            },
          );
        }

        const insertData: PublicProfileInsert = {
          user_id: session.user.id,
          username,
          display_name: display_name || null,
          bio: bio || null,
          avatar_url: avatar_url || null,
          theme: theme || "default",
          is_published: is_published || false,
          social_links: social_links || {},
        };

        const { data: profile, error } = await supabase
          .from("public_profiles")
          .insert(insertData)
          .select()
          .single();

        if (error) {
          // Check for unique constraint violation on username
          if (error.code === "23505") {
            return new Response(
              JSON.stringify({ error: "Username is already taken" }),
              {
                status: 400,
                headers: { "Content-Type": "application/json" },
              },
            );
          }
          console.error("Error creating public profile:", error);
          return new Response(
            JSON.stringify({ error: "Failed to create profile" }),
            {
              status: 500,
              headers: { "Content-Type": "application/json" },
            },
          );
        }

        return new Response(
          JSON.stringify({ profile }),
          {
            status: 201,
            headers: { "Content-Type": "application/json" },
          },
        );
      }
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
