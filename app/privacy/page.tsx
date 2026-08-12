import Link from "next/link";
import Footer from "@/components/Footer";

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <main className="mx-auto max-w-3xl flex-1 px-4 py-16 prose prose-gray">
        <Link href="/" className="text-sm text-indigo-600">
          ← Home
        </Link>
        <h1 className="mt-4 text-3xl font-bold text-gray-900">Privacy Policy</h1>
        <p className="mt-4 text-gray-600">
          Last updated: August 2026. Getlnk stores account data via Auth.js
          (Google sign-in) and profile/link data in Neon Postgres hosted on
          Vercel. Avatars are stored in Cloudflare R2. We do not sell personal
          data. Contact info@getlnk.xyz for privacy requests.
        </p>
      </main>
      <Footer />
    </div>
  );
}
