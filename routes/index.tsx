import { define } from "../utils.ts";
import { Head } from "fresh/runtime";

function PhoneMockup() {
  return (
    <div class="relative mx-auto w-[280px] sm:w-[300px]">
      {/* Phone frame */}
      <div class="rounded-[2.5rem] border-[8px] border-gray-900 bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 shadow-2xl overflow-hidden">
        {/* Screen */}
        <div class="px-5 pt-10 pb-8 min-h-[460px] flex flex-col items-center text-white">
          {/* Notch */}
          <div class="absolute top-4 left-1/2 -translate-x-1/2 w-20 h-5 bg-gray-900 rounded-full" />

          {/* Avatar */}
          <div class="mt-4 w-16 h-16 rounded-full bg-white/30 backdrop-blur flex items-center justify-center text-2xl font-bold ring-2 ring-white/50">
            JD
          </div>

          {/* Name & bio */}
          <p class="mt-3 text-base font-bold">Jane Doe</p>
          <p class="text-xs opacity-80">@janedoe</p>
          <p class="mt-1 text-xs opacity-70 text-center px-2">
            Designer & creator sharing cool stuff
          </p>

          {/* Social icons row */}
          <div class="flex gap-3 mt-3">
            {["IG", "X", "YT", "GH"].map((s) => (
              <div
                key={s}
                class="w-7 h-7 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-[10px] font-semibold"
              >
                {s}
              </div>
            ))}
          </div>

          {/* Links */}
          <div class="w-full mt-5 space-y-2.5">
            {[
              { icon: "🎨", title: "My Portfolio" },
              { icon: "📰", title: "Latest Blog Post" },
              { icon: "🛒", title: "Shop Merch" },
              { icon: "📬", title: "Newsletter" },
            ].map((link) => (
              <div
                key={link.title}
                class="w-full py-2.5 px-4 rounded-xl bg-white/20 backdrop-blur text-center text-sm font-medium flex items-center gap-2 justify-center"
              >
                <span>{link.icon}</span>
                <span>{link.title}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function PricingCard(
  { tier, price, period, features, cta, highlight, badge }: {
    tier: string;
    price: string;
    period?: string;
    features: string[];
    cta: string;
    highlight?: boolean;
    badge?: string;
  },
) {
  return (
    <div
      class={`relative rounded-2xl p-6 sm:p-8 flex flex-col ${
        highlight
          ? "bg-indigo-600 text-white shadow-xl ring-2 ring-indigo-600 scale-[1.02]"
          : "bg-white text-gray-900 shadow-lg"
      }`}
    >
      {badge && (
        <span
          class={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-semibold ${
            highlight
              ? "bg-yellow-400 text-gray-900"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          {badge}
        </span>
      )}
      <p
        class={`text-sm font-semibold uppercase tracking-wide ${
          highlight ? "text-indigo-200" : "text-gray-500"
        }`}
      >
        {tier}
      </p>
      <p class="mt-2 flex items-baseline gap-1">
        <span class="text-4xl font-bold">{price}</span>
        {period && (
          <span
            class={`text-sm ${highlight ? "text-indigo-200" : "text-gray-500"}`}
          >
            {period}
          </span>
        )}
      </p>
      <ul class="mt-6 space-y-3 flex-1">
        {features.map((f) => (
          <li key={f} class="flex gap-2 text-sm">
            <span class={highlight ? "text-indigo-200" : "text-indigo-600"}>
              ✓
            </span>
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <a
        href="/pricing"
        class={`mt-8 block text-center py-3 px-6 rounded-xl font-semibold transition-colors touch-manipulation ${
          highlight
            ? "bg-white text-indigo-600 hover:bg-indigo-50"
            : "bg-indigo-600 text-white hover:bg-indigo-700"
        }`}
      >
        {cta}
      </a>
    </div>
  );
}

export default define.page(function Home(ctx) {
  const isAuthenticated = !!ctx.state.authUser;

  return (
    <>
      <Head>
        <title>Getlnk — One link. Every you.</title>
        <meta
          name="description"
          content="Create a beautiful, shareable landing page with all your links. The open-source link-in-bio for creators, freelancers, and businesses."
        />
      </Head>
      <div class="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* Header */}
        <header class="bg-white/80 backdrop-blur-sm shadow-sm">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div class="flex justify-between items-center">
              <div class="flex items-center gap-2">
                <img src="/logo.svg" width="40" height="40" alt="Getlnk logo" />
                <span class="text-lg sm:text-xl font-bold text-gray-900">
                  Getlnk
                </span>
              </div>
              <div class="flex gap-2 sm:gap-3">
                {isAuthenticated
                  ? (
                    <>
                      <a
                        href="/dashboard"
                        class="inline-flex items-center justify-center px-4 py-2 text-indigo-600 hover:text-indigo-700 font-medium touch-manipulation"
                      >
                        Dashboard
                      </a>
                      <form
                        action="/api/auth/logout"
                        method="POST"
                        class="inline"
                      >
                        <button
                          type="submit"
                          class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 active:bg-gray-400 transition-colors touch-manipulation"
                        >
                          Logout
                        </button>
                      </form>
                    </>
                  )
                  : (
                    <>
                      <a
                        href="/login"
                        class="inline-flex items-center justify-center px-4 py-2 text-indigo-600 hover:text-indigo-700 font-medium touch-manipulation"
                      >
                        Login
                      </a>
                      <a
                        href="/register"
                        class="inline-flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 active:bg-indigo-800 transition-colors touch-manipulation"
                      >
                        Sign Up
                      </a>
                    </>
                  )}
              </div>
            </div>
          </div>
        </header>

        <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero */}
          <section class="py-12 sm:py-16 md:py-24 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div class="text-center lg:text-left">
              <h1 class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Turn your audience into{" "}
                <span class="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                  clicks, customers, and revenue.
                </span>
              </h1>
              <p class="mt-4 sm:mt-6 text-lg sm:text-xl text-gray-600 max-w-xl mx-auto lg:mx-0">
                One branded page for all your links. Track what works, promote
                what matters, and own your data. Open source and free to start.
              </p>
              <div class="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
                {isAuthenticated
                  ? (
                    <a
                      href="/dashboard"
                      class="inline-flex items-center justify-center px-8 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 active:bg-indigo-800 transition-colors font-semibold text-lg touch-manipulation"
                    >
                      Go to Dashboard
                    </a>
                  )
                  : (
                    <>
                      <a
                        href="/register"
                        class="inline-flex items-center justify-center px-8 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 active:bg-indigo-800 transition-colors font-semibold text-lg touch-manipulation"
                      >
                        Start for free
                      </a>
                      <a
                        href="/login"
                        class="inline-flex items-center justify-center px-8 py-3 bg-white text-indigo-600 border-2 border-indigo-200 rounded-xl hover:bg-indigo-50 active:bg-indigo-100 transition-colors font-semibold text-lg touch-manipulation"
                      >
                        Sign in
                      </a>
                    </>
                  )}
              </div>
              <p class="mt-4 text-sm text-gray-500">
                No credit card required. Set up in under 5 minutes.
              </p>
            </div>
            <div class="hidden lg:flex justify-center">
              <PhoneMockup />
            </div>
          </section>

          {/* Trust bar */}
          <section class="py-8 sm:py-10 border-y border-gray-200/60">
            <div class="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {[
                { icon: "🎨", label: "5 beautiful themes" },
                { icon: "📊", label: "Built-in analytics" },
                { icon: "🔓", label: "100% open source" },
                { icon: "💸", label: "Free forever tier" },
              ].map((item) => (
                <div key={item.label} class="flex flex-col items-center gap-1">
                  <span class="text-2xl">{item.icon}</span>
                  <span class="text-sm sm:text-base font-medium text-gray-700">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* How it works */}
          <section class="py-12 sm:py-16 md:py-24">
            <h2 class="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-10 sm:mb-14">
              Live in three steps
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10">
              {[
                {
                  step: "1",
                  title: "Sign up in seconds",
                  desc:
                    "Create your account with email or Google. Pick a username and you're in.",
                },
                {
                  step: "2",
                  title: "Add your links & brand",
                  desc:
                    "Drop in your links, choose a theme, upload a photo. Drag to reorder anytime.",
                },
                {
                  step: "3",
                  title: "Share one link everywhere",
                  desc:
                    "Put your Getlnk URL in every bio. Track clicks and views from your dashboard.",
                },
              ].map((s) => (
                <div key={s.step} class="text-center">
                  <div class="mx-auto w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xl font-bold mb-4">
                    {s.step}
                  </div>
                  <h3 class="text-lg font-bold text-gray-900 mb-2">
                    {s.title}
                  </h3>
                  <p class="text-gray-600 text-sm sm:text-base">{s.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Business benefits */}
          <section class="pb-12 sm:pb-16 md:pb-24 grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div class="bg-white rounded-lg shadow-lg p-6 flex flex-col h-full">
              <div class="text-4xl mb-4">💼</div>
              <h3 class="text-xl font-bold text-gray-900 mb-2">
                Built for business growth
              </h3>
              <p class="text-gray-600">
                Send traffic from Instagram, TikTok, YouTube, email, and more to
                a single high-converting page. Highlight launches, services, and
                campaigns without constantly changing your bio link.
              </p>
            </div>
            <div class="bg-white rounded-lg shadow-lg p-6 flex flex-col h-full">
              <div class="text-4xl mb-4">📊</div>
              <h3 class="text-xl font-bold text-gray-900 mb-2">
                See what actually works
              </h3>
              <p class="text-gray-600">
                Track views and clicks in real time so you know which offers,
                platforms, and buttons convert best. Make decisions based on
                data, not guesses.
              </p>
            </div>
            <div class="bg-white rounded-lg shadow-lg p-6 flex flex-col h-full">
              <div class="text-4xl mb-4">🎨</div>
              <h3 class="text-xl font-bold text-gray-900 mb-2">
                On-brand in minutes
              </h3>
              <p class="text-gray-600">
                Choose a clean layout, plug in your brand colors, and go live in
                a few clicks. No design or code required — but fully
                customizable if you want complete control.
              </p>
            </div>
          </section>

          {/* Social proof & positioning */}
          <section class="pb-12 sm:pb-16 md:pb-24 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div class="lg:col-span-2 bg-white rounded-xl shadow-lg p-6 sm:p-8">
              <h2 class="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                One simple hub for all your important actions
              </h2>
              <p class="text-gray-600 mb-4">
                Creators, freelancers, solo founders, and small teams use Getlnk
                to centralize everything that matters: lead magnets, newsletter
                signup, store links, booking pages, and more.
              </p>
              <ul class="space-y-3 text-left text-gray-700">
                <li class="flex gap-2">
                  <span class="mt-1 text-indigo-600">✔</span>
                  <span>
                    Promote products, services, and content from every channel
                    you use.
                  </span>
                </li>
                <li class="flex gap-2">
                  <span class="mt-1 text-indigo-600">✔</span>
                  <span>
                    Swap and reorder links instantly as your priorities change.
                  </span>
                </li>
                <li class="flex gap-2">
                  <span class="mt-1 text-indigo-600">✔</span>
                  <span>
                    Understand which campaigns bring traffic — and which ones
                    you can drop.
                  </span>
                </li>
              </ul>
            </div>
            <div class="bg-indigo-600 text-white rounded-xl shadow-lg p-6 sm:p-7 flex flex-col justify-between gap-4">
              <div>
                <p class="text-sm uppercase tracking-wide opacity-80 mb-2">
                  Why Getlnk
                </p>
                <h3 class="text-xl font-semibold mb-3">
                  Open-source, privacy-friendly, and under your control.
                </h3>
                <p class="text-indigo-100 text-sm">
                  Host it yourself or use a hosted version. You own your data,
                  your audience, and your brand.
                </p>
              </div>
              <div class="grid grid-cols-2 gap-4 mt-2 text-sm">
                <div>
                  <p class="font-semibold">Fast setup</p>
                  <p class="text-indigo-100">Launch in under 5 minutes.</p>
                </div>
                <div>
                  <p class="font-semibold">Made for scale</p>
                  <p class="text-indigo-100">
                    From first followers to full-time business.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Pricing */}
          <section class="pb-12 sm:pb-16 md:pb-24">
            <h2 class="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-3">
              Simple, transparent pricing
            </h2>
            <p class="text-gray-600 text-center mb-10 sm:mb-14 max-w-lg mx-auto">
              Start free. Upgrade when you need more. No surprises.
            </p>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-4xl mx-auto">
              <PricingCard
                tier="Free"
                price="$0"
                features={[
                  "5 links",
                  "3 themes",
                  "Basic analytics",
                  "Social links",
                  "Avatar upload",
                ]}
                cta="Get started"
                badge="Most Popular"
              />
              <PricingCard
                tier="Pro"
                price="$3"
                period="/month"
                features={[
                  "Unlimited links",
                  "All 5 themes",
                  "Advanced analytics",
                  "No Getlnk branding",
                  "Priority support",
                ]}
                cta="Upgrade to Pro"
                highlight
                badge="Best Value"
              />
              <PricingCard
                tier="Business"
                price="$9"
                period="/month"
                features={[
                  "Everything in Pro",
                  "Custom domain",
                  "Link scheduling",
                  "Email capture",
                  "Team accounts",
                ]}
                cta="Coming soon"
                badge="Coming Soon"
              />
            </div>
          </section>

          {/* FAQ */}
          <section class="pb-12 sm:pb-16 md:pb-24">
            <h2 class="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8 text-center">
              Frequently asked questions
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              <div class="bg-white rounded-lg shadow-md p-5 sm:p-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-2">
                  Do I need a website?
                </h3>
                <p class="text-gray-600 text-sm sm:text-base">
                  No. Getlnk can be your first "home on the internet" — a simple
                  page that connects people to everything you offer.
                </p>
              </div>
              <div class="bg-white rounded-lg shadow-md p-5 sm:p-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-2">
                  Is it really free and open source?
                </h3>
                <p class="text-gray-600 text-sm sm:text-base">
                  Yes. The core of Getlnk is open source, so you can inspect the
                  code, run it yourself, and extend it as your business grows.
                </p>
              </div>
              <div class="bg-white rounded-lg shadow-md p-5 sm:p-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-2">
                  Who is Getlnk for?
                </h3>
                <p class="text-gray-600 text-sm sm:text-base">
                  Ideal for creators, consultants, indie hackers, and small
                  businesses that want a clean, measurable way to turn attention
                  into action.
                </p>
              </div>
            </div>
          </section>

          {/* Final CTA */}
          <section class="pb-12 sm:pb-16 md:pb-24">
            <div class="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 sm:p-12 text-center text-white shadow-xl">
              <h2 class="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
                Ready to claim your link?
              </h2>
              <p class="text-indigo-100 mb-6 sm:mb-8 max-w-md mx-auto">
                Join creators and businesses who use Getlnk to turn their
                audience into action.
              </p>
              <a
                href={isAuthenticated ? "/dashboard" : "/register"}
                class="inline-flex items-center justify-center px-8 py-3 bg-white text-indigo-600 rounded-xl hover:bg-indigo-50 transition-colors font-semibold text-lg touch-manipulation"
              >
                {isAuthenticated ? "Go to Dashboard" : "Start for free"}
              </a>
              {!isAuthenticated && (
                <p class="mt-4 text-sm text-indigo-200">
                  No credit card required.
                </p>
              )}
            </div>
          </section>
        </main>
      </div>
    </>
  );
});
