import Link from "next/link";
import { auth, signIn, signOut } from "@/auth";

export async function HeaderAuth({ tone = "light" }: { tone?: "light" | "ink" }) {
  const session = await auth();
  const muted =
    tone === "ink"
      ? "text-white/80 hover:text-white"
      : "text-[var(--ink)]/70 hover:text-[var(--ink)]";
  const ghostBtn =
    tone === "ink"
      ? "bg-white/10 text-white hover:bg-white/15"
      : "bg-[var(--ink)]/5 text-[var(--ink)] hover:bg-[var(--ink)]/10";
  const primaryBtn =
    "bg-[var(--sea)] text-white hover:bg-[var(--sea-deep)]";

  if (session?.user) {
    return (
      <div className="flex items-center gap-2 sm:gap-3">
        <Link
          href="/dashboard"
          className={`inline-flex items-center justify-center px-3 py-2 text-sm font-medium transition-colors ${muted}`}
        >
          Dashboard
        </Link>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}
        >
          <button
            type="submit"
            className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${ghostBtn}`}
          >
            Sign out
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <form
        action={async () => {
          "use server";
          await signIn("google", { redirectTo: "/dashboard" });
        }}
      >
        <button
          type="submit"
          className={`inline-flex items-center justify-center px-3 py-2 text-sm font-medium transition-colors touch-manipulation ${muted}`}
        >
          Log in
        </button>
      </form>
      <form
        action={async () => {
          "use server";
          await signIn("google", { redirectTo: "/onboarding" });
        }}
      >
        <button
          type="submit"
          className={`inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition-colors touch-manipulation ${primaryBtn}`}
        >
          Get your link
        </button>
      </form>
    </div>
  );
}
