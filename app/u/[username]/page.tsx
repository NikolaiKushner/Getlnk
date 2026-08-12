import type { Metadata } from "next";
import Link from "next/link";
import { and, asc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { links, pageAnalytics, publicProfiles, type ProfileTheme } from "@/db/schema";

const themeStyles: Record<
  ProfileTheme,
  { bg: string; text: string; link: string }
> = {
  default: {
    bg: "bg-gray-100",
    text: "text-gray-900",
    link: "bg-white hover:bg-gray-50 text-gray-900 border border-gray-200",
  },
  dark: {
    bg: "bg-gray-900",
    text: "text-white",
    link: "bg-gray-800 hover:bg-gray-700 text-white border border-gray-700",
  },
  gradient: {
    bg: "bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400",
    text: "text-white",
    link: "bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur",
  },
  minimal: {
    bg: "bg-white",
    text: "text-gray-900",
    link: "bg-gray-100 hover:bg-gray-200 text-gray-900",
  },
  ocean: {
    bg: "bg-gradient-to-br from-cyan-500 via-blue-500 to-indigo-600",
    text: "text-white",
    link: "bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur",
  },
};

function socialUrl(platform: string, value: string) {
  if (value.startsWith("http")) return value;
  switch (platform) {
    case "instagram":
      return `https://instagram.com/${value}`;
    case "x":
    case "twitter":
      return `https://x.com/${value}`;
    case "youtube":
      return `https://youtube.com/${value}`;
    case "tiktok":
      return `https://tiktok.com/@${value}`;
    case "linkedin":
      return `https://linkedin.com/in/${value}`;
    case "github":
      return `https://github.com/${value}`;
    default:
      return value;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  const profile = await db.query.publicProfiles.findFirst({
    where: and(
      eq(publicProfiles.username, username),
      eq(publicProfiles.isPublished, true),
    ),
  });
  if (!profile) return { title: "Profile Not Found" };
  return {
    title: `${profile.displayName || profile.username} | Getlnk`,
    description: profile.bio || `Links from @${profile.username}`,
    openGraph: {
      title: profile.displayName || profile.username,
      description: profile.bio || undefined,
      url: `https://getlnk.xyz/@${profile.username}`,
      ...(profile.avatarUrl ? { images: [{ url: profile.avatarUrl }] } : {}),
    },
  };
}

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const profile = await db.query.publicProfiles.findFirst({
    where: and(
      eq(publicProfiles.username, username),
      eq(publicProfiles.isPublished, true),
    ),
  });

  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900">404</h1>
          <p className="mt-4 text-gray-600">
            This profile doesn&apos;t exist or is not public.
          </p>
          <Link href="/" className="mt-6 inline-block text-indigo-600 hover:text-indigo-700">
            Go home
          </Link>
        </div>
      </div>
    );
  }

  await db
    .update(publicProfiles)
    .set({ pageViews: sql`${publicProfiles.pageViews} + 1` })
    .where(eq(publicProfiles.id, profile.id));

  await db.insert(pageAnalytics).values({
    profileId: profile.id,
    eventType: "page_view",
  });

  const activeLinks = await db.query.links.findMany({
    where: and(eq(links.userId, profile.userId), eq(links.isActive, true)),
    orderBy: [asc(links.position)],
  });

  const theme = (profile.theme as ProfileTheme) in themeStyles
    ? (profile.theme as ProfileTheme)
    : "default";
  const styles = themeStyles[theme];
  const social = (profile.socialLinks ?? {}) as Record<string, string>;

  return (
    <div className={`min-h-screen ${styles.bg} ${styles.text} px-4 py-12`}>
      <div className="mx-auto max-w-md">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-white/20 text-2xl font-bold">
            {profile.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.avatarUrl}
                alt={profile.displayName || profile.username}
                className="h-full w-full object-cover"
              />
            ) : (
              (profile.displayName || profile.username).slice(0, 1).toUpperCase()
            )}
          </div>
          <h1 className="text-2xl font-bold">
            {profile.displayName || profile.username}
          </h1>
          {profile.bio && <p className="mt-2 opacity-90">{profile.bio}</p>}
          <div className="mt-4 flex justify-center gap-3">
            {Object.entries(social)
              .filter(([, v]) => v)
              .map(([platform, value]) => (
                <a
                  key={platform}
                  href={socialUrl(platform, value)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm underline opacity-90 hover:opacity-100"
                >
                  {platform}
                </a>
              ))}
          </div>
        </div>

        <div className="mt-8 space-y-3">
          {activeLinks.map((link) => (
            <a
              key={link.id}
              href={`/api/links/redirect/${link.id}`}
              className={`block rounded-xl px-4 py-3 text-center font-medium transition ${styles.link}`}
            >
              {link.title}
            </a>
          ))}
        </div>

        <p className="mt-10 text-center text-xs opacity-70">
          <Link href="/">Made with Getlnk</Link>
        </p>
      </div>
    </div>
  );
}
