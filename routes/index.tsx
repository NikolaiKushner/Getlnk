import { define } from "../utils.ts";
import { Head } from "fresh/runtime";

function FeatureIcon(
  { d, className }: { d: string; className?: string },
) {
  return (
    <svg
      class={`w-6 h-6 ${className ?? "text-indigo-600"}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke-width="1.5"
      stroke="currentColor"
    >
      <path stroke-linecap="round" stroke-linejoin="round" d={d} />
    </svg>
  );
}

const ICON_PATHS = {
  link:
    "M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m9.86-2.54a4.5 4.5 0 0 0-1.242-7.244l-4.5-4.5a4.5 4.5 0 0 0-6.364 6.364L4.34 8.374",
  chart:
    "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z",
  palette:
    "M4.098 19.902a3.75 3.75 0 0 0 5.304 0l6.401-6.402M6.75 21A3.75 3.75 0 0 1 3 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 0 0 3.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008Z",
  shield:
    "M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z",
  bolt: "m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z",
  code: "M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5",
  globe:
    "M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5a17.92 17.92 0 0 1-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418",
  users:
    "M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z",
  check: "m4.5 12.75 6 6 9-13.5",
  arrowRight: "M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3",
};

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
          : "bg-white text-gray-900 shadow-lg border border-gray-100"
      }`}
    >
      {badge && (
        <span
          class={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-semibold ${
            highlight
              ? "bg-yellow-400 text-gray-900"
              : "bg-gray-100 text-gray-600"
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
          <li key={f} class="flex gap-2 text-sm items-start">
            <FeatureIcon
              d={ICON_PATHS.check}
              className={highlight ? "text-indigo-200" : "text-indigo-600"}
            />
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
        <title>Getlnk -- The professional link-in-bio platform</title>
        <meta
          name="description"
          content="Create a professional, branded landing page with all your links. Built for creators, freelancers, and businesses who want to drive results."
        />
      </Head>
      <div class="min-h-screen bg-white">
        {/* Header */}
        <header class="bg-white border-b border-gray-100">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div class="flex justify-between items-center">
              <div class="flex items-center gap-2">
                <img src="/logo.svg" width="36" height="36" alt="Getlnk logo" />
                <span class="text-lg font-bold text-gray-900">Getlnk</span>
              </div>
              <nav class="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
                <a
                  href="#features"
                  class="hover:text-gray-900 transition-colors"
                >
                  Features
                </a>
                <a
                  href="#how-it-works"
                  class="hover:text-gray-900 transition-colors"
                >
                  How it works
                </a>
                <a
                  href="#pricing"
                  class="hover:text-gray-900 transition-colors"
                >
                  Pricing
                </a>
                <a href="#faq" class="hover:text-gray-900 transition-colors">
                  FAQ
                </a>
              </nav>
              <div class="flex gap-2 sm:gap-3">
                {isAuthenticated
                  ? (
                    <>
                      <a
                        href="/dashboard"
                        class="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors touch-manipulation"
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
                          class="px-4 py-2 text-sm font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors touch-manipulation"
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
                        class="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors touch-manipulation"
                      >
                        Log in
                      </a>
                      <a
                        href="/register"
                        class="inline-flex items-center justify-center px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors touch-manipulation"
                      >
                        Sign up free
                      </a>
                    </>
                  )}
              </div>
            </div>
          </div>
        </header>

        <main>
          {/* Hero */}
          <section class="bg-gradient-to-b from-gray-50 to-white">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 md:py-28">
              <div class="max-w-3xl mx-auto text-center">
                <p class="text-sm font-semibold text-indigo-600 uppercase tracking-wide mb-4">
                  The link-in-bio built for results
                </p>
                <h1 class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight tracking-tight">
                  One link to drive traffic,{" "}
                  <span class="text-indigo-600">
                    capture leads, and grow revenue
                  </span>
                </h1>
                <p class="mt-6 text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                  Getlnk gives creators, freelancers, and businesses a
                  professional branded page for all their important links.
                  Set up in minutes. Track what converts. Open source.
                </p>
                <div class="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                  {isAuthenticated
                    ? (
                      <a
                        href="/dashboard"
                        class="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold text-base touch-manipulation"
                      >
                        Go to Dashboard
                        <FeatureIcon
                          d={ICON_PATHS.arrowRight}
                          className="text-white w-4 h-4"
                        />
                      </a>
                    )
                    : (
                      <>
                        <a
                          href="/register"
                          class="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold text-base touch-manipulation"
                        >
                          Get started free
                          <FeatureIcon
                            d={ICON_PATHS.arrowRight}
                            className="text-white w-4 h-4"
                          />
                        </a>
                        <a
                          href="/login"
                          class="inline-flex items-center justify-center px-8 py-3.5 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-semibold text-base touch-manipulation"
                        >
                          Log in
                        </a>
                      </>
                    )}
                </div>
                <p class="mt-4 text-sm text-gray-500">
                  No credit card required. Free plan available.
                </p>
              </div>
            </div>
          </section>

          {/* Stats bar */}
          <section class="border-y border-gray-100 bg-white">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
              <div class="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                <div>
                  <p class="text-3xl font-bold text-gray-900">5</p>
                  <p class="mt-1 text-sm text-gray-500">
                    Professional themes
                  </p>
                </div>
                <div>
                  <p class="text-3xl font-bold text-gray-900">100%</p>
                  <p class="mt-1 text-sm text-gray-500">Open source</p>
                </div>
                <div>
                  <p class="text-3xl font-bold text-gray-900">&lt;5 min</p>
                  <p class="mt-1 text-sm text-gray-500">Setup time</p>
                </div>
                <div>
                  <p class="text-3xl font-bold text-gray-900">$0</p>
                  <p class="mt-1 text-sm text-gray-500">To get started</p>
                </div>
              </div>
            </div>
          </section>

          {/* Features */}
          <section id="features" class="bg-white">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 md:py-24">
              <div class="text-center mb-14">
                <p class="text-sm font-semibold text-indigo-600 uppercase tracking-wide mb-3">
                  Features
                </p>
                <h2 class="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
                  Everything you need to convert your audience
                </h2>
                <p class="mt-4 text-gray-600 max-w-2xl mx-auto">
                  A complete toolkit for managing your online presence,
                  understanding your audience, and growing your business.
                </p>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[
                  {
                    icon: ICON_PATHS.link,
                    title: "Unlimited links",
                    desc:
                      "Add as many links as you need. Drag to reorder, toggle visibility, and update in real time.",
                  },
                  {
                    icon: ICON_PATHS.chart,
                    title: "Built-in analytics",
                    desc:
                      "Track page views and link clicks to understand what resonates with your audience.",
                  },
                  {
                    icon: ICON_PATHS.palette,
                    title: "Professional themes",
                    desc:
                      "Choose from curated themes designed to make your page look polished and on-brand.",
                  },
                  {
                    icon: ICON_PATHS.bolt,
                    title: "Fast and reliable",
                    desc:
                      "Pages load instantly with no unnecessary bloat. Built on modern infrastructure.",
                  },
                  {
                    icon: ICON_PATHS.shield,
                    title: "Privacy-first",
                    desc:
                      "You own your data. No third-party trackers, no selling your audience information.",
                  },
                  {
                    icon: ICON_PATHS.code,
                    title: "Open source",
                    desc:
                      "Inspect the code, self-host, or contribute. Full transparency in how your page works.",
                  },
                ].map((feature) => (
                  <div
                    key={feature.title}
                    class="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-colors"
                  >
                    <div class="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center mb-4">
                      <FeatureIcon d={feature.icon} />
                    </div>
                    <h3 class="text-lg font-semibold text-gray-900 mb-2">
                      {feature.title}
                    </h3>
                    <p class="text-gray-600 text-sm leading-relaxed">
                      {feature.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* How it works */}
          <section id="how-it-works" class="bg-gray-50">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 md:py-24">
              <div class="text-center mb-14">
                <p class="text-sm font-semibold text-indigo-600 uppercase tracking-wide mb-3">
                  How it works
                </p>
                <h2 class="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
                  Go live in three simple steps
                </h2>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                {[
                  {
                    step: "01",
                    title: "Create your account",
                    desc:
                      "Sign up with email or Google. Choose a username and your page is instantly live.",
                  },
                  {
                    step: "02",
                    title: "Add links and customize",
                    desc:
                      "Add your important links, select a theme, upload your photo. Reorder anytime.",
                  },
                  {
                    step: "03",
                    title: "Share and track results",
                    desc:
                      "Put your Getlnk URL in every bio and profile. Monitor performance from your dashboard.",
                  },
                ].map((s) => (
                  <div key={s.step} class="text-center">
                    <div class="mx-auto w-14 h-14 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-bold mb-5">
                      {s.step}
                    </div>
                    <h3 class="text-lg font-semibold text-gray-900 mb-2">
                      {s.title}
                    </h3>
                    <p class="text-gray-600 text-sm leading-relaxed">
                      {s.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Use cases */}
          <section class="bg-white">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 md:py-24">
              <div class="text-center mb-14">
                <p class="text-sm font-semibold text-indigo-600 uppercase tracking-wide mb-3">
                  Built for professionals
                </p>
                <h2 class="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
                  One hub for everything that matters
                </h2>
                <p class="mt-4 text-gray-600 max-w-2xl mx-auto">
                  Whether you are a solo creator or a growing team, Getlnk
                  centralizes your online presence into a single,
                  high-performing page.
                </p>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div class="border border-gray-200 rounded-xl p-6">
                  <div class="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center mb-4">
                    <FeatureIcon d={ICON_PATHS.users} />
                  </div>
                  <h3 class="text-lg font-semibold text-gray-900 mb-2">
                    Creators and influencers
                  </h3>
                  <p class="text-gray-600 text-sm leading-relaxed">
                    Consolidate your content, merch, sponsors, and social
                    profiles. Send followers from any platform to one page that
                    showcases everything.
                  </p>
                </div>
                <div class="border border-gray-200 rounded-xl p-6">
                  <div class="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center mb-4">
                    <FeatureIcon d={ICON_PATHS.bolt} />
                  </div>
                  <h3 class="text-lg font-semibold text-gray-900 mb-2">
                    Freelancers and consultants
                  </h3>
                  <p class="text-gray-600 text-sm leading-relaxed">
                    Share your portfolio, booking link, testimonials, and contact
                    info. Make it easy for clients to find and hire you.
                  </p>
                </div>
                <div class="border border-gray-200 rounded-xl p-6">
                  <div class="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center mb-4">
                    <FeatureIcon d={ICON_PATHS.globe} />
                  </div>
                  <h3 class="text-lg font-semibold text-gray-900 mb-2">
                    Small businesses
                  </h3>
                  <p class="text-gray-600 text-sm leading-relaxed">
                    Drive traffic from social media to your store, promotions,
                    and landing pages. Track which channels bring the most
                    conversions.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Pricing */}
          <section id="pricing" class="bg-gray-50">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 md:py-24">
              <div class="text-center mb-14">
                <p class="text-sm font-semibold text-indigo-600 uppercase tracking-wide mb-3">
                  Pricing
                </p>
                <h2 class="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
                  Simple, transparent pricing
                </h2>
                <p class="mt-4 text-gray-600 max-w-lg mx-auto">
                  Start free. Upgrade when you need more. No surprises.
                </p>
              </div>
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
            </div>
          </section>

          {/* FAQ */}
          <section id="faq" class="bg-white">
            <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 md:py-24">
              <div class="text-center mb-14">
                <p class="text-sm font-semibold text-indigo-600 uppercase tracking-wide mb-3">
                  FAQ
                </p>
                <h2 class="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                  Questions and answers
                </h2>
              </div>
              <div class="divide-y divide-gray-200">
                {[
                  {
                    q: "Do I need a website to use Getlnk?",
                    a: "No. Getlnk can serve as your primary web presence -- a professional page that connects visitors to everything you offer.",
                  },
                  {
                    q: "Is Getlnk really free and open source?",
                    a: "Yes. The core platform is open source. You can inspect the code, run it yourself, or use the hosted version with a generous free tier.",
                  },
                  {
                    q: "Who is Getlnk designed for?",
                    a: "Creators, freelancers, consultants, and small businesses who want a clean, measurable way to turn social media traffic into action.",
                  },
                  {
                    q: "Can I use my own domain?",
                    a: "Custom domains are available on the Business plan. You can point your own domain to your Getlnk page for a fully branded experience.",
                  },
                  {
                    q: "How does analytics work?",
                    a: "Getlnk tracks page views and individual link clicks. You can see real-time data in your dashboard to understand which links perform best.",
                  },
                ].map((item) => (
                  <div key={item.q} class="py-6">
                    <h3 class="text-base font-semibold text-gray-900">
                      {item.q}
                    </h3>
                    <p class="mt-2 text-gray-600 text-sm leading-relaxed">
                      {item.a}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Final CTA */}
          <section class="bg-gray-900">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 text-center">
              <h2 class="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
                Ready to consolidate your online presence?
              </h2>
              <p class="text-gray-400 mb-8 max-w-lg mx-auto">
                Join creators and businesses using Getlnk to turn their audience
                into measurable results.
              </p>
              <a
                href={isAuthenticated ? "/dashboard" : "/register"}
                class="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold text-base touch-manipulation"
              >
                {isAuthenticated ? "Go to Dashboard" : "Get started free"}
                <FeatureIcon
                  d={ICON_PATHS.arrowRight}
                  className="text-white w-4 h-4"
                />
              </a>
              {!isAuthenticated && (
                <p class="mt-4 text-sm text-gray-500">
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
