"use client";

import { useMemo, useState } from "react";
import { Button, Input, Label, Textarea } from "@/components/ui";
import type { Link, ProfileTheme, PublicProfile } from "@/db/schema";

const THEMES: { value: ProfileTheme; label: string; preview: string }[] = [
  { value: "default", label: "Default", preview: "bg-white border" },
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

const SOCIAL_KEYS = [
  "instagram",
  "x",
  "youtube",
  "tiktok",
  "linkedin",
  "github",
] as const;

type Props = {
  initialProfile: PublicProfile;
  initialLinks: Link[];
};

export function LinksEditor({ initialProfile, initialLinks }: Props) {
  const [profile, setProfile] = useState(initialProfile);
  const [items, setItems] = useState(initialLinks);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const socialLinks = useMemo(
    () => (profile.socialLinks ?? {}) as Record<string, string>,
    [profile.socialLinks],
  );

  async function onAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    setMessage(null);
    try {
      const formData = new FormData();
      formData.append("avatar", file);
      const res = await fetch("/api/profile/upload-avatar", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (!res.ok) {
        setMessage(json.error || "Failed to upload avatar");
        return;
      }
      setProfile((p) => ({ ...p, avatarUrl: json.data.avatarUrl }));
      setMessage("Avatar updated");
    } catch {
      setMessage("Failed to upload avatar");
    } finally {
      setUploadingAvatar(false);
      e.target.value = "";
    }
  }

  async function saveProfile(patch: Partial<PublicProfile> & { socialLinks?: Record<string, string> }) {
    setSaving(true);
    setMessage(null);
    const res = await fetch("/api/public-profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: patch.username ?? profile.username,
        displayName: patch.displayName ?? profile.displayName,
        bio: patch.bio ?? profile.bio,
        theme: patch.theme ?? profile.theme,
        isPublished: patch.isPublished ?? profile.isPublished,
        socialLinks: patch.socialLinks ?? socialLinks,
      }),
    });
    const json = await res.json();
    setSaving(false);
    if (!res.ok) {
      setMessage(json.error || "Failed to save profile");
      return;
    }
    setProfile(json.data);
    setMessage("Profile saved");
  }

  async function addLink(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, url }),
    });
    const json = await res.json();
    if (!res.ok) {
      setMessage(json.error || "Failed to add link");
      return;
    }
    setItems((prev) => [...prev, json.data]);
    setTitle("");
    setUrl("");
    setMessage("Link added");
  }

  async function removeLink(id: string) {
    const res = await fetch(`/api/links?id=${id}`, { method: "DELETE" });
    if (!res.ok) {
      setMessage("Failed to delete link");
      return;
    }
    setItems((prev) => prev.filter((l) => l.id !== id));
  }

  async function toggleLink(link: Link) {
    const res = await fetch("/api/links", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: link.id, isActive: !link.isActive }),
    });
    const json = await res.json();
    if (!res.ok) return;
    setItems((prev) => prev.map((l) => (l.id === link.id ? json.data : l)));
  }

  async function moveLink(index: number, dir: -1 | 1) {
    const next = [...items];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setItems(next);
    await fetch("/api/links/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: next.map((l) => l.id) }),
    });
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="space-y-6">
        <section className="rounded-2xl border border-gray-200 bg-white p-5">
          <h2 className="text-lg font-semibold text-gray-900">Profile</h2>
          <div className="mt-4 space-y-3">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-indigo-100 text-xl font-bold text-indigo-700">
                {profile.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profile.avatarUrl}
                    alt="Avatar"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  (profile.displayName || profile.username).slice(0, 1).toUpperCase()
                )}
              </div>
              <div>
                <Label htmlFor="avatar">Profile photo</Label>
                <Input
                  id="avatar"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={onAvatarChange}
                  disabled={uploadingAvatar}
                />
                <p className="mt-1 text-xs text-gray-500">
                  JPEG, PNG or WebP. Max 2MB.
                  {uploadingAvatar ? " Uploading…" : ""}
                </p>
              </div>
            </div>
            <div>
              <Label>Username</Label>
              <p className="text-sm text-gray-600">getlnk.xyz/@{profile.username}</p>
            </div>
            <div>
              <Label htmlFor="displayName">Display name</Label>
              <Input
                id="displayName"
                value={profile.displayName ?? ""}
                onChange={(e) =>
                  setProfile((p) => ({ ...p, displayName: e.target.value }))
                }
              />
            </div>
            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                rows={3}
                value={profile.bio ?? ""}
                onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))}
              />
            </div>
            <div>
              <Label>Theme</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {THEMES.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setProfile((p) => ({ ...p, theme: t.value }))}
                    className={`h-10 w-10 rounded-full ${t.preview} ${
                      profile.theme === t.value ? "ring-2 ring-indigo-600 ring-offset-2" : ""
                    }`}
                    title={t.label}
                  />
                ))}
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={profile.isPublished}
                onChange={(e) =>
                  setProfile((p) => ({ ...p, isPublished: e.target.checked }))
                }
              />
              Published
            </label>
            <div className="grid gap-2 sm:grid-cols-2">
              {SOCIAL_KEYS.map((key) => (
                <div key={key}>
                  <Label>{key}</Label>
                  <Input
                    value={socialLinks[key] ?? ""}
                    onChange={(e) =>
                      setProfile((p) => ({
                        ...p,
                        socialLinks: { ...socialLinks, [key]: e.target.value },
                      }))
                    }
                    placeholder="username or URL"
                  />
                </div>
              ))}
            </div>
            <Button disabled={saving} onClick={() => saveProfile({})}>
              {saving ? "Saving…" : "Save profile"}
            </Button>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-5">
          <h2 className="text-lg font-semibold text-gray-900">Links</h2>
          <form onSubmit={addLink} className="mt-4 space-y-3">
            <Input
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <Input
              placeholder="https://…"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
            />
            <Button type="submit">Add link</Button>
          </form>
          <ul className="mt-4 space-y-2">
            {items.map((link, index) => (
              <li
                key={link.id}
                className="flex items-center justify-between gap-2 rounded-xl border border-gray-100 px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-gray-900">{link.title}</p>
                  <p className="truncate text-xs text-gray-500">{link.url}</p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button type="button" size="sm" variant="ghost" onClick={() => moveLink(index, -1)}>
                    ↑
                  </Button>
                  <Button type="button" size="sm" variant="ghost" onClick={() => moveLink(index, 1)}>
                    ↓
                  </Button>
                  <Button type="button" size="sm" variant="secondary" onClick={() => toggleLink(link)}>
                    {link.isActive ? "On" : "Off"}
                  </Button>
                  <Button type="button" size="sm" variant="danger" onClick={() => removeLink(link.id)}>
                    Del
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </section>
        {message && <p className="text-sm text-indigo-700">{message}</p>}
      </div>

      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Preview</h2>
          <a
            href={`/@${profile.username}`}
            target="_blank"
            rel="noreferrer"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
          >
            Open live page
          </a>
        </div>
        <div className="mx-auto max-w-sm rounded-3xl bg-white p-6 shadow-sm">
          <div className="text-center">
            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-indigo-100 text-xl font-bold text-indigo-700">
              {profile.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.avatarUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                (profile.displayName || profile.username).slice(0, 1).toUpperCase()
              )}
            </div>
            <h3 className="text-xl font-bold text-gray-900">
              {profile.displayName || profile.username}
            </h3>
            {profile.bio && <p className="mt-2 text-sm text-gray-600">{profile.bio}</p>}
          </div>
          <div className="mt-6 space-y-2">
            {items.filter((l) => l.isActive).map((link) => (
              <div
                key={link.id}
                className="rounded-xl border border-gray-200 px-4 py-3 text-center text-sm font-medium text-gray-900"
              >
                {link.title}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
