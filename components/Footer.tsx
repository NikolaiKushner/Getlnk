export default function Footer() {
  return (
    <footer class="bg-gray-900 text-gray-400 mt-auto">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div class="sm:col-span-2 lg:col-span-1">
            <div class="flex items-center gap-2 mb-3">
              <img src="/logo.svg" width="28" height="28" alt="Getlnk logo" />
              <span class="text-lg font-bold text-white">Getlnk</span>
            </div>
            <p class="text-sm leading-relaxed">
              The professional link-in-bio platform for creators, freelancers,
              and businesses.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 class="text-sm font-semibold text-white uppercase tracking-wide mb-4">
              Product
            </h4>
            <ul class="space-y-2 text-sm">
              <li>
                <a href="/#features" class="hover:text-white transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="/pricing" class="hover:text-white transition-colors">
                  Pricing
                </a>
              </li>
              <li>
                <a
                  href="/#how-it-works"
                  class="hover:text-white transition-colors"
                >
                  How it works
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 class="text-sm font-semibold text-white uppercase tracking-wide mb-4">
              Legal
            </h4>
            <ul class="space-y-2 text-sm">
              <li>
                <a href="/privacy" class="hover:text-white transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="/terms" class="hover:text-white transition-colors">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 class="text-sm font-semibold text-white uppercase tracking-wide mb-4">
              Contact
            </h4>
            <ul class="space-y-2 text-sm">
              <li>
                <a
                  href="mailto:info@getlnk.xyz"
                  class="hover:text-white transition-colors"
                >
                  info@getlnk.xyz
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div class="mt-10 pt-6 border-t border-gray-800 text-sm text-center">
          <p>
            &copy; {new Date().getFullYear()} Getlnk. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
