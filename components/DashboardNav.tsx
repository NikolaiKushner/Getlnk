import Link from "next/link";
import { signOut } from "@/auth";

const items = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/analytics", label: "Analytics" },
  { href: "/settings", label: "Settings" },
];

export function DashboardNav({
  active,
  isAdmin,
}: {
  active?: string;
  isAdmin?: boolean;
}) {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.svg" width={28} height={28} alt="" />
            <span className="font-display text-lg font-extrabold tracking-tight text-gray-900">
              Getlnk
            </span>
          </Link>
          <nav className="hidden items-center gap-4 text-sm font-medium text-gray-600 sm:flex">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={
                  active === item.href
                    ? "text-indigo-600"
                    : "hover:text-gray-900"
                }
              >
                {item.label}
              </Link>
            ))}
            {isAdmin && (
              <Link
                href="/admin"
                className={
                  active === "/admin" ? "text-indigo-600" : "hover:text-gray-900"
                }
              >
                Admin
              </Link>
            )}
          </nav>
        </div>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}
        >
          <button
            type="submit"
            className="rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200"
          >
            Sign out
          </button>
        </form>
      </div>
    </header>
  );
}
