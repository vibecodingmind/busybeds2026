'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Lock, Bell, Shield, CreditCard, Globe, HelpCircle, FileText, Wallet, Heart } from 'lucide-react';
import { usePathname } from 'next/navigation';

const SETTINGS_NAV = [
  { href: '/settings', icon: User, label: 'Profile', exact: true },
  { href: '/settings/security', icon: Lock, label: 'Security' },
  { href: '/settings/notifications', icon: Bell, label: 'Notifications' },
  { href: '/settings/privacy', icon: Shield, label: 'Privacy' },
  { href: '/settings/subscription', icon: CreditCard, label: 'Subscription' },
  { href: '/settings/billing', icon: Wallet, label: 'Billing' },
  { href: '/settings/invoices', icon: FileText, label: 'Invoices' },
  { href: '/settings/payment-methods', icon: CreditCard, label: 'Payment Methods' },
  { href: '/settings/preferences', icon: Globe, label: 'Preferences' },
  { href: '/settings/help', icon: HelpCircle, label: 'Help & Support' },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  if (authLoading) return <div className="flex items-center justify-center min-h-[60vh]">Loading...</div>;
  if (!user) { router.push('/login'); return null; }

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      <div className="grid md:grid-cols-4 gap-8">
        <nav className="space-y-1">
          {SETTINGS_NAV.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive(item.href, item.exact)
                  ? 'bg-[#0E5C3B]/10 text-[#0E5C3B] dark:bg-[#10b981]/10 dark:text-[#10b981] font-semibold'
                  : 'hover:bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              <item.icon className="h-4 w-4" /> {item.label}
            </Link>
          ))}
        </nav>
        <div className="md:col-span-3">
          {children}
        </div>
      </div>
    </div>
  );
}
