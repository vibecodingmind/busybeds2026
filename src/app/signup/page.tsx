'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import {
  Building2, ArrowRight, Eye, EyeOff, Mail, Lock, User,
  Compass, TrendingUp, Shield, Users, ChevronRight, LogIn,
  Globe,
} from 'lucide-react';

type Mode = 'choose' | 'register' | 'login';
type Role = 'owner' | 'traveler';

const GoogleIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
);

const LinkedInIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="#0A66C2"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267-2.37 4.267-5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
);

function SocialButtons() {
  return (
    <div className="space-y-2 mb-4">
      <a href="/api/auth/google" className="w-full flex items-center justify-center gap-2 h-11 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 text-sm font-medium text-gray-700 dark:text-gray-300 transition-all active:scale-[0.98]">
        <GoogleIcon /> Continue with Google
      </a>
      <a href="/api/auth/linkedin" className="w-full flex items-center justify-center gap-2 h-11 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 text-sm font-medium text-gray-700 dark:text-gray-300 transition-all active:scale-[0.98]">
        <LinkedInIcon /> Continue with LinkedIn
      </a>
    </div>
  );
}

function Divider({ label }: { label: string }) {
  return (
    <div className="relative my-5">
      <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-200 dark:border-gray-700" /></div>
      <div className="relative flex justify-center text-xs"><span className="bg-white dark:bg-[#0F1117] px-3 text-gray-400">{label}</span></div>
    </div>
  );
}

