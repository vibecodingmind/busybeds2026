'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Mail, Lock, ArrowRight, Shield, User, Building2, Zap } from 'lucide-react';

const DEMO_ACCOUNTS = [
  { label: 'Admin', email: 'admin@busybeds.com', password: 'Admin123!', role: 'admin', description: 'Full access to admin panel', icon: Shield, color: 'bg-red-500' },
  { label: 'Hotel Owner', email: 'owner@busybeds.com', password: 'Owner123!', role: 'owner', description: 'Manage hotel listings & analytics', icon: Building2, color: 'bg-[#0E5C3B]' },
  { label: 'Guest', email: 'amina.hassan@example.com', password: 'Password123!', role: 'traveler', description: 'Browse hotels, generate coupons', icon: User, color: 'bg-[#C8932A]' },
];

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const getRedirectPath = (role: string) => {
    if (role === 'admin') return '/admin/dashboard';
    if (role === 'owner' || role === 'manager') return '/owner/dashboard';
    return '/profile';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(email, password);
    if (result.success) {
      const meRes = await fetch('/api/auth/me');
      const meData = await meRes.json();
      router.push(getRedirectPath(meData.data?.role || 'traveler'));
    } else { setError(result.error || 'Login failed'); }
    setLoading(false);
  };

  const handleDemoLogin = async (demoEmail: string, demoPassword: string, expectedRole: string) => {
    setError('');
    setLoading(true);
    const result = await login(demoEmail, demoPassword);
    if (result.success) {
      router.push(getRedirectPath(expectedRole));
    } else { setError(result.error || 'Demo login failed'); }
    setLoading(false);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md space-y-5">
        <Card>
          <CardHeader className="text-center">
            <img src="/logo.svg" alt="BusyBeds" className="h-12 w-auto mx-auto mb-2" />
            <CardTitle className="text-2xl">Welcome back</CardTitle>
            <CardDescription>Log in to your BusyBeds account</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Social Login Buttons */}
            <div className="space-y-2 mb-4">
              <a href="/api/auth/google" className="w-full flex items-center justify-center gap-2 h-10 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 text-sm font-medium text-gray-700 dark:text-gray-300 transition-all active:scale-[0.98]">
                <svg className="h-4 w-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                Continue with Google
              </a>
              <a href="/api/auth/linkedin" className="w-full flex items-center justify-center gap-2 h-10 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 text-sm font-medium text-gray-700 dark:text-gray-300 transition-all active:scale-[0.98]">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="#0A66C2"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                Continue with LinkedIn
              </a>
            </div>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-200 dark:border-gray-700" /></div>
              <div className="relative flex justify-center text-xs"><span className="bg-white dark:bg-card px-2 text-gray-500">or continue with email</span></div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg">{error}</div>}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="email" type="email" placeholder="you@example.com" className="pl-10" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link href="/forgot-password" className="text-xs text-emerald hover:underline">Forgot password?</Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="password" type="password" placeholder="Enter password" className="pl-10" value={password} onChange={e => setPassword(e.target.value)} required />
                </div>
              </div>
              <Button type="submit" className="w-full bg-emerald hover:bg-emerald/90 text-emerald-foreground" disabled={loading}>
                {loading ? 'Logging in...' : <>Log in <ArrowRight className="ml-2 h-4 w-4" /></>}
              </Button>
            </form>
            <div className="mt-4 text-center text-sm text-muted-foreground">
              Don&apos;t have an account? <Link href="/register" className="text-emerald hover:underline font-medium">Sign up</Link>
            </div>
          </CardContent>
        </Card>

        {/* Demo Quick Login Section */}
        <Card className="border-dashed border-2 border-[#0E5C3B]/30 dark:border-[#10b981]/30">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-[#C8932A]" />
              <CardTitle className="text-base font-bold">Quick Demo Login</CardTitle>
            </div>
            <CardDescription className="text-xs">Click any role below to instantly log in and explore</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {DEMO_ACCOUNTS.map(account => (
              <button key={account.label} onClick={() => handleDemoLogin(account.email, account.password, account.role)} disabled={loading}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-[0.98] transition-all text-left disabled:opacity-50">
                <div className={`w-10 h-10 rounded-full ${account.color} flex items-center justify-center shrink-0`}>
                  <account.icon className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm text-gray-900 dark:text-white">{account.label}</p>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 font-mono">{account.email}</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">{account.description}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400 shrink-0" />
              </button>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
