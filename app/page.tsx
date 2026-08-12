import Link from "next/link";
import Footer from "@/components/Footer";
import { HeaderAuth } from "@/components/HeaderAuth";

function FeatureIcon({ d }: { d: string }) {
  return (
    <svg
      className="h-6 w-6 text-indigo-600"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-100 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.svg" width={36} height={36} alt="Getlnk logo" />
            <span className="text-lg font-bold text-gray-900">Getlnk</span>
          </div>
          <nav className="hidden items-center gap-8 text-sm font-medium text-gray-600 md:flex">
            <a href="#features" className="hover:text-gray-900">Features</a>
            <a href="#how-it-works" className="hover:text-gray-900">How it works</a>
            <a href="#pricing" className="hover:text-gray-900">Pricing</a>
          </nav>
          <HeaderAuth />
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              One link. Every you.
            </h1>
            <p className="mt-6 text-lg text-gray-600">
              Getlnk gives creators, freelancers, and businesses a professional
              branded page for all their important links. Set up in minutes.
              Track what converts. Open source.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/sign-in"
                className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                Create your page
              </Link>
              <a
                href="#how-it-works"
                className="rounded-xl bg-gray-100 px-6 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-200"
              >
                See how it works
              </a>
            </div>
          </div>
        </section>

        <section id="features" className="bg-gray-50 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-center text-3xl font-bold text-gray-900">
              Everything you need in one link
            </h2>
            <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  title: "Unlimited links",
                  body: "Add, reorder, and publish the links that matter.",
                  d: "M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m9.86-2.54a4.5 4.5 0 0 0-1.242-7.244l-4.5-4.5a4.5 4.5 0 0 0-6.364 6.364L4.34 8.374",
                },
                {
                  title: "Built-in analytics",
                  body: "Track page views and clicks so you know what works.",
                  d: "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z",
                },
                {
                  title: "Beautiful themes",
                  body: "Pick a theme that matches your brand in seconds.",
                  d: "M4.098 19.902a3.75 3.75 0 0 0 5.304 0l6.401-6.402M6.75 21A3.75 3.75 0 0 1 3 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 0 0 3.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008Z",
                },
              ].map((f) => (
                <div key={f.title} className="rounded-2xl bg-white p-6 shadow-sm">
                  <FeatureIcon d={f.d} />
                  <h3 className="mt-4 text-lg font-semibold text-gray-900">{f.title}</h3>
                  <p className="mt-2 text-sm text-gray-600">{f.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="py-20">
          <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900">Go live in three steps</h2>
            <div className="mt-12 grid gap-8 md:grid-cols-3">
              {[
                ["1", "Create your account", "Sign up and claim your username."],
                ["2", "Add links and customize", "Pick a theme and publish."],
                ["3", "Share and track", "Put your Getlnk URL everywhere."],
              ].map(([n, t, b]) => (
                <div key={n}>
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">
                    {n}
                  </div>
                  <h3 className="mt-4 font-semibold text-gray-900">{t}</h3>
                  <p className="mt-2 text-sm text-gray-600">{b}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="pricing" className="bg-gray-50 py-20">
          <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900">Simple pricing</h2>
            <p className="mt-3 text-gray-600">Start free. Upgrade when you grow.</p>
            <div className="mx-auto mt-10 max-w-md rounded-2xl border border-gray-100 bg-white p-8 shadow-lg">
              <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">Free</p>
              <p className="mt-2 text-4xl font-bold text-gray-900">$0</p>
              <ul className="mt-6 space-y-2 text-left text-sm text-gray-700">
                <li>Public profile page</li>
                <li>Unlimited links</li>
                <li>5 themes</li>
                <li>Basic analytics</li>
              </ul>
              <Link
                href="/sign-in"
                className="mt-8 block rounded-xl bg-indigo-600 py-3 font-semibold text-white hover:bg-indigo-700"
              >
                Get started
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