export default function SignupPage() {
  const { login, register, refreshUser } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('choose');
  const [registerRole, setRegisterRole] = useState<Role>('owner');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regBusiness, setRegBusiness] = useState('');

  const getRedirectPath = (role: string) => {
    if (role === 'owner') return '/owner/onboard';
    return '/';
  };

  const handleLogin = async () => {
    if (!loginEmail || !loginPassword) { setError('Please fill in all fields'); return; }
    setError('');
    setSubmitting(true);
    const result = await login(loginEmail, loginPassword);
    setSubmitting(false);
    if (result.success) {
      await refreshUser();
      const meRes = await fetch('/api/auth/me');
      const meData = await meRes.json();
      router.push(getRedirectPath(meData.data?.role || 'traveler'));
    } else {
      setError(result.error || 'Login failed');
    }
  };

  const handleRegister = async () => {
    if (!regName || !regEmail || !regPassword) { setError('Please fill in all required fields'); return; }
    if (regPassword.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (regPassword !== regConfirm) { setError('Passwords do not match'); return; }
    setError('');
    setSubmitting(true);
    const result = await register({
      email: regEmail,
      password: regPassword,
      fullName: regName,
      role: registerRole,
    });
    setSubmitting(false);
    if (result.success) {
      await refreshUser();
      if (registerRole === 'owner') {
        router.push('/owner/onboard');
      } else {
        router.push('/');
      }
    } else {
      setError(result.error || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0E5C3B]/5 via-white to-white dark:from-[#0E5C3B]/10 dark:via-[#0F1117] dark:to-[#0F1117]">
      <div className="max-w-lg mx-auto px-4 py-8">

        {/* ===== CHOOSE ROLE ===== */}
        {mode === 'choose' && (
          <div className="text-center">
            <div className="w-20 h-20 rounded-3xl bg-[#0E5C3B] dark:bg-[#10b981] flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[#0E5C3B]/20">
              <Building2 className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-3">
              Join BusyBeds
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8 text-lg">
              Whether you own a hotel or love traveling, we have you covered
            </p>

            <div className="grid grid-cols-3 gap-3 mb-8">
              {[
                { icon: TrendingUp, label: 'Boost Revenue' },
                { icon: Shield, label: 'Trusted Platform' },
                { icon: Globe, label: 'Reach Africa' },
              ].map(b => (
                <div key={b.label} className="p-3 rounded-xl bg-white dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50">
                  <b.icon className="h-5 w-5 text-[#0E5C3B] dark:text-[#10b981] mx-auto mb-1.5" />
                  <p className="text-[11px] font-medium text-gray-600 dark:text-gray-400">{b.label}</p>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <button
                onClick={() => { setRegisterRole('owner'); setMode('register'); }}
                className="group w-full p-6 rounded-2xl border-2 border-gray-200 dark:border-gray-700 hover:border-[#0E5C3B] dark:hover:border-[#10b981] bg-white dark:bg-gray-900 text-left transition-all hover:shadow-xl hover:shadow-[#0E5C3B]/10"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#0E5C3B]/10 dark:bg-[#10b981]/10 flex items-center justify-center shrink-0">
                    <Building2 className="h-7 w-7 text-[#0E5C3B] dark:text-[#10b981]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">I own a hotel</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">List your hotel, offer discount coupons, manage bookings</p>
                  </div>
                  <ChevronRight className="h-6 w-6 text-gray-300 group-hover:text-[#0E5C3B] dark:group-hover:text-[#10b981] shrink-0 group-hover:translate-x-1 transition-all" />
                </div>
              </button>

              <button
                onClick={() => { setRegisterRole('traveler'); setMode('register'); }}
                className="group w-full p-6 rounded-2xl border-2 border-gray-200 dark:border-gray-700 hover:border-[#C8932A] dark:hover:border-[#C8932A] bg-white dark:bg-gray-900 text-left transition-all hover:shadow-xl hover:shadow-[#C8932A]/10"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#C8932A]/10 flex items-center justify-center shrink-0">
                    <Compass className="h-7 w-7 text-[#C8932A]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">I want hotel deals</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Find exclusive discount coupons for hotels across Africa</p>
                  </div>
                  <ChevronRight className="h-6 w-6 text-gray-300 group-hover:text-[#C8932A] shrink-0 group-hover:translate-x-1 transition-all" />
                </div>
              </button>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800">
              <p className="text-gray-500 dark:text-gray-400">
                Already have an account?{' '}
                <button onClick={() => { setError(''); setMode('login'); }} className="text-[#0E5C3B] dark:text-[#10b981] font-bold hover:underline">
                  Log in
                </button>
              </p>
            </div>
          </div>
        )}

        {/* ===== REGISTER FORM ===== */}
        {mode === 'register' && (
          <div>
            <div className="text-center mb-6">
              <div className={`w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center ${registerRole === 'owner' ? 'bg-[#0E5C3B]/10 dark:bg-[#10b981]/10' : 'bg-[#C8932A]/10'}`}>
                {registerRole === 'owner' ? (
                  <Building2 className="h-7 w-7 text-[#0E5C3B] dark:text-[#10b981]" />
                ) : (
                  <Compass className="h-7 w-7 text-[#C8932A]" />
                )}
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {registerRole === 'owner' ? 'Create your Host account' : 'Create your account'}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {registerRole === 'owner' ? 'Start listing your hotel in minutes' : 'Find the best hotel deals across Africa'}
              </p>
            </div>

            <SocialButtons />
            <Divider label="or sign up with email" />

            {error && <div className="p-3 mb-4 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-xl">{error}</div>}

            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Full Name *</Label>
                <div className="relative mt-1.5">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input value={regName} onChange={e => setRegName(e.target.value)} placeholder="Your full name" className="pl-10 h-11 rounded-xl" />
                </div>
              </div>

              {registerRole === 'owner' && (
                <>
                  <div>
                    <Label className="text-sm font-medium">Business / Hotel Name</Label>
                    <div className="relative mt-1.5">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input value={regBusiness} onChange={e => setRegBusiness(e.target.value)} placeholder="e.g. Serena Hotels Group" className="pl-10 h-11 rounded-xl" />
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Phone Number</Label>
                    <div className="relative mt-1.5">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">+</span>
                      <Input value={regPhone} onChange={e => setRegPhone(e.target.value)} placeholder="255 7XX XXX XXX" className="pl-8 h-11 rounded-xl" />
                    </div>
                  </div>
                </>
              )}

              <div>
                <Label className="text-sm font-medium">Email *</Label>
                <div className="relative mt-1.5">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input type="email" value={regEmail} onChange={e => setRegEmail(e.target.value)} placeholder="you@example.com" className="pl-10 h-11 rounded-xl" />
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Password *</Label>
                <div className="relative mt-1.5">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input type={showPassword ? 'text' : 'password'} value={regPassword} onChange={e => setRegPassword(e.target.value)} placeholder="At least 6 characters" className="pl-10 pr-10 h-11 rounded-xl" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Confirm Password *</Label>
                <div className="relative mt-1.5">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input type={showPassword ? 'text' : 'password'} value={regConfirm} onChange={e => setRegConfirm(e.target.value)} placeholder="Repeat your password" className="pl-10 h-11 rounded-xl" />
                </div>
              </div>

              <Button
                onClick={handleRegister}
                disabled={submitting}
                className={`w-full h-12 text-white font-bold rounded-xl text-base ${registerRole === 'owner' ? 'bg-[#0E5C3B] hover:bg-[#0E5C3B]/90' : 'bg-[#C8932A] hover:bg-[#C8932A]/90'}`}
              >
                {submitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating account...
                  </div>
                ) : (
                  <>
                    {registerRole === 'owner' ? 'Create Host Account' : 'Create Account'}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>

            <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-800 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Already have an account?{' '}
                <button onClick={() => { setError(''); setMode('login'); }} className="text-[#0E5C3B] dark:text-[#10b981] font-bold hover:underline">
                  Log in
                </button>
              </p>
            </div>

            <button
              onClick={() => { setError(''); setMode('choose'); }}
              className="mt-3 text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex items-center gap-1 mx-auto"
            >
              &larr; Back to role selection
            </button>
          </div>
        )}

        {/* ===== LOGIN FORM ===== */}
        {mode === 'login' && (
          <div>
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-[#0E5C3B]/10 dark:bg-[#10b981]/10 flex items-center justify-center mx-auto mb-4">
                <LogIn className="h-7 w-7 text-[#0E5C3B] dark:text-[#10b981]" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Welcome back</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Log in to your BusyBeds account</p>
            </div>

            <SocialButtons />
            <Divider label="or log in with email" />

            {error && <div className="p-3 mb-4 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-xl">{error}</div>}

            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Email</Label>
                <div className="relative mt-1.5">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} placeholder="you@example.com" className="pl-10 h-11 rounded-xl" />
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center">
                  <Label className="text-sm font-medium">Password</Label>
                  <Link href="/forgot-password" className="text-xs text-[#0E5C3B] dark:text-[#10b981] hover:underline">Forgot password?</Link>
                </div>
                <div className="relative mt-1.5">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input type={showPassword ? 'text' : 'password'} value={loginPassword} onChange={e => setLoginPassword(e.target.value)} placeholder="Enter your password" className="pl-10 pr-10 h-11 rounded-xl" onKeyDown={e => { if (e.key === 'Enter') handleLogin(); }} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button onClick={handleLogin} disabled={submitting} className="w-full h-12 bg-[#0E5C3B] hover:bg-[#0E5C3B]/90 text-white font-bold rounded-xl text-base">
                {submitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Logging in...
                  </div>
                ) : (<>Log In <ArrowRight className="h-4 w-4 ml-2" /></>)}
              </Button>
            </div>

            <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-800 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Don&apos;t have an account?{' '}
                <button onClick={() => { setError(''); setMode('choose'); }} className="text-[#0E5C3B] dark:text-[#10b981] font-bold hover:underline">
                  Sign up
                </button>
              </p>
            </div>

            <button
              onClick={() => { setError(''); setMode('choose'); }}
              className="mt-3 text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex items-center gap-1 mx-auto"
            >
              &larr; Back to role selection
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
