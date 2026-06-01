'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/context/NotificationContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useTheme } from 'next-themes';
import {
  Sun, Moon, Bell, Heart, MessageSquare, User, Settings,
  LogOut, Shield, Building2, Package, Compass, Home, Globe
} from 'lucide-react';

export function Navbar() {
  const { user, loading, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const { theme, setTheme } = useTheme();

  return (
    <header className="hidden lg:flex sticky top-0 z-50 w-full bg-white dark:bg-[#1a1d27] border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="max-w-[1440px] mx-auto flex h-16 items-center justify-between px-8 w-full">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl shrink-0">
          <span className="text-[#0E5C3B] text-2xl">🛏️</span>
          <span className="text-[#1a1a2e] dark:text-white font-extrabold tracking-tight">BusyBeds</span>
        </Link>

        {/* Center Nav Links */}
        <nav className="flex items-center gap-1">
          <Link href="/" className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-gray-600 hover:text-[#0E5C3B] hover:bg-gray-50 transition-colors">
            <Home className="h-4 w-4" /> Home
          </Link>
          <Link href="/packages" className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-gray-600 hover:text-[#0E5C3B] hover:bg-gray-50 transition-colors">
            <Package className="h-4 w-4" /> Packages
          </Link>
          <Link href="/things-to-do" className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-gray-600 hover:text-[#0E5C3B] hover:bg-gray-50 transition-colors">
            <Compass className="h-4 w-4" /> Things To Do
          </Link>
          <Link href="/become-host" className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-[#0E5C3B] text-white hover:bg-[#0a4d31] transition-colors">
            <Building2 className="h-4 w-4" /> Become a Host
          </Link>
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="ghost" size="sm" className="flex items-center gap-1 text-gray-500 text-xs">
            <Globe className="h-3.5 w-3.5" /> EN
          </Button>

          <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="text-gray-500">
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          {user ? (
            <>
              <Link href="/notifications">
                <Button variant="ghost" size="icon" className="relative text-gray-500">
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px] bg-red-500 text-white">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </Badge>
                  )}
                </Button>
              </Link>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-red-500 text-white text-sm font-bold">
                        {user.fullName?.charAt(0)?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{user.fullName}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile"><User className="mr-2 h-4 w-4" /> Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/favorites"><Heart className="mr-2 h-4 w-4" /> Favorites</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/messages"><MessageSquare className="mr-2 h-4 w-4" /> Messages</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings"><Settings className="mr-2 h-4 w-4" /> Settings</Link>
                  </DropdownMenuItem>
                  {['owner', 'manager'].includes(user.role) && (
                    <DropdownMenuItem asChild>
                      <Link href="/owner"><Building2 className="mr-2 h-4 w-4" /> Hotel Portal</Link>
                    </DropdownMenuItem>
                  )}
                  {user.role === 'admin' && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin"><Shield className="mr-2 h-4 w-4" /> Admin Panel</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-red-500">
                    <LogOut className="mr-2 h-4 w-4" /> Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login"><Button variant="ghost" size="sm" className="text-sm font-medium text-gray-600">Log in</Button></Link>
              <Link href="/register"><Button size="sm" className="bg-red-500 hover:bg-red-600 text-white rounded-full px-5 text-sm font-medium">Sign up</Button></Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
