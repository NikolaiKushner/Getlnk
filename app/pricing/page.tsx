import Link from "next/link";
import Footer from "@/components/Footer";

export default function PricingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="border-b border-gray-100 px-4 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link href="/" className="font-bold text-gray-900">
            Getlnk
          </Link>
          <Link href="/sign-in" className="text-sm font-medium text-indigo-600">
            Sign in
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-3xl flex-1 px-4 py-16 text-center">
        <h1 className="text-4xl font-bold text-gray-900">Pricing</h1>
        <p className="mt-3 text-gray-600">Free forever for the core product.</p>
        <div className="mx-auto mt-10 max-w-md rounded-2xl border border-gray-100 p-8 shadow-lg">
          <p className="text-sm font-semibold uppercase text-gray-500">Free</p>
          <p className="mt-2 text-4xl font-bold">$0</p>
          <ul className="mt-6 space-y-2 text-left text-sm text-gray-700">
            <li>Public profile</li>
            <li>Unlimited links</li>
            <li>Themes + social links</li>
            <li>Analytics</li>
          </ul>
          <Link
            href="/sign-in"
            className="mt-8 block rounded-xl bg-indigo-600 py-3 font-semibold text-white hover:bg-indigo-700"
          >
            Get started
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
