import Link from "next/link";
import Footer from "@/components/Footer";

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <main className="mx-auto max-w-3xl flex-1 px-4 py-16">
        <Link href="/" className="text-sm text-indigo-600">
          ← Home
        </Link>
        <h1 className="mt-4 text-3xl font-bold text-gray-900">Terms of Service</h1>
        <p className="mt-4 text-gray-600">
          Last updated: August 2026. By using Getlnk you agree not to abuse the
          service, infringe others&apos; rights, or attempt unauthorized access.
          The service is provided as-is. Contact info@getlnk.xyz with questions.
        </p>
      </main>
      <Footer />
    </div>
  );
}
