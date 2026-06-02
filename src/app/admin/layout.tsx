'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { Users, Building2, Ticket, DollarSign, CreditCard, BarChart3, Star, Zap, Bell, FileText, Gift, Settings, AlertTriangle, MessageSquare, Map, LogOut, Menu, ChevronLeft, ChevronRight, Megaphone, Activity, UserCog, KeyRound, ChevronUp, ScrollText, ScanLine, QrCode, UsersRound, BarChart2, Globe, Shield } from 'lucide-react';

const NAV_GROUPS = [
  { label: 'MANAGEMENT', items: [
    { href: '/admin/dashboard', icon: BarChart3, label: 'Dashboard' },
    { href: '/admin/users', icon: Users, label: 'Users' },
    { href: '/admin/hotels', icon: Building2, label: 'Hotels' },
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
    { href: '/admin/audit-log', icon: ScrollText, label: 'Audit Log' },
    { href: '/admin/fraud', icon: AlertTriangle, label: 'Fraud' },
    { href: '/admin/stay-requests', icon: Map, label: 'Stay Requests' },
    { href: '/admin/activities', icon: Activity, label: 'Activities' },
    { href: '/admin/qr-validate', icon: QrCode, label: 'QR Validate' },
    { href: '/admin/roles', icon: Shield, label: 'Roles' },
    { href: '/admin/reviews', icon: Star, label: 'Reviews' },
    { href: '/admin/analytics', icon: BarChart2, label: 'Analytics' },
  ]},
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
  const avatarMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) { router.push('/'); return; }
  }, [user, authLoading]);

  // Close avatar menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (avatarMenuRef.current && !avatarMenuRef.current.contains(e.target as Node)) {
        setAvatarMenuOpen(false);
      }
    };
    if (avatarMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [avatarMenuOpen]);

  if (authLoading || !user || user.role !== 'admin') return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin h-8 w-8 border-4 border-[#ea4d60] border-t-transparent rounded-full" /></div>;

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  const handleSignOut = async () => {
    setAvatarMenuOpen(false);
    setMobileMenuOpen(false);
    await logout();
    router.push('/login');
  };

  const AvatarDropdown = () => (
    <div className="relative" ref={avatarMenuRef}>
      {/* Avatar trigger button */}
      <button
        onClick={() => setAvatarMenuOpen(!avatarMenuOpen)}
        className={`w-full flex items-center gap-3 ${collapsed ? 'justify-center p-2' : 'px-3 py-2'} rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors`}
      >
        <div className="w-8 h-8 rounded-full bg-[#ea4d60] flex items-center justify-center text-white text-xs font-bold shrink-0 relative">
          {user.avatar ? (
            <img src={user.avatar} alt={user.fullName} className="w-8 h-8 rounded-full object-cover" />
          ) : (
            user.fullName?.charAt(0)?.toUpperCase() || 'A'
          )}
        </div>
        {!collapsed && (
          <>
            <div className="min-w-0 flex-1 text-left">
              <p className="text-sm font-medium truncate">{user.fullName}</p>
              <p className="text-xs text-gray-400 truncate">{user.email}</p>
            </div>
            <ChevronUp className={`h-4 w-4 text-gray-400 shrink-0 transition-transform ${avatarMenuOpen ? 'rotate-180' : ''}`} />
          </>
        )}
      </button>

      {/* Dropdown menu */}
      {avatarMenuOpen && (
        <div className={`absolute ${collapsed ? 'left-full ml-2 bottom-0' : 'bottom-full left-0 right-0 mb-1'} bg-white dark:bg-[#1a1d27] border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-[60] py-1 min-w-[200px]`}>
          {/* User info header in dropdown */}
          {collapsed && (
            <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-800">
              <p className="text-sm font-medium truncate">{user.fullName}</p>
              <p className="text-xs text-gray-400 truncate">{user.email}</p>
            </div>
          )}
          <Link
            href="/admin/account"
            onClick={() => { setAvatarMenuOpen(false); setMobileMenuOpen(false); }}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <UserCog className="h-4 w-4" />
            My Account
          </Link>
          <Link
            href="/admin/account?tab=password"
            onClick={() => { setAvatarMenuOpen(false); setMobileMenuOpen(false); }}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <KeyRound className="h-4 w-4" />
            Change Password
          </Link>
          <div className="border-t border-gray-100 dark:border-gray-800 my-1" />
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 w-full transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      )}
    </div>
  );

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

      {/* Bottom section - Avatar with dropdown */}
      <div className={`border-t border-gray-100 dark:border-gray-800 ${isCollapsed ? 'px-1' : 'px-2'} py-2`}>
        <AvatarDropdown />
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#F7F7F7] dark:bg-[#0F1117]">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col bg-white dark:bg-[#1a1d27] border-r border-gray-200/60 dark:border-gray-800 transition-all duration-300 ease-in-out shrink-0 ${
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
          <div className="absolute inset-0 bg-black/50" onClick={() => { setMobileMenuOpen(false); setAvatarMenuOpen(false); }} />
          <aside className="absolute left-0 top-0 bottom-0 w-[260px] bg-white dark:bg-[#1a1d27] shadow-xl">
            <SidebarContent collapsed={false} />
          </aside>
        </div>
      )}

      {/* Floating mobile menu button */}
      <button
        onClick={() => setMobileMenuOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 h-10 w-10 rounded-xl bg-white dark:bg-[#1a1d27] shadow-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Main content - Airbnb style with generous padding and max-width */}
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto py-10 px-8 sm:px-12 lg:px-16 xl:px-20">
          <div className="max-w-[1080px] mx-auto w-full">{children}</div>
        </main>
      </div>
    </div>
  );
}
