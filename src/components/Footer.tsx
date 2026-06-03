import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0F1117] mt-auto">
      <div className="max-w-[1120px] mx-auto px-6 md:px-10 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 font-bold text-xl mb-4">
              <img src="/logo.svg" alt="BusyBeds" className="h-8 w-auto" />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              Premium hotel discount coupons for travelers across Africa. Save up to 50% on your next stay in Tanzania, Kenya, Zanzibar and beyond.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-3 text-sm uppercase tracking-wider text-gray-400">Explore</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/hotels" className="text-gray-700 dark:text-gray-300 hover:text-[#0E5C3B] dark:hover:text-[#10b981] transition-colors">Browse Hotels</Link></li>
              <li><Link href="/coupons" className="text-gray-700 dark:text-gray-300 hover:text-[#0E5C3B] dark:hover:text-[#10b981] transition-colors">My Coupons</Link></li>
              <li><Link href="/locations" className="text-gray-700 dark:text-gray-300 hover:text-[#0E5C3B] dark:hover:text-[#10b981] transition-colors">Locations</Link></li>
              <li><Link href="/flash-deals" className="text-gray-700 dark:text-gray-300 hover:text-[#0E5C3B] dark:hover:text-[#10b981] transition-colors">Flash Deals</Link></li>
              <li><Link href="/blog" className="text-gray-700 dark:text-gray-300 hover:text-[#0E5C3B] dark:hover:text-[#10b981] transition-colors">Blog</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3 text-sm uppercase tracking-wider text-gray-400">Company</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/about" className="text-gray-700 dark:text-gray-300 hover:text-[#0E5C3B] dark:hover:text-[#10b981] transition-colors">About Us</Link></li>
              <li><Link href="/pricing" className="text-gray-700 dark:text-gray-300 hover:text-[#0E5C3B] dark:hover:text-[#10b981] transition-colors">Pricing</Link></li>
              <li><Link href="/become-host" className="text-gray-700 dark:text-gray-300 hover:text-[#0E5C3B] dark:hover:text-[#10b981] transition-colors">List Your Hotel</Link></li>
              <li><Link href="/contact" className="text-gray-700 dark:text-gray-300 hover:text-[#0E5C3B] dark:hover:text-[#10b981] transition-colors">Contact</Link></li>
              <li><Link href="/faq" className="text-gray-700 dark:text-gray-300 hover:text-[#0E5C3B] dark:hover:text-[#10b981] transition-colors">FAQ</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3 text-sm uppercase tracking-wider text-gray-400">Legal</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/terms-of-service" className="text-gray-700 dark:text-gray-300 hover:text-[#0E5C3B] dark:hover:text-[#10b981] transition-colors">Terms of Service</Link></li>
              <li><Link href="/privacy-policy" className="text-gray-700 dark:text-gray-300 hover:text-[#0E5C3B] dark:hover:text-[#10b981] transition-colors">Privacy Policy</Link></li>
            </ul>
            <div className="mt-5 flex gap-2">
              <span className="text-[11px] bg-[#0E5C3B]/10 text-[#0E5C3B] dark:bg-[#10b981]/10 dark:text-[#10b981] px-2.5 py-1 rounded-md font-medium">M-Pesa</span>
              <span className="text-[11px] bg-[#0E5C3B]/10 text-[#0E5C3B] dark:bg-[#10b981]/10 dark:text-[#10b981] px-2.5 py-1 rounded-md font-medium">Tigo Pesa</span>
              <span className="text-[11px] bg-[#0E5C3B]/10 text-[#0E5C3B] dark:bg-[#10b981]/10 dark:text-[#10b981] px-2.5 py-1 rounded-md font-medium">Stripe</span>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-400">&copy; {new Date().getFullYear()} BusyBeds. All rights reserved.</p>
          <p className="text-xs text-gray-400">Made with ❤️ in Tanzania</p>
        </div>
      </div>
    </footer>
  );
}
