'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import {
  Users, Building2, Ticket, DollarSign, CreditCard, BarChart3, Star, Zap,
  Shield, Bell, FileText, Gift, Globe, Settings, AlertTriangle, MessageSquare,
  Map, Briefcase, LogOut, Menu, X, ChevronLeft, ChevronRight, Mail, Megaphone,
  HelpCircle, Activity
} from 'lucide-react';

const NAV_GROUPS = [
  {
    label: 'MANAGEMENT',
    items: [
      { href: '/admin/dashboard', icon: BarChart3, label: 'Dashboard' },
      { href: '/admin/users', icon: Users, label: 'Users' },
      { href: '/admin/hotels', icon: Building2, label: 'Hotels' },
      { href: '/admin/hotels/import', icon: Globe, label: 'Import Hotels' },
    ],
  },
  {
    label: 'OPERATIONS',
    items: [
      { href: '/admin/coupons', icon: Ticket, label: 'Coupons' },
      { href: '/admin/subscriptions', icon: CreditCard, label: 'Subscriptions' },
      { href: '/admin/revenue', icon: DollarSign, label: 'Revenue' },
      { href: '/admin/flash-deals', icon: Zap, label: 'Flash Deals' },
    ],
  },
  {
    label: 'MARKETING',
    items: [
      { href: '/admin/gift-cards', icon: Gift, label: 'Gift Cards' },
      { href: '/admin/email-campaigns', icon: Mail, label: 'Emails' },
      { href: '/admin/sms', icon: MessageSquare, label: 'SMS' },
      { href: '/admin/blogs', icon: FileText, label: 'Blog' },
      { href: '/admin/faq', icon: HelpCircle, label: 'FAQ' },
      { href: '/admin/broadcast', icon: Megaphone, label: 'Broadcast' },
    ],
  },
  {
    label: 'SYSTEM',
    items: [
      { href: '/admin/settings', icon: Settings, label: 'Settings' },
      { href: '/admin/fraud', icon: AlertTriangle, label: 'Fraud' },
      { href: '/admin/stay-requests', icon: Map, label: 'Stay Requests' },
      { href: '/admin/activities', icon: Activity, label: 'Activities' },
    ],
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.push('/');
      return;
    }
  }, [user, authLoading]);

  if (authLoading || !user || user.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-[#0F1117]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#ea4d60] flex items-center justify-center animate-pulse">
            <span className="text-white font-bold text-lg">%</span>
          </div>
          <p className="text-sm text-muted-foreground">Loading admin...</p>
        </div>
      </div>
    );
  }

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const sidebarContent = (isMobile = false) => (
    <>
      {/* Logo area */}
      <div className={`flex items-center ${collapsed && !isMobile ? 'justify-center px-2' : 'px-4'} h-16 border-b border-border shrink-0`}>
        {collapsed && !isMobile ? (
          <img src="/favicon.svg" alt="BusyBeds" className="h-8 w-8" />
        ) : (
          <div className="flex items-center gap-2">
            <img src="/logo.svg" alt="BusyBeds" className="h-7 w-auto" />
            <span className="font-bold text-sm" style={{ color: '#ea4d60' }}>Admin</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2" style={{ scrollbarWidth: 'thin' }}>
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="mb-3">
            {(!collapsed || isMobile) && (
              <p className="px-3 mb-1 text-[10px] font-semibold tracking-wider text-muted-foreground/60 uppercase">
                {group.label}
              </p>
            )}
            {group.items.map((item) => {
              const active = isActive(item.href);
              const linkContent = (
                <Link
                  href={item.href}
                  onClick={() => isMobile && setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-lg text-sm transition-all duration-150 ${
                    collapsed && !isMobile ? 'justify-center px-2 py-2.5' : 'px-3 py-2'
                  } ${
                    active
                      ? 'bg-[#ea4d60]/10 text-[#ea4d60] font-semibold'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <item.icon className={`h-4 w-4 shrink-0 ${active ? 'text-[#ea4d60]' : ''}`} />
                  {(!collapsed || isMobile) && <span className="truncate">{item.label}</span>}
                </Link>
              );

              if (collapsed && !isMobile) {
                return (
                  <Tooltip key={item.href} delayDuration={0}>
                    <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                    <TooltipContent side="right" className="font-medium">
                      {item.label}
                    </TooltipContent>
                  </Tooltip>
                );
              }

              return <div key={item.href}>{linkContent}</div>;
            })}
          </div>
        ))}
      </nav>

      {/* User section */}
      <div className={`border-t border-border pt-3 pb-3 shrink-0 ${collapsed && !isMobile ? 'px-2' : 'px-3'}`}>
        {collapsed && !isMobile ? (
          <div className="flex flex-col items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs bg-[#ea4d60]/10 text-[#ea4d60]">
                {getInitials(user.fullName)}
              </AvatarFallback>
            </Avatar>
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-[#ea4d60]"
                  onClick={async () => { await logout(); router.push('/login'); }}
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Sign Out</TooltipContent>
            </Tooltip>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2.5 mb-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs bg-[#ea4d60]/10 text-[#ea4d60]">
                  {getInitials(user.fullName)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{user.fullName}</p>
                <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-muted-foreground hover:text-[#ea4d60] h-8 text-xs"
              onClick={async () => { await logout(); router.push('/login'); }}
            >
              <LogOut className="h-3.5 w-3.5 mr-2" /> Sign Out
            </Button>
          </>
        )}
      </div>
    </>
  );

  return (
    <TooltipProvider>
      <div className="flex min-h-screen bg-gray-50 dark:bg-[#0F1117]">
        {/* Desktop Sidebar */}
        <aside
          className={`hidden lg:flex flex-col border-r border-border bg-white dark:bg-[#1a1d27] transition-all duration-300 ease-in-out shrink-0 ${
            collapsed ? 'w-16' : 'w-60'
          }`}
        >
          {sidebarContent(false)}

          {/* Collapse toggle */}
          <div className="border-t border-border px-2 py-2 shrink-0">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-center text-muted-foreground hover:text-foreground h-8"
              onClick={() => setCollapsed(!collapsed)}
            >
              {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          </div>
        </aside>

        {/* Mobile overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
            <aside className="absolute left-0 top-0 bottom-0 w-72 bg-white dark:bg-[#1a1d27] flex flex-col shadow-xl">
              <div className="flex items-center justify-between px-4 h-16 border-b border-border">
                <div className="flex items-center gap-2">
                  <img src="/logo.svg" alt="BusyBeds" className="h-7 w-auto" />
                  <span className="font-bold text-sm" style={{ color: '#ea4d60' }}>Admin</span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)} className="h-8 w-8">
                  <X className="h-4 w-4" />
                </Button>
              </div>
              {sidebarContent(true)}
            </aside>
          </div>
        )}

        {/* Main content */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* Mobile header */}
          <div className="lg:hidden flex items-center gap-3 px-4 h-14 border-b border-border bg-white dark:bg-[#1a1d27] shrink-0">
            <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(true)} className="h-9 w-9">
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <img src="/favicon.svg" alt="BusyBeds" className="h-6 w-6" />
              <span className="font-bold text-sm" style={{ color: '#ea4d60' }}>Admin</span>
            </div>
          </div>

          {/* Page content */}
          <main className="flex-1 p-4 md:p-6 max-w-full overflow-x-auto">
            {children}
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}
