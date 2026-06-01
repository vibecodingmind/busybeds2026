import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-border bg-card mt-auto transition-theme">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 font-bold text-xl mb-4">
              <img src="/logo.svg" alt="BusyBeds" className="h-8 w-auto" />
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Premium hotel discount coupons for travelers across Africa. Save up to 50% on your next stay in Tanzania, Kenya, Zanzibar and beyond.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-3 text-sm uppercase tracking-wider text-muted-foreground">Explore</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/hotels" className="text-foreground hover:text-emerald transition-colors">Browse Hotels</Link></li>
              <li><Link href="/locations" className="text-foreground hover:text-emerald transition-colors">Locations</Link></li>
              <li><Link href="/subscribe" className="text-foreground hover:text-emerald transition-colors">Pricing Plans</Link></li>
              <li><Link href="/flash-deals" className="text-foreground hover:text-emerald transition-colors">Flash Deals</Link></li>
              <li><Link href="/blog" className="text-foreground hover:text-emerald transition-colors">Blog</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3 text-sm uppercase tracking-wider text-muted-foreground">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="text-foreground hover:text-emerald transition-colors">About Us</Link></li>
              <li><Link href="/become-host" className="text-foreground hover:text-emerald transition-colors">List Your Hotel</Link></li>
              <li><Link href="/contact" className="text-foreground hover:text-emerald transition-colors">Contact</Link></li>
              <li><Link href="/faq" className="text-foreground hover:text-emerald transition-colors">FAQ</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3 text-sm uppercase tracking-wider text-muted-foreground">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/terms-of-service" className="text-foreground hover:text-emerald transition-colors">Terms of Service</Link></li>
              <li><Link href="/privacy-policy" className="text-foreground hover:text-emerald transition-colors">Privacy Policy</Link></li>
            </ul>
            <div className="mt-4 flex gap-3">
              <span className="text-xs bg-emerald/10 text-emerald px-2 py-1 rounded">M-Pesa</span>
              <span className="text-xs bg-emerald/10 text-emerald px-2 py-1 rounded">Tigo Pesa</span>
              <span className="text-xs bg-emerald/10 text-emerald px-2 py-1 rounded">Stripe</span>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">&copy; {new Date().getFullYear()} BusyBeds. All rights reserved.</p>
          <p className="text-xs text-muted-foreground">Made with ❤️ in Tanzania</p>
        </div>
      </div>
    </footer>
  );
}
