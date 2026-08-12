import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { publicProfiles, userProfiles } from "@/db/schema";
import { ensureUserProfile } from "@/lib/auth";
import { uploadAvatarObject } from "@/lib/r2";

const VALID_TYPES = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);
const MAX_SIZE = 2 * 1024 * 1024;

export async function POST(req: Request) {
  const profile = await ensureUserProfile();
  if (!profile) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("avatar");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!VALID_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Please upload a JPEG, PNG, or WebP image." },
        { status: 400 },
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 2MB." },
        { status: 400 },
      );
    }

    const ext = file.type === "image/jpeg" || file.type === "image/jpg"
      ? "jpg"
      : file.type.split("/")[1] || "bin";
    const key = `avatars/${profile.id}/avatar.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    // Cache-bust public URL when overwriting the same key
    const publicUrl = `${await uploadAvatarObject({
      key,
      body: buffer,
      contentType: file.type,
    })}?v=${Date.now()}`;

    await db
      .update(userProfiles)
      .set({ avatarUrl: publicUrl, updatedAt: new Date() })
      .where(eq(userProfiles.id, profile.id));

    await db
      .update(publicProfiles)
      .set({ avatarUrl: publicUrl, updatedAt: new Date() })
      .where(eq(publicProfiles.userId, profile.id));

    return NextResponse.json({
      data: { avatarUrl: publicUrl },
      message: "Avatar uploaded successfully",
    });
  } catch (error) {
    console.error("Avatar upload error:", error);
    return NextResponse.json(
      {
        error: "Failed to upload avatar",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
