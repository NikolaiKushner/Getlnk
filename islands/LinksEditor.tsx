import { useSignal } from "@preact/signals";
import { useEffect } from "preact/hooks";
import * as preact from "preact";
import { Button, Input, Textarea } from "../components/ui/index.ts";
import type {
  Link,
  ProfileTheme,
  PublicProfile,
  SubscriptionPlan,
} from "../lib/database.types.ts";

interface PlanLimitsProps {
  maxLinks: number; // -1 = unlimited
  maxSocialLinks: number; // -1 = unlimited
  maxBioLength: number;
  allowedThemes: ProfileTheme[];
  removeBranding: boolean;
}

interface LinksEditorProps {
  initialProfile: PublicProfile | null;
  initialLinks: Link[];
  showQuickView?: boolean;
  plan?: SubscriptionPlan;
  planLimits?: PlanLimitsProps;
}

// Default limits for backward compatibility (free plan)
const DEFAULT_PLAN_LIMITS: PlanLimitsProps = {
  maxLinks: 5,
  maxSocialLinks: 3,
  maxBioLength: 160,
  allowedThemes: ["default", "dark", "minimal"],
  removeBranding: false,
};

interface QuickViewLink {
  id: string;
  title: string;
  url: string;
  icon: string | null;
}

const THEMES: { value: ProfileTheme; label: string; preview: string }[] = [
  { value: "default", label: "Default", preview: "bg-white" },
  { value: "dark", label: "Dark", preview: "bg-gray-900" },
  {
    value: "gradient",
    label: "Gradient",
    preview: "bg-gradient-to-br from-purple-500 to-pink-500",
  },
  { value: "minimal", label: "Minimal", preview: "bg-gray-100" },
  {
    value: "ocean",
    label: "Ocean",
    preview: "bg-gradient-to-br from-cyan-500 to-blue-500",
  },
];

