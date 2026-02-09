import { define } from "../../../utils.ts";
import { getAuthUser } from "../../../lib/auth.ts";
import { createSupabaseClient } from "../../../lib/supabase.ts";

export const handler = define.handlers({
  async POST(ctx) {
    // Get authenticated user
    const authUser = await getAuthUser(ctx.req);
    if (!authUser) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json" } },
      );
    }

    const { user, session } = authUser;

    try {
      // Parse form data
      const formData = await ctx.req.formData();
      const file = formData.get("avatar") as File;

      if (!file) {
        return new Response(
          JSON.stringify({ error: "No file provided" }),
          { status: 400, headers: { "Content-Type": "application/json" } },
        );
      }

      // Validate file type
      const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
      if (!validTypes.includes(file.type)) {
        return new Response(
          JSON.stringify({
            error:
              "Invalid file type. Please upload a JPEG, PNG, or WebP image.",
          }),
          { status: 400, headers: { "Content-Type": "application/json" } },
        );
      }

      // Validate file size (max 2MB)
      const maxSize = 2 * 1024 * 1024; // 2MB in bytes
      if (file.size > maxSize) {
        return new Response(
          JSON.stringify({
            error: "File too large. Maximum size is 2MB.",
          }),
          { status: 400, headers: { "Content-Type": "application/json" } },
        );
      }

      // Read file as array buffer
      const arrayBuffer = await file.arrayBuffer();
      const fileBuffer = new Uint8Array(arrayBuffer);

      // Generate file path: avatars/{user_id}/avatar.{ext}
      const fileExt = file.type.split("/")[1];
      const filePath = `${user.id}/avatar.${fileExt}`;

      // Create authenticated Supabase client for the upload
      // This is important for RLS policies
      const userSupabase = createSupabaseClient(session.accessToken);

      // Upload to Supabase Storage
      // Note: You need to create a "avatars" bucket in Supabase Storage first
      // with public access enabled
      const { data: _uploadData, error: uploadError } = await userSupabase
        .storage
        .from("avatars")
        .upload(filePath, fileBuffer, {
          contentType: file.type,
          upsert: true, // Overwrite if exists
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        return new Response(
          JSON.stringify({
            error: "Failed to upload avatar",
            details: uploadError.message,
          }),
          { status: 500, headers: { "Content-Type": "application/json" } },
        );
      }

      // Get public URL for the uploaded file
      const { data: publicUrlData } = userSupabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      const avatarUrl = publicUrlData.publicUrl;

      // Update user's public profile with new avatar URL
      const { error: updateError } = await userSupabase
        .from("public_profiles")
        .update({ avatar_url: avatarUrl })
        .eq("user_id", user.id);

      if (updateError) {
        console.error("Profile update error:", updateError);
        return new Response(
          JSON.stringify({
            error: "Failed to update profile",
            details: updateError.message,
          }),
          { status: 500, headers: { "Content-Type": "application/json" } },
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          avatar_url: avatarUrl,
          message: "Avatar uploaded successfully",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    } catch (error) {
      console.error("Avatar upload error:", error);
      return new Response(
        JSON.stringify({
          error: "Failed to upload avatar",
          details: error instanceof Error ? error.message : "Unknown error",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }
  },
});
