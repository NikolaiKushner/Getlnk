export default function Footer() {
  return (
    <footer className="mt-auto bg-gray-900 text-gray-400">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="mb-3 flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.svg" width={28} height={28} alt="Getlnk logo" />
              <span className="text-lg font-bold text-white">Getlnk</span>
            </div>
            <p className="text-sm leading-relaxed">
              The professional link-in-bio platform for creators, freelancers,
              and businesses.
            </p>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-white">
              Product
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/#features" className="transition-colors hover:text-white">
                  Features
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
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-white">
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
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-white">
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
        <div className="mt-10 border-t border-gray-800 pt-6 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} Getlnk. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
