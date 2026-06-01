'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { Users, Building2, Ticket, DollarSign, CreditCard, BarChart3, Star, Zap, Shield, Bell, FileText, Gift, Globe, Settings, AlertTriangle, MessageSquare, Map, Briefcase, LogOut, Menu, X, ChevronLeft, ChevronRight, Search, CreditCard as Payments, Megaphone, Activity } from 'lucide-react';

const NAV_GROUPS = [
  { label: 'MANAGEMENT', items: [
    { href: '/admin/dashboard', icon: BarChart3, label: 'Dashboard' },
    { href: '/admin/users', icon: Users, label: 'Users' },
    { href: '/admin/hotels', icon: Building2, label: 'Hotels' },
    { href: '/admin/hotels/import', icon: Globe, label: 'Import Hotels' },
  ]},
  { label: 'OPERATIONS', items: [
    { href: '/admin/coupons', icon: Ticket, label: 'Coupons' },
    { href: '/admin/subscriptions', icon: CreditCard, label: 'Subscriptions' },
    { href: '/admin/revenue', icon: DollarSign, label: 'Revenue' },
    { href: '/admin/flash-deals', icon: Zap, label: 'Flash Deals' },
  ]},
  { label: 'MARKETING', items: [
    { href: '/admin/gift-cards', icon: Gift, label: 'Gift Cards' },
    { href: '/admin/email-campaigns', icon: Bell, label: 'Emails' },
    { href: '/admin/sms', icon: MessageSquare, label: 'SMS' },
    { href: '/admin/blogs', icon: FileText, label: 'Blog' },
    { href: '/admin/broadcast', icon: Megaphone, label: 'Broadcast' },
  ]},
  { label: 'SYSTEM', items: [
    { href: '/admin/settings', icon: Settings, label: 'Settings' },
    { href: '/admin/fraud', icon: AlertTriangle, label: 'Fraud' },
    { href: '/admin/stay-requests', icon: Map, label: 'Stay Requests' },
    { href: '/admin/activities', icon: Activity, label: 'Activities' },
  ]},
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) { router.push('/'); return; }
  }, [user, authLoading]);

  if (authLoading || !user || user.role !== 'admin') return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin h-8 w-8 border-4 border-[#ea4d60] border-t-transparent rounded-full" /></div>;

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  const SidebarContent = ({ collapsed: isCollapsed }: { collapsed: boolean }) => (
    <div className="flex flex-col h-full">
      {/* Logo area */}
      <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} px-3 h-16 border-b border-gray-100 dark:border-gray-800`}>
        {isCollapsed ? (
          <img src="/favicon.svg" alt="BusyBeds" className="h-8 w-8" />
        ) : (
          <img src="/logo.svg" alt="BusyBeds" className="h-7 w-auto" />
        )}
        {!isCollapsed && (
          <button onClick={() => setCollapsed(true)} className="h-7 w-7 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center text-gray-400 transition-colors">
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        {NAV_GROUPS.map(group => (
          <div key={group.label} className="mb-3">
            {!isCollapsed && (
              <p className="text-[10px] font-semibold tracking-wider text-gray-400 dark:text-gray-500 uppercase px-3 mb-1">{group.label}</p>
            )}
            {group.items.map(item => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  title={isCollapsed ? item.label : undefined}
                  className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''} px-3 py-2 rounded-lg text-sm transition-all mb-0.5 ${
                    active
                      ? 'bg-[#ea4d60]/10 text-[#ea4d60] font-semibold'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <item.icon className={`h-4 w-4 shrink-0 ${active ? 'text-[#ea4d60]' : ''}`} />
                  {!isCollapsed && <span>{item.label}</span>}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Bottom section */}
      <div className={`border-t border-gray-100 dark:border-gray-800 ${isCollapsed ? 'px-2' : 'px-3'} py-3`}>
        {!isCollapsed ? (
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-[#ea4d60] flex items-center justify-center text-white text-xs font-bold shrink-0">
              {user.fullName?.charAt(0)?.toUpperCase() || 'A'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{user.fullName}</p>
              <p className="text-xs text-gray-400 truncate">{user.email}</p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center mb-2">
            <div className="w-8 h-8 rounded-full bg-[#ea4d60] flex items-center justify-center text-white text-xs font-bold">
              {user.fullName?.charAt(0)?.toUpperCase() || 'A'}
            </div>
          </div>
        )}
        <button
          onClick={async () => { await logout(); router.push('/login'); }}
          className={`flex items-center gap-2 ${isCollapsed ? 'justify-center' : ''} w-full px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors`}
          title="Sign Out"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!isCollapsed && <span>Sign Out</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-[#0F1117]">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col bg-white dark:bg-[#1a1d27] border-r border-gray-100 dark:border-gray-800 transition-all duration-300 ease-in-out shrink-0 ${
          collapsed ? 'w-[68px]' : 'w-[240px]'
        }`}
      >
        <SidebarContent collapsed={collapsed} />
        {/* Collapse toggle at bottom */}
        {collapsed && (
          <div className="px-2 pb-3 flex justify-center">
            <button onClick={() => setCollapsed(false)} className="h-7 w-7 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center text-gray-400 transition-colors">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </aside>

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-[240px] bg-white dark:bg-[#1a1d27] shadow-xl">
            <SidebarContent collapsed={false} />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Mobile header */}
        <div className="lg:hidden bg-white dark:bg-[#1a1d27] border-b border-gray-100 dark:border-gray-800 p-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setMobileMenuOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <img src="/favicon.svg" alt="" className="h-6 w-6" />
          <span className="font-bold text-sm">Admin</span>
          <div className="ml-auto">
            <div className="w-7 h-7 rounded-full bg-[#ea4d60] flex items-center justify-center text-white text-[10px] font-bold">
              {user.fullName?.charAt(0)?.toUpperCase() || 'A'}
            </div>
          </div>
        </div>
        <div className="flex-1 p-4 md:p-6 max-w-full overflow-x-auto">{children}</div>
      </div>
    </div>
  );
}
