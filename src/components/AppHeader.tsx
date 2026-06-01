'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/context/NotificationContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Bell, Sun, Moon, User, Heart, MessageSquare, Settings, LogOut, Shield, Building2, Search } from 'lucide-react';
import { useTheme } from 'next-themes';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

/**
 * AppHeader — Unified compact header for ALL screen sizes.
 * Search bar integrated in the same row as logo + icons.
 */
export function AppHeader() {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const { theme, setTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = () => {
    if (searchQuery.trim()) {
      window.location.href = `/hotels?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 dark:bg-[#1a1d27]/95 backdrop-blur-xl border-b border-gray-200/80 dark:border-gray-700/60 safe-area-top">
      <div className="grid grid-cols-[auto_1fr_auto] h-14 items-center gap-3 px-3 sm:px-4 lg:px-8 max-w-[1440px] mx-auto w-full">
        {/* Logo — left-aligned to content edge */}
        <Link href="/" className="flex items-center shrink-0">
          <img src="/logo.svg" alt="BusyBeds" className="h-8 w-auto" />
          </span>
        </Link>

        {/* Search Bar — centered in the middle */}
        <div className="relative w-full max-w-xl mx-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search hotels, cities..."
            className="pl-9 h-9 w-full bg-gray-100 dark:bg-gray-800 border-0 rounded-full text-sm focus:ring-2 focus:ring-[#0E5C3B]"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleSearch(); }}
          />
        </div>

        {/* Right actions — right-aligned to content edge */}
        <div className="flex items-center gap-1 shrink-0 justify-end">
          {user && (
            <Link href="/notifications">
              <Button variant="ghost" size="icon" className="relative h-9 w-9 text-gray-500 hover:text-[#0E5C3B] dark:hover:text-[#10b981]">
                <Bell className="h-[18px] w-[18px]" />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-0.5 -right-0.5 h-4 min-w-4 rounded-full p-0 flex items-center justify-center text-[9px] bg-red-500 text-white border-2 border-white dark:border-[#1a1d27]">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Badge>
                )}
              </Button>
            </Link>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-gray-500 hover:text-[#0E5C3B] dark:hover:text-[#10b981]"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
          </Button>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-9 w-9 rounded-full p-0 ml-0.5 hover:ring-2 hover:ring-[#0E5C3B]/30 dark:hover:ring-[#10b981]/30 transition-all">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-[#0E5C3B] dark:bg-[#10b981] text-white text-xs font-bold">
                      {user.fullName?.charAt(0)?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-semibold truncate">{user.fullName}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex items-center gap-2"><User className="h-4 w-4" /> Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/favorites" className="flex items-center gap-2"><Heart className="h-4 w-4" /> Favorites</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/messages" className="flex items-center gap-2"><MessageSquare className="h-4 w-4" /> Messages</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="flex items-center gap-2"><Settings className="h-4 w-4" /> Settings</Link>
                </DropdownMenuItem>
                {['owner', 'manager'].includes(user.role) && (
                  <DropdownMenuItem asChild>
                    <Link href="/owner" className="flex items-center gap-2"><Building2 className="h-4 w-4" /> Hotel Portal</Link>
                  </DropdownMenuItem>
                )}
                {user.role === 'admin' && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin" className="flex items-center gap-2"><Shield className="h-4 w-4" /> Admin Panel</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-red-500 flex items-center gap-2">
                  <LogOut className="h-4 w-4" /> Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-1.5">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-xs font-medium text-gray-600 dark:text-gray-400 h-8 px-3">
                  Log in
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="bg-[#0E5C3B] hover:bg-[#0a4d31] dark:bg-[#10b981] dark:hover:bg-[#059669] text-white rounded-full px-4 text-xs font-semibold h-8 active:scale-95 transition-all">
                  Sign up
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