const SOCIAL_PLATFORMS = [
  {
    key: "instagram",
    label: "Instagram",
    icon: (
      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
    placeholder: "username",
  },
  {
    key: "x",
    label: "X",
    icon: (
      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
    placeholder: "handle",
  },
  {
    key: "youtube",
    label: "YouTube",
    icon: (
      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
    placeholder: "channel",
  },
  {
    key: "tiktok",
    label: "TikTok",
    icon: (
      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
      </svg>
    ),
    placeholder: "username",
  },
  {
    key: "linkedin",
    label: "LinkedIn",
    icon: (
      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
    placeholder: "username",
  },
  {
    key: "github",
    label: "GitHub",
    icon: (
      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
      </svg>
    ),
    placeholder: "username",
  },
];

const PREVIEW_SOCIAL_ICONS: Record<string, preact.JSX.Element> = {
  instagram: (
    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  ),
  x: (
    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  ),
  youtube: (
    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  ),
  tiktok: (
    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
    </svg>
  ),
  linkedin: (
    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  ),
  github: (
    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  ),
  twitter: (
    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  ),
};

const PREVIEW_THEME_STYLES: Record<
  ProfileTheme,
  { bg: string; text: string; link: string }
> = {
  default: {
    bg: "bg-gray-100",
    text: "text-gray-900",
    link: "bg-white text-gray-900 border border-gray-200",
  },
  dark: {
    bg: "bg-gray-900",
    text: "text-white",
    link: "bg-gray-800 text-white border border-gray-700",
  },
  gradient: {
    bg: "bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400",
    text: "text-white",
    link: "bg-white/20 text-white border border-white/30",
  },
  minimal: {
    bg: "bg-white",
    text: "text-gray-900",
    link: "bg-gray-100 text-gray-900",
  },
  ocean: {
    bg: "bg-gradient-to-br from-cyan-500 via-blue-500 to-indigo-600",
    text: "text-white",
    link: "bg-white/20 text-white border border-white/30",
  },
};

export default function LinksEditor(
  { initialProfile, initialLinks, showQuickView, plan = "free", planLimits }: LinksEditorProps,
) {
  const limits = planLimits || DEFAULT_PLAN_LIMITS;
  const _isFreePlan = plan === "free";
  const _linkLimitReached = limits.maxLinks !== -1 && initialLinks.length >= limits.maxLinks;

  // Profile state
  const username = useSignal(initialProfile?.username || "");
  const displayName = useSignal(initialProfile?.display_name || "");
  const bio = useSignal(initialProfile?.bio || "");
  const avatarUrl = useSignal(initialProfile?.avatar_url || "");
  const theme = useSignal<ProfileTheme>(initialProfile?.theme || "default");
  const isPublished = useSignal(initialProfile?.is_published || false);
  const hasProfile = useSignal(!!initialProfile);

  // Social links state
  const socialLinks = useSignal<Record<string, string>>(
    (initialProfile?.social_links as Record<string, string>) || {},
  );

  // Links state
  const links = useSignal<Link[]>(initialLinks);
  const newLinkTitle = useSignal("");
  const newLinkUrl = useSignal("");

  // UI state
  const loading = useSignal(false);
  const error = useSignal("");
  const success = useSignal("");
  const usernameAvailable = useSignal<boolean | null>(null);
  const checkingUsername = useSignal(false);
  const editingLinkId = useSignal<string | null>(null);
  const editLinkTitle = useSignal("");
  const editLinkUrl = useSignal("");
  const uploadingAvatar = useSignal(false);

  // Check username availability
  const checkUsername = async (value: string) => {
    if (!value || value.length < 3) {
      usernameAvailable.value = null;
      return;
    }

    // Don't check if it's the current username
    if (initialProfile?.username === value) {
      usernameAvailable.value = true;
      return;
    }

    checkingUsername.value = true;
    try {
      const res = await fetch(
        `/api/public-profile/check-username?username=${
          encodeURIComponent(value)
        }`,
      );
      const data = await res.json();
      usernameAvailable.value = data.available;
      if (!data.available && data.error) {
        error.value = data.error;
      }
    } catch {
      usernameAvailable.value = null;
    } finally {
      checkingUsername.value = false;
    }
  };

  // Debounce username check
  useEffect(() => {
    const timer = setTimeout(() => {
      checkUsername(username.value);
    }, 500);
    return () => clearTimeout(timer);
  }, [username.value]);

  // Save profile
  const saveProfile = async () => {
    loading.value = true;
    error.value = "";
    success.value = "";

    try {
      const res = await fetch("/api/public-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.value,
          display_name: displayName.value || null,
          bio: bio.value || null,
          theme: theme.value,
          is_published: isPublished.value,
          social_links: socialLinks.value,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to save profile");
      }

      hasProfile.value = true;
      success.value = "Profile saved successfully!";
      setTimeout(() => success.value = "", 3000);
    } catch (err) {
      error.value = err instanceof Error
        ? err.message
        : "Failed to save profile";
    } finally {
      loading.value = false;
    }
  };

  // Upload avatar
  const uploadAvatar = async (e: Event) => {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    // Validate file type
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      error.value = "Please upload a JPEG, PNG, or WebP image";
      return;
    }

    // Validate file size (max 2MB)
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      error.value = "File too large. Maximum size is 2MB";
      return;
    }

    uploadingAvatar.value = true;
    error.value = "";

    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const res = await fetch("/api/profile/upload-avatar", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to upload avatar");
      }

      avatarUrl.value = data.avatar_url;
      success.value = "Avatar uploaded successfully!";
      setTimeout(() => success.value = "", 3000);
    } catch (err) {
      error.value = err instanceof Error
        ? err.message
        : "Failed to upload avatar";
    } finally {
      uploadingAvatar.value = false;
      // Reset file input
      input.value = "";
    }
  };

  // Add new link
  const addLink = async () => {
    if (!newLinkTitle.value || !newLinkUrl.value) {
      error.value = "Please enter both title and URL";
      return;
    }

    loading.value = true;
    error.value = "";

    try {
      const res = await fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newLinkTitle.value,
          url: newLinkUrl.value,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to add link");
      }

      links.value = [...links.value, data.link];
      newLinkTitle.value = "";
      newLinkUrl.value = "";
      success.value = "Link added!";
      setTimeout(() => success.value = "", 2000);
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Failed to add link";
    } finally {
      loading.value = false;
    }
  };

  // Update link
  const updateLink = async (id: string) => {
    loading.value = true;
    error.value = "";

    try {
      const res = await fetch(`/api/links/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editLinkTitle.value,
          url: editLinkUrl.value,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update link");
      }

      links.value = links.value.map((l) => l.id === id ? data.link : l);
      editingLinkId.value = null;
      success.value = "Link updated!";
      setTimeout(() => success.value = "", 2000);
    } catch (err) {
      error.value = err instanceof Error
        ? err.message
        : "Failed to update link";
    } finally {
      loading.value = false;
    }
  };

  // Delete link
  const deleteLink = async (id: string) => {
    if (!confirm("Are you sure you want to delete this link?")) return;

    loading.value = true;
    error.value = "";

    try {
      const res = await fetch(`/api/links/${id}`, { method: "DELETE" });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete link");
      }

      links.value = links.value.filter((l) => l.id !== id);
      success.value = "Link deleted!";
      setTimeout(() => success.value = "", 2000);
    } catch (err) {
      error.value = err instanceof Error
        ? err.message
        : "Failed to delete link";
    } finally {
      loading.value = false;
    }
  };

  // Toggle link active state
  const toggleLinkActive = async (link: Link) => {
    try {
      const res = await fetch(`/api/links/${link.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !link.is_active }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update link");
      }

      links.value = links.value.map((l) => l.id === link.id ? data.link : l);
    } catch (err) {
      error.value = err instanceof Error
        ? err.message
        : "Failed to update link";
    }
  };

  // Move link up/down
  const moveLink = async (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= links.value.length) return;

    // Save original state before modifying for proper revert on error
    const originalLinks = [...links.value];

    const newLinks = [...links.value];
    [newLinks[index], newLinks[newIndex]] = [
      newLinks[newIndex],
      newLinks[index],
    ];
    links.value = newLinks;

    // Save new order
    try {
      const res = await fetch("/api/links/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ linkIds: newLinks.map((l) => l.id) }),
      });

      if (!res.ok) {
        throw new Error("Failed to save order");
      }
    } catch {
      // Revert to original state on error
      links.value = originalLinks;
      error.value = "Failed to reorder links";
      setTimeout(() => error.value = "", 3000);
    }
  };

  const startEditing = (link: Link) => {
    editingLinkId.value = link.id;
    editLinkTitle.value = link.title;
    editLinkUrl.value = link.url;
  };

  const publicUrl = username.value
    ? `${globalThis.location?.origin || ""}/@${username.value}`
    : "";

  const activePreviewLinks = links.value.filter((l) => l.is_active);
  const previewStyles = PREVIEW_THEME_STYLES[theme.value] ||
    PREVIEW_THEME_STYLES.default;
  const isDarkTheme = theme.value === "dark" || theme.value === "gradient" ||
    theme.value === "ocean";
  const hasSocialLinks = Object.values(socialLinks.value).some((v) => !!v);

  const totalClicks =
    initialLinks?.reduce((sum, link: Link) => sum + (link.clicks || 0), 0) || 0;

  const activeLinks = (initialLinks?.filter((l: Link) => l.is_active) ||
    []) as QuickViewLink[];

  const editorContent = (
    <div class="space-y-6">
      <div class="grid grid-cols-3 gap-4">
        <div class="bg-white rounded-lg shadow p-4 text-center">
          <p class="text-sm text-gray-500">Page Views</p>
          <p class="text-2xl font-bold text-gray-900">
            {initialProfile?.page_views || 0}
          </p>
        </div>
        <div class="bg-white rounded-lg shadow p-4 text-center">
          <p class="text-sm text-gray-500">Total Clicks</p>
          <p class="text-2xl font-bold text-gray-900">
            {totalClicks}
          </p>
        </div>
        <div class="bg-white rounded-lg shadow p-4 text-center">
          <p class="text-sm text-gray-500">Active Links</p>
          <p class="text-2xl font-bold text-gray-900">
            {activeLinks.length}
          </p>
        </div>
      </div>

      {/* Error/Success Messages */}
      {error.value && (
        <div
          class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded"
          role="alert"
        >
          {error.value}
        </div>
      )}
      {success.value && (
        <div
          class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded"
          role="alert"
        >
          {success.value}
        </div>
      )}

      {/* Profile Settings */}
      <div class="bg-white rounded-lg shadow p-4 sm:p-6">
        <h2 class="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
          Profile Settings
        </h2>

        <div class="space-y-4">
          {/* Avatar Upload */}
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-3">
              Profile Photo
            </label>
            <div class="flex items-center gap-4">
              {/* Avatar Preview */}
              <div class="relative">
                {avatarUrl.value
                  ? (
                    <img
                      src={avatarUrl.value}
                      alt="Profile avatar"
                      class="w-20 h-20 rounded-full object-cover ring-2 ring-gray-200"
                    />
                  )
                  : (
                    <div class="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
                      <span class="text-2xl text-gray-500">
                        {(displayName.value || username.value || "?")
                          .charAt(0)
                          .toUpperCase()}
                      </span>
                    </div>
                  )}
                {uploadingAvatar.value && (
                  <div class="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                    <div class="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin">
                    </div>
                  </div>
                )}
              </div>

              {/* Upload Button */}
              <div class="flex-1">
                <label class="cursor-pointer">
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={uploadAvatar}
                    disabled={uploadingAvatar.value}
                    class="hidden"
                  />
                  <span class="inline-flex items-center justify-center  px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 active:bg-indigo-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation">
                    {uploadingAvatar.value ? "Uploading..." : "Upload Photo"}
                  </span>
                </label>
                <p class="text-xs text-gray-500 mt-2">
                  JPG, PNG or WebP. Max 2MB.
                </p>
              </div>
            </div>
          </div>

          {/* Username */}
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <div class="relative">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                @
              </span>
              <input
                type="text"
                value={username.value}
                onInput={(e) =>
                  username.value = (e.target as HTMLInputElement).value
                    .toLowerCase().replace(/[^a-z0-9_]/g, "")}
                placeholder="yourname"
                class={`w-full pl-8 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                  usernameAvailable.value === true
                    ? "border-green-500"
                    : usernameAvailable.value === false
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
              />
              {checkingUsername.value && (
                <span class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  ...
                </span>
              )}
              {!checkingUsername.value && usernameAvailable.value === true && (
                <span class="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
                  ✓
                </span>
              )}
              {!checkingUsername.value && usernameAvailable.value === false && (
                <span class="absolute right-3 top-1/2 -translate-y-1/2 text-red-500">
                  ✗
                </span>
              )}
            </div>
            {username.value && (
              <p class="text-xs text-gray-500 mt-1">
                Your page: <span class="font-mono">{publicUrl}</span>
              </p>
            )}
          </div>

          {/* Display Name */}
          <Input
            label="Display Name"
            type="text"
            value={displayName.value}
            onInput={(e) =>
              displayName.value = (e.target as HTMLInputElement).value}
            placeholder="John Doe"
            fullWidth
          />

          {/* Bio */}
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Bio
            </label>
            <Textarea
              value={bio.value}
              onInput={(e) =>
                bio.value = (e.target as HTMLTextAreaElement).value}
              placeholder="Tell visitors about yourself..."
              rows={3}
              fullWidth
            />
            <p class={`text-xs mt-1 ${bio.value.length > limits.maxBioLength ? "text-red-500" : "text-gray-500"}`}>
              {bio.value.length}/{limits.maxBioLength} characters
              {limits.maxBioLength < 500 && (
                <span class="ml-1 text-indigo-500">
                  (Upgrade for {500} chars)
                </span>
              )}
            </p>
          </div>

          {/* Social Links */}
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-3">
              Social Links
              {limits.maxSocialLinks !== -1 && (
                <span class="ml-2 text-xs font-normal text-gray-400">
                  ({Object.values(socialLinks.value).filter((v) => !!v).length}/{limits.maxSocialLinks})
                </span>
              )}
            </label>
            <div class="space-y-3">
              {SOCIAL_PLATFORMS.map((platform, _idx) => {
                const filledCount = Object.values(socialLinks.value).filter((v) => !!v).length;
                const currentValue = socialLinks.value[platform.key] || "";
                const isLocked = limits.maxSocialLinks !== -1 &&
                  !currentValue &&
                  filledCount >= limits.maxSocialLinks;

                return (
                  <div key={platform.key} class={`flex items-center gap-3 ${isLocked ? "opacity-50" : ""}`}>
                    <div class="w-8 flex items-center justify-center text-gray-600">
                      {platform.icon}
                    </div>
                    <div class="flex-1 relative">
                      {isLocked ? (
                        <div class="flex items-center gap-2 px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-400">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                          <span>Upgrade to Pro</span>
                        </div>
                      ) : (
                        <Input
                          type="text"
                          value={currentValue}
                          onInput={(e) => {
                            const newValue = (e.target as HTMLInputElement).value;
                            socialLinks.value = {
                              ...socialLinks.value,
                              [platform.key]: newValue,
                            };
                          }}
                          placeholder={`${platform.label} ${platform.placeholder}`}
                          fullWidth
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <p class="text-xs text-gray-500 mt-2">
              Enter your username or profile URL for each platform
            </p>
          </div>

          {/* Theme Selection */}
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Theme
            </label>
            <div class="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {THEMES.map((t) => {
                const isAllowed = limits.allowedThemes.includes(t.value);
                return (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => {
                      if (isAllowed) {
                        theme.value = t.value;
                      }
                    }}
                    disabled={!isAllowed}
                    class={`relative p-2 rounded-lg border-2 transition-all touch-manipulation ${
                      !isAllowed
                        ? "border-gray-200 opacity-50 cursor-not-allowed"
                        : theme.value === t.value
                        ? "border-indigo-500 ring-2 ring-indigo-200"
                        : "border-gray-200 hover:border-gray-300 active:border-gray-400"
                    }`}
                  >
                    <div class={`w-full h-8 rounded ${t.preview}`} />
                    <p class="text-xs text-center mt-1">{t.label}</p>
                    {!isAllowed && (
                      <div class="absolute inset-0 flex items-center justify-center">
                        <span class="bg-indigo-600 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-full">
                          PRO
                        </span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Publish Toggle */}
          <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p class="font-medium text-gray-900">Publish Profile</p>
              <p class="text-sm text-gray-500">
                Make your page visible to everyone
              </p>
            </div>
            <button
              type="button"
              onClick={() => isPublished.value = !isPublished.value}
              class={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors touch-manipulation ${
                isPublished.value ? "bg-indigo-600" : "bg-gray-300"
              }`}
            >
              <span
                class={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                  isPublished.value ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          <Button
            onClick={saveProfile}
            variant="primary"
            loading={loading.value}
            fullWidth
          >
            {loading.value ? "Saving..." : "Save Profile"}
          </Button>
        </div>
      </div>

      {/* Links Management */}
      <div class="bg-white rounded-lg shadow p-4 sm:p-6">
        <h2 class="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
          Your Links
        </h2>

        {/* Add New Link */}
        <div class="bg-gray-50 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-sm font-medium text-gray-700">Add New Link</h3>
            {limits.maxLinks !== -1 && (
              <span class={`text-xs font-medium px-2 py-0.5 rounded-full ${
                links.value.length >= limits.maxLinks
                  ? "bg-red-100 text-red-700"
                  : links.value.length >= limits.maxLinks - 1
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-gray-200 text-gray-600"
              }`}>
                {links.value.length}/{limits.maxLinks} links
              </span>
            )}
          </div>

          {/* Link limit reached banner */}
          {limits.maxLinks !== -1 && links.value.length >= limits.maxLinks && (
            <div class="mb-3 p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
              <p class="text-sm text-indigo-800 font-medium">
                You've reached the {limits.maxLinks}-link limit
              </p>
              <p class="text-xs text-indigo-600 mt-1">
                Upgrade to Pro for unlimited links.
              </p>
              <a
                href="/pricing"
                class="inline-block mt-2 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors touch-manipulation"
              >
                Upgrade to Pro - $3/mo
              </a>
            </div>
          )}

          <div class={`space-y-3 ${limits.maxLinks !== -1 && links.value.length >= limits.maxLinks ? "opacity-50 pointer-events-none" : ""}`}>
            <Input
              type="text"
              value={newLinkTitle.value}
              onInput={(e) =>
                newLinkTitle.value = (e.target as HTMLInputElement).value}
              placeholder="Link Title (e.g., My Website)"
              fullWidth
            />
            <Input
              type="url"
              value={newLinkUrl.value}
              onInput={(e) =>
                newLinkUrl.value = (e.target as HTMLInputElement).value}
              placeholder="https://example.com"
              fullWidth
            />
            <Button
              onClick={addLink}
              variant="secondary"
              loading={loading.value}
              disabled={limits.maxLinks !== -1 && links.value.length >= limits.maxLinks}
            >
              Add Link
            </Button>
          </div>
        </div>

        {/* Links List */}
        {links.value.length === 0
          ? (
            <p class="text-gray-500 text-center py-8">
              No links yet. Add your first link above!
            </p>
          )
          : (
            <div class="space-y-3">
              {links.value.map((link, index) => (
                <div
                  key={link.id}
                  class={`border rounded-lg p-3 sm:p-4 ${
                    link.is_active ? "bg-white" : "bg-gray-50 opacity-60"
                  }`}
                >
                  {editingLinkId.value === link.id
                    ? (
                      <div class="space-y-3">
                        <Input
                          type="text"
                          value={editLinkTitle.value}
                          onInput={(e) =>
                            editLinkTitle.value =
                              (e.target as HTMLInputElement).value}
                          placeholder="Link Title"
                          fullWidth
                        />
                        <Input
                          type="url"
                          value={editLinkUrl.value}
                          onInput={(e) =>
                            editLinkUrl.value =
                              (e.target as HTMLInputElement).value}
                          placeholder="https://example.com"
                          fullWidth
                        />
                        <div class="flex gap-2">
                          <Button
                            onClick={() => updateLink(link.id)}
                            variant="primary"
                            size="sm"
                          >
                            Save
                          </Button>
                          <Button
                            onClick={() => editingLinkId.value = null}
                            variant="secondary"
                            size="sm"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )
                    : (
                      <div class="flex items-center gap-3">
                        {/* Reorder buttons */}
                        <div class="flex flex-col gap-1">
                          <button
                            type="button"
                            onClick={() => moveLink(index, "up")}
                            disabled={index === 0}
                            class="flex items-center justify-center p-2 text-gray-400 hover:text-gray-600 active:text-gray-800 disabled:opacity-30 touch-manipulation"
                          >
                            ▲
                          </button>
                          <button
                            type="button"
                            onClick={() => moveLink(index, "down")}
                            disabled={index === links.value.length - 1}
                            class="flex items-center justify-center p-2 text-gray-400 hover:text-gray-600 active:text-gray-800 disabled:opacity-30 touch-manipulation"
                          >
                            ▼
                          </button>
                        </div>

                        {/* Link info */}
                        <div class="flex-1 min-w-0">
                          <p class="font-medium text-gray-900 truncate">
                            {link.title}
                          </p>
                          <p class="text-sm text-gray-500 truncate">
                            {link.url}
                          </p>
                          <p class="text-xs text-gray-400">
                            {link.clicks} clicks
                          </p>
                        </div>

                        {/* Actions */}
                        <div class="flex items-center gap-1 sm:gap-2">
                          <button
                            type="button"
                            onClick={() => toggleLinkActive(link)}
                            class={`  flex items-center justify-center p-2 rounded touch-manipulation ${
                              link.is_active
                                ? "text-green-600"
                                : "text-gray-400"
                            } active:scale-95`}
                            title={link.is_active ? "Active" : "Inactive"}
                          >
                            {link.is_active ? "●" : "○"}
                          </button>
                          <button
                            type="button"
                            onClick={() => startEditing(link)}
                            class="  flex items-center justify-center p-2 text-gray-400 hover:text-gray-600 active:text-gray-800 touch-manipulation"
                            title="Edit"
                          >
                            ✎
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteLink(link.id)}
                            class="  flex items-center justify-center p-2 text-gray-400 hover:text-red-600 active:text-red-800 touch-manipulation"
                            title="Delete"
                          >
                            🗑
                          </button>
                        </div>
                      </div>
                    )}
                </div>
              ))}
            </div>
          )}
      </div>

      {/* Preview Link */}
      {hasProfile.value && isPublished.value && username.value && (
        <div class="bg-indigo-50 rounded-lg p-4 text-center">
          <p class="text-indigo-700 mb-2">Your public page is live!</p>
          <a
            href={`/@${username.value}`}
            target="_blank"
            rel="noopener noreferrer"
            class="text-indigo-600 hover:text-indigo-800 font-medium underline"
          >
            {publicUrl}
          </a>
        </div>
      )}
    </div>
  );

  if (!showQuickView) return editorContent;

  return (
    <div class="flex flex-col lg:flex-row gap-6">
      {/* Left column: Editor */}
      <div class="flex-1 min-w-0">
        {editorContent}
      </div>

      {/* Right column: Quick View phone mockup */}
      <div class="hidden lg:block lg:w-80 xl:w-96">
        <div class="bg-white rounded-lg shadow p-6 sticky top-8">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold text-gray-900">Quick View</h2>
          </div>

          {/* Phone frame */}
          <div class="mx-auto w-64">
            <div class="relative rounded-[2.5rem] border-[6px] border-gray-800 bg-gray-800 shadow-xl">
              {/* Notch */}
              <div class="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-5 bg-gray-800 rounded-b-2xl z-10">
              </div>

              {/* Screen */}
              <div
                class={`rounded-[2rem] overflow-hidden ${previewStyles.bg}`}
                style="height: 480px;"
              >
                <div class="overflow-y-auto h-full pt-8 pb-4 px-4">
                  <div class="text-center">
                    {/* Avatar */}
                    {avatarUrl.value
                      ? (
                        <img
                          src={avatarUrl.value}
                          alt={displayName.value || username.value}
                          class="w-16 h-16 rounded-full mx-auto mb-2 object-cover ring-2 ring-white/50"
                        />
                      )
                      : (
                        <div
                          class={`w-16 h-16 rounded-full mx-auto mb-2 flex items-center justify-center ${
                            isDarkTheme ? "bg-white/20" : "bg-gray-200"
                          }`}
                        >
                          <span
                            class={`text-xl font-bold ${previewStyles.text}`}
                          >
                            {(displayName.value || username.value || "?")
                              .charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}

                    {/* Name and username */}
                    <h3 class={`text-sm font-bold ${previewStyles.text}`}>
                      {displayName.value ||
                        (username.value ? `@${username.value}` : "Your Name")}
                    </h3>
                    {username.value && (
                      <p
                        class={`text-xs ${previewStyles.text} opacity-70 mb-1`}
                      >
                        @{username.value}
                      </p>
                    )}

                    {/* Bio */}
                    {bio.value && (
                      <p
                        class={`text-xs ${previewStyles.text} opacity-80 mb-3 line-clamp-2`}
                      >
                        {bio.value}
                      </p>
                    )}

                    {/* Social icons */}
                    {hasSocialLinks && (
                      <div class="flex justify-center gap-2 mb-3">
                        {Object.entries(socialLinks.value).map(
                          ([platform, value]) => {
                            if (!value) return null;
                            const icon = PREVIEW_SOCIAL_ICONS[platform];
                            if (!icon) return null;
                            return (
                              <span
                                key={platform}
                                class={`${previewStyles.text} opacity-70`}
                              >
                                {icon}
                              </span>
                            );
                          },
                        )}
                      </div>
                    )}

                    {/* Links */}
                    <div class="space-y-2 mt-2">
                      {activePreviewLinks.slice(0, 6).map((link) => (
                        <div
                          key={link.id}
                          class={`py-2.5 px-3 rounded-lg text-xs font-medium text-center ${previewStyles.link}`}
                        >
                          {link.icon && <span class="mr-1">{link.icon}</span>}
                          {link.title}
                        </div>
                      ))}
                      {activePreviewLinks.length > 6 && (
                        <p
                          class={`text-xs ${previewStyles.text} opacity-50 pt-1`}
                        >
                          +{activePreviewLinks.length - 6} more links
                        </p>
                      )}
                      {activePreviewLinks.length === 0 && (
                        <p
                          class={`text-xs ${previewStyles.text} opacity-50 py-8`}
                        >
                          No links yet
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Home indicator */}
              <div class="absolute bottom-1 left-1/2 -translate-x-1/2 w-20 h-1 bg-gray-400 rounded-full">
              </div>
            </div>
          </div>

          {/* URL below phone */}
          <div class="mt-4 space-y-2">
            {username.value && (
              <a
                href={`/@${username.value}`}
                target="_blank"
                rel="noopener noreferrer"
                class="flex items-center gap-2 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors touch-manipulation"
              >
                <span class="text-xs text-gray-500 truncate flex-1">
                  getlnk.xyz/@{username.value}
                </span>
                <span class="text-xs text-indigo-600 font-medium whitespace-nowrap">
                  Visit
                </span>
              </a>
            )}
            {!isPublished.value && hasProfile.value && (
              <p class="text-xs text-yellow-600 text-center">
                Your page is not published yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
