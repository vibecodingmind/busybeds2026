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
  {
    label: 'Admin',
    email: 'admin@busybeds.com',
    password: 'Admin123!',
    role: 'Full access to admin panel, manage hotels, users, coupons',
    icon: Shield,
    color: 'bg-red-500',
  },
  {
    label: 'Hotel Owner',
    email: 'owner@busybeds.com',
    password: 'Owner123!',
    role: 'Manage your hotel listings, view bookings & analytics',
    icon: Building2,
    color: 'bg-[#0E5C3B]',
  },
  {
    label: 'Guest',
    email: 'amina.hassan@example.com',
    password: 'Password123!',
    role: 'Browse hotels, generate coupons, manage subscriptions',
    icon: User,
    color: 'bg-[#C8932A]',
  },
];

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(email, password);
    if (result.success) {
      router.push('/profile');
    } else {
      setError(result.error || 'Login failed');
    }
    setLoading(false);
  };

  const handleDemoLogin = async (demoEmail: string, demoPassword: string) => {
    setError('');
    setLoading(true);
    const result = await login(demoEmail, demoPassword);
    if (result.success) {
      router.push('/profile');
    } else {
      setError(result.error || 'Demo login failed');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md space-y-6">
        {/* Login Form */}
        <Card>
          <CardHeader className="text-center">
            <div className="text-3xl mb-2">🛏️</div>
            <CardTitle className="text-2xl">Welcome back</CardTitle>
            <CardDescription>Log in to your BusyBeds account</CardDescription>
          </CardHeader>
          <CardContent>
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
              <button
                key={account.label}
                onClick={() => handleDemoLogin(account.email, account.password)}
                disabled={loading}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-[0.98] transition-all text-left disabled:opacity-50"
              >
                <div className={`w-10 h-10 rounded-full ${account.color} flex items-center justify-center shrink-0`}>
                  <account.icon className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm text-gray-900 dark:text-white">{account.label}</p>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 font-mono">{account.email}</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">{account.role}</p>
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
