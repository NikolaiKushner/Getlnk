import { define } from "../../../utils.ts";
import { getSession } from "../../../lib/auth.ts";
import { createSupabaseClient } from "../../../lib/supabase.ts";
import type { LinkUpdate } from "../../../lib/database.types.ts";

export const handler = define.handlers({
  // PUT /api/links/:id - Update a link
  async PUT(ctx) {
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

      const linkId = ctx.params.id;
      const body = await ctx.req.json();
      const { title, url, icon, is_active } = body;

      // Validate URL if provided
      if (url) {
        try {
          new URL(url);
        } catch {
          return new Response(
            JSON.stringify({ error: "Invalid URL format" }),
            {
              status: 400,
              headers: { "Content-Type": "application/json" },
            },
          );
        }
      }

      const supabase = createSupabaseClient(session.accessToken);

      // Build update object with only provided fields
      const updateData: LinkUpdate = {};
      if (title !== undefined) updateData.title = title;
      if (url !== undefined) updateData.url = url;
      if (icon !== undefined) updateData.icon = icon;
      if (is_active !== undefined) updateData.is_active = is_active;

      const { data: link, error } = await supabase
        .from("links")
        .update(updateData)
        .eq("id", linkId)
        .eq("user_id", session.user.id)
        .select()
        .single();

      if (error) {
        console.error("Error updating link:", error);
        return new Response(
          JSON.stringify({ error: "Failed to update link" }),
          {
            status: 500,
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      if (!link) {
        return new Response(
          JSON.stringify({ error: "Link not found" }),
          {
            status: 404,
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      return new Response(
        JSON.stringify({ link }),
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

  // DELETE /api/links/:id - Delete a link
  async DELETE(ctx) {
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

      const linkId = ctx.params.id;
      const supabase = createSupabaseClient(session.accessToken);

      const { error } = await supabase
        .from("links")
        .delete()
        .eq("id", linkId)
        .eq("user_id", session.user.id);

      if (error) {
        console.error("Error deleting link:", error);
        return new Response(
          JSON.stringify({ error: "Failed to delete link" }),
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
