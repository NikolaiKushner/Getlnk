import Link from "next/link";
import { signIn } from "@/auth";
import Footer from "@/components/Footer";
import { HeaderAuth } from "@/components/HeaderAuth";

function PhonePreview() {
  return (
    <div className="land-float relative mx-auto w-[280px] sm:w-[300px]">
      <div className="absolute -inset-8 rounded-[3rem] bg-[var(--sea)]/15 blur-3xl" />
      <div className="relative overflow-hidden rounded-[2.25rem] border border-[var(--ink)]/10 bg-[var(--ink)] shadow-[0_30px_80px_rgba(12,18,34,0.28)]">
        <div className="flex items-center justify-center bg-[var(--ink)] pt-3">
          <div className="h-5 w-24 rounded-full bg-black/40" />
        </div>
        <div className="bg-gradient-to-b from-[#143d38] via-[#0f7a6c] to-[#0c1222] px-5 pb-8 pt-6 text-white">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--lime-ink)] font-display text-2xl font-bold text-[var(--ink)]">
            A
          </div>
          <p className="text-center font-display text-xl font-bold tracking-tight">
            Alex Rivera
          </p>
          <p className="mt-1 text-center text-sm text-white/75">
            Designer · builder · newsletter
          </p>
          <div className="mt-6 space-y-2.5">
            {["Portfolio", "Latest project", "Book a call", "Newsletter"].map(
              (label) => (
                <div
                  key={label}
                  className="rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-center text-sm font-medium backdrop-blur-sm"
                >
                  {label}
                </div>
              ),
            )}
          </div>
          <p className="mt-6 text-center text-[11px] tracking-wide text-white/45">
            getlnk.xyz/@alex
          </p>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[var(--paper)] text-[var(--ink)]">
      <section className="land-hero-bg relative min-h-[100svh] overflow-hidden">
        <div className="land-grid pointer-events-none absolute inset-0" />

        <header className="relative z-20">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
            <a href="/" className="font-display text-lg font-bold tracking-tight">
              Getlnk
            </a>
            <nav className="hidden items-center gap-8 text-sm font-medium text-[var(--muted)] md:flex">
              <a href="#how" className="transition-colors hover:text-[var(--ink)]">
                How it works
              </a>
              <a href="#why" className="transition-colors hover:text-[var(--ink)]">
                Why Getlnk
              </a>
              <a href="#pricing" className="transition-colors hover:text-[var(--ink)]">
                Pricing
              </a>
            </nav>
            <HeaderAuth />
          </div>
        </header>

        <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-12 px-4 pb-16 pt-8 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10 lg:px-8 lg:pb-24 lg:pt-10">
          <div>
            <p className="land-fade-up font-display text-5xl font-extrabold tracking-tight text-[var(--ink)] sm:text-6xl lg:text-7xl">
              Getlnk
            </p>
            <h1 className="land-fade-up land-fade-up-delay-1 mt-4 max-w-xl font-display text-3xl font-bold leading-[1.1] tracking-tight text-[var(--ink)] sm:text-4xl lg:text-[2.75rem]">
              One link for everything you share.
            </h1>
            <p className="land-fade-up land-fade-up-delay-2 mt-5 max-w-md text-base leading-relaxed text-[var(--muted)] sm:text-lg">
              Claim a username, publish your page, and put one URL in every bio.
              Simple themes, click tracking, no clutter.
            </p>
            <div className="land-fade-up land-fade-up-delay-3 mt-8 flex flex-wrap items-center gap-3">
              <form
                action={async () => {
                  "use server";
                  await signIn("google", { redirectTo: "/onboarding" });
                }}
              >
                <button
                  type="submit"
                  className="rounded-xl bg-[var(--ink)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-black"
                >
                  Create with Google
                </button>
              </form>
              <a
                href="#how"
                className="rounded-xl border border-[var(--ink)]/15 bg-white/60 px-6 py-3 text-sm font-semibold text-[var(--ink)] backdrop-blur transition hover:bg-white"
              >
                See how it works
              </a>
            </div>
          </div>

          <div className="land-fade-up land-fade-up-delay-2 flex justify-center lg:justify-end">
            <PhonePreview />
          </div>
        </div>
      </section>

      <section id="how" className="border-t border-[var(--ink)]/5 bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Live in three moves
          </h2>
          <p className="mt-3 max-w-xl text-[var(--muted)]">
            No setup maze. Sign in, claim a name, share the URL.
          </p>
          <ol className="mt-12 grid gap-10 md:grid-cols-3">
            {[
              {
                n: "01",
                title: "Sign in with Google",
                body: "One click. Your account is ready.",
              },
              {
                n: "02",
                title: "Claim @username",
                body: "Add links, pick a theme, publish when it feels right.",
              },
              {
                n: "03",
                title: "Share getlnk.xyz/@you",
                body: "Drop it in Instagram, X, email signatures — everywhere.",
              },
            ].map((step) => (
              <li key={step.n} className="border-t border-[var(--ink)]/10 pt-6">
                <p className="font-display text-sm font-bold tracking-widest text-[var(--sea)]">
                  {step.n}
                </p>
                <h3 className="mt-3 font-display text-xl font-bold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="why" className="bg-[var(--ink)] py-20 text-white sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Built for the link in your bio
          </h2>
          <p className="mt-3 max-w-xl text-white/65">
            The page visitors actually open — not another dashboard they ignore.
          </p>
          <div className="mt-14 grid gap-12 md:grid-cols-3">
            {[
              {
                title: "Public page that looks finished",
                body: "Themes, social icons, and a clean mobile layout by default.",
              },
              {
                title: "Know what converts",
                body: "Page views and link clicks, so you double down on what works.",
              },
              {
                title: "Yours to host and fork",
                body: "Open source. Self-hostable. No black-box lock-in for your links.",
              },
            ].map((item) => (
              <div key={item.title}>
                <div className="mb-4 h-1 w-10 bg-[var(--lime-ink)]" />
                <h3 className="font-display text-xl font-bold">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-white/65">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="bg-[var(--paper)] py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-end gap-10 lg:grid-cols-[1fr_auto]">
            <div>
              <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
                Free to start
              </h2>
              <p className="mt-3 max-w-lg text-[var(--muted)]">
                Public page, unlimited links, themes, and basic analytics.
                Paid plans can wait until you need them.
              </p>
            </div>
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <p className="font-display text-5xl font-extrabold tracking-tight">
                $0
              </p>
              <form
                action={async () => {
                  "use server";
                  await signIn("google", { redirectTo: "/onboarding" });
                }}
              >
                <button
                  type="submit"
                  className="rounded-xl bg-[var(--sea)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--sea-deep)]"
                >
                  Get your link
                </button>
              </form>
            </div>
          </div>
          <p className="mt-8 text-sm text-[var(--muted)]">
            Prefer details? See{" "}
            <Link href="/pricing" className="font-medium text-[var(--sea)] underline-offset-2 hover:underline">
              pricing
            </Link>
            .
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
