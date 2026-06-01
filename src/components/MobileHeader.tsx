'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/context/NotificationContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Bell, Menu, X, Sun, Moon, User, Heart, MessageSquare, Settings, LogOut, Shield, Building2, Search } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useState } from 'react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function MobileHeader() {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const { theme, setTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header className="lg:hidden sticky top-0 z-50 w-full bg-white dark:bg-[#1a1d27] safe-area-top">
        <div className="flex h-14 items-center justify-between px-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-[#0E5C3B] text-xl">🛏️</span>
            <span className="text-[#1a1a2e] dark:text-white font-extrabold text-lg tracking-tight">BusyBeds</span>
          </Link>

          {/* Right actions */}
          <div className="flex items-center gap-1">
            {user && (
              <Link href="/notifications">
                <Button variant="ghost" size="icon" className="relative h-9 w-9 text-gray-500">
                  <Bell className="h-4.5 w-4.5" />
                  {unreadCount > 0 && (
                    <Badge className="absolute -top-0.5 -right-0.5 h-4 min-w-4 rounded-full p-0 flex items-center justify-center text-[9px] bg-red-500 text-white">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </Badge>
                  )}
                </Button>
              </Link>
            )}

            <Button variant="ghost" size="icon" className="h-9 w-9 text-gray-500" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-9 w-9 rounded-full p-0 ml-0.5">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-red-500 text-white text-xs font-bold">
                        {user.fullName?.charAt(0)?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-52" align="end">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium truncate">{user.fullName}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild><Link href="/profile"><User className="mr-2 h-4 w-4" /> Dashboard</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link href="/favorites"><Heart className="mr-2 h-4 w-4" /> Favorites</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link href="/messages"><MessageSquare className="mr-2 h-4 w-4" /> Messages</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link href="/settings"><Settings className="mr-2 h-4 w-4" /> Settings</Link></DropdownMenuItem>
                  {['owner', 'manager'].includes(user.role) && (
                    <DropdownMenuItem asChild><Link href="/owner"><Building2 className="mr-2 h-4 w-4" /> Hotel Portal</Link></DropdownMenuItem>
                  )}
                  {user.role === 'admin' && (
                    <DropdownMenuItem asChild><Link href="/admin"><Shield className="mr-2 h-4 w-4" /> Admin Panel</Link></DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-red-500"><LogOut className="mr-2 h-4 w-4" /> Log out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/login">
                <Button size="sm" className="bg-red-500 hover:bg-red-600 text-white rounded-full px-4 text-xs font-semibold h-8">
                  Sign up
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
