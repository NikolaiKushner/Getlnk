"use client";

import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";

export function HeaderAuth() {
  return (
    <div className="flex gap-2 sm:gap-3 items-center">
      <Show when="signed-out">
        <SignInButton mode="redirect" forceRedirectUrl="/dashboard">
          <button className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:text-gray-900 touch-manipulation">
            Log in
          </button>
        </SignInButton>
        <SignUpButton mode="redirect" forceRedirectUrl="/onboarding">
          <button className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 touch-manipulation">
            Sign up free
          </button>
        </SignUpButton>
      </Show>
      <Show when="signed-in">
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-indigo-600 transition-colors hover:text-indigo-700"
        >
          Dashboard
        </Link>
        <UserButton />
      </Show>
    </div>
  );
}
