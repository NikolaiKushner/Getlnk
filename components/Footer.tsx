export default function Footer() {
  return (
    <footer className="mt-auto border-t border-white/10 bg-[var(--ink)] text-white/55">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <p className="font-display text-lg font-bold text-white">Getlnk</p>
            <p className="mt-3 text-sm leading-relaxed">
              One link for everything you share — creators, freelancers, and
              teams.
            </p>
          </div>
          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-white">
              Product
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/#how" className="transition-colors hover:text-white">
                  How it works
                </a>
              </li>
              <li>
                <a href="/pricing" className="transition-colors hover:text-white">
                  Pricing
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-white">
              Legal
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/privacy" className="transition-colors hover:text-white">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="/terms" className="transition-colors hover:text-white">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-white">
              Contact
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="mailto:info@getlnk.xyz"
                  className="transition-colors hover:text-white"
                >
                  info@getlnk.xyz
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t border-white/10 pt-6 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} Getlnk. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
