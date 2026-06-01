use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Building2, Ticket, DollarSign, TrendingUp, TrendingDown, Handshake, MapPin } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import type { AdminAnalytics } from '@/types';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/analytics').then(r => r.json()).then(d => { setStats(d.data); setLoading(false); });
  }, []);

  const statCards = [
    { label: 'Total Users', value: (stats?.totalUsers || 0).toLocaleString(), icon: Users, color: 'bg-blue-500', change: '+12%', up: true },
    { label: 'Partner Hotels', value: (stats?.partnerHotels || 0).toLocaleString(), icon: Handshake, color: 'bg-[#ea4d60]', change: '+8%', up: true },
    { label: 'Active Coupons', value: (stats?.totalCoupons || 0).toLocaleString(), icon: Ticket, color: 'bg-emerald-500', change: '+23%', up: true },
    { label: 'Monthly Revenue', value: `$${(stats?.monthlyRevenue || 0).toLocaleString()}`, icon: DollarSign, color: 'bg-[#C8932A]', change: '+5%', up: true },
  ];

  // Simple bar chart data - coupons by month (last 6 months)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const barData = [35, 52, 41, 68, 55, stats?.totalCoupons || 72];
  const maxBar = Math.max(...barData);

  // Hotels by region
  const regionData = [
    { country: 'Tanzania', count: 0, color: '#ea4d60' },
    { country: 'Kenya', count: 0, color: '#3b82f6' },
    { country: 'Zanzibar', count: 0, color: '#10b981' },
    { country: 'Uganda', count: 0, color: '#C8932A' },
    { country: 'Rwanda', count: 0, color: '#8b5cf6' },
  ];

  // Hotels by partnership
  const partnerCount = stats?.partnerHotels || 0;
  const listingCount = stats?.listingOnlyHotels || 0;
  const totalHotels = partnerCount + listingCount;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Welcome back, here&apos;s what&apos;s happening today</p>
        </div>
        <div className="flex items-center gap-2">
          <select className="text-sm border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300">
            <option>Last 30 days</option>
            <option>Last 7 days</option>
            <option>Last 90 days</option>
          </select>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {loading ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />) :
          statCards.map(card => (
            <Card key={card.label} className="rounded-xl border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{card.label}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{card.value}</p>
                  </div>
                  <div className={`w-10 h-10 rounded-xl ${card.color} flex items-center justify-center`}>
                    <card.icon className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-2">
                  {card.up ? <TrendingUp className="h-3.5 w-3.5 text-emerald-500" /> : <TrendingDown className="h-3.5 w-3.5 text-red-500" />}
                  <span className={`text-xs font-medium ${card.up ? 'text-emerald-500' : 'text-red-500'}`}>{card.change}</span>
                  <span className="text-xs text-gray-400 ml-1">vs last month</span>
                </div>
              </CardContent>
            </Card>
          ))
        }
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        {/* Coupons by Month - Bar Chart */}
        <Card className="rounded-xl border-0 shadow-sm lg:col-span-2">
          <CardContent className="p-5">
            <h3 className="font-semibold text-sm text-gray-900 dark:text-white mb-4">Coupons Generated</h3>
            <div className="flex items-end gap-3 h-48">
              {barData.map((val, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] text-gray-400 font-medium">{val}</span>
                  <div className="w-full rounded-t-md transition-all duration-500" style={{
                    height: `${(val / maxBar) * 100}%`,
                    background: i === barData.length - 1 ? '#ea4d60' : '#ea4d6033',
                    minHeight: '8px'
                  }} />
                  <span className="text-[10px] text-gray-400">{months[i]}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Hotels by Partnership - Donut */}
        <Card className="rounded-xl border-0 shadow-sm">
          <CardContent className="p-5">
            <h3 className="font-semibold text-sm text-gray-900 dark:text-white mb-4">Hotels by Partnership</h3>
            <div className="flex items-center justify-center mb-4">
              <div className="relative w-32 h-32">
                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                  <circle cx="18" cy="18" r="14" fill="none" stroke="#ea4d6020" strokeWidth="4" />
                  <circle cx="18" cy="18" r="14" fill="none" stroke="#ea4d60" strokeWidth="4"
                    strokeDasharray={`${totalHotels > 0 ? (partnerCount / totalHotels) * 88 : 0} 88`}
                    strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-bold text-gray-900 dark:text-white">{totalHotels}</span>
                  <span className="text-[10px] text-gray-400">Total</span>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-[#ea4d60]" /><span className="text-xs text-gray-600 dark:text-gray-300">Partner (Active)</span></div>
                <span className="text-xs font-semibold">{partnerCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-[#ea4d6020]" /><span className="text-xs text-gray-600 dark:text-gray-300">Listing Only</span></div>
                <span className="text-xs font-semibold">{listingCount}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card className="rounded-xl border-0 shadow-sm">
          <CardContent className="p-5">
            <h3 className="font-semibold text-sm text-gray-900 dark:text-white mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/admin/hotels/import">
                <Button variant="outline" className="w-full h-auto py-3 flex-col gap-1.5 rounded-xl border-dashed hover:border-[#ea4d60] hover:text-[#ea4d60]">
                  <MapPin className="h-5 w-5" />
                  <span className="text-xs">Import Hotels</span>
                </Button>
              </Link>
              <Link href="/admin/users">
                <Button variant="outline" className="w-full h-auto py-3 flex-col gap-1.5 rounded-xl border-dashed hover:border-[#ea4d60] hover:text-[#ea4d60]">
                  <Users className="h-5 w-5" />
                  <span className="text-xs">Manage Users</span>
                </Button>
              </Link>
              <Link href="/admin/coupons">
                <Button variant="outline" className="w-full h-auto py-3 flex-col gap-1.5 rounded-xl border-dashed hover:border-[#ea4d60] hover:text-[#ea4d60]">
                  <Ticket className="h-5 w-5" />
                  <span className="text-xs">View Coupons</span>
                </Button>
              </Link>
              <Link href="/admin/settings">
                <Button variant="outline" className="w-full h-auto py-3 flex-col gap-1.5 rounded-xl border-dashed hover:border-[#ea4d60] hover:text-[#ea4d60]">
                  <DollarSign className="h-5 w-5" />
                  <span className="text-xs">Revenue</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Today's Activity */}
        <Card className="rounded-xl border-0 shadow-sm">
          <CardContent className="p-5">
            <h3 className="font-semibold text-sm text-gray-900 dark:text-white mb-4">Today&apos;s Activity</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center"><Users className="h-4 w-4 text-blue-500" /></div>
                  <span className="text-sm text-gray-600 dark:text-gray-300">New Users</span>
                </div>
                <span className="text-sm font-semibold">{stats?.usersToday || 0}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#ea4d60]/10 flex items-center justify-center"><Ticket className="h-4 w-4 text-[#ea4d60]" /></div>
                  <span className="text-sm text-gray-600 dark:text-gray-300">Coupons Generated</span>
                </div>
                <span className="text-sm font-semibold">{stats?.couponsToday || 0}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center"><TrendingUp className="h-4 w-4 text-emerald-500" /></div>
                  <span className="text-sm text-gray-600 dark:text-gray-300">Redemptions</span>
                </div>
                <span className="text-sm font-semibold">{stats?.redemptionsToday || 0}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#C8932A]/10 flex items-center justify-center"><Building2 className="h-4 w-4 text-[#C8932A]" /></div>
                  <span className="text-sm text-gray-600 dark:text-gray-300">Active Hotels</span>
                </div>
                <span className="text-sm font-semibold">{stats?.totalHotels || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
