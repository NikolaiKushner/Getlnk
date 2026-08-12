import Link from "next/link";
import { auth, signIn, signOut } from "@/auth";

export async function HeaderAuth() {
  const session = await auth();

  if (session?.user) {
    return (
      <div className="flex items-center gap-2 sm:gap-3">
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-indigo-600 transition-colors hover:text-indigo-700"
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
            className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
          >
            Sign out
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex gap-2 sm:gap-3 items-center">
      <form
        action={async () => {
          "use server";
          await signIn("google", { redirectTo: "/dashboard" });
        }}
      >
        <button
          type="submit"
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:text-gray-900 touch-manipulation"
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
          className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 touch-manipulation"
        >
          Sign up free
        </button>
      </form>
    </div>
  );
}
