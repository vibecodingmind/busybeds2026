'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function VerifyEmailPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  useEffect(() => {
    async function verify() {
      if (!token) { setStatus('error'); return; }
      try {
        const res = await fetch('/api/auth/verify-email', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token }) });
        const data = await res.json();
        setStatus(data.success ? 'success' : 'error');
      } catch { setStatus('error'); }
    }
    verify();
  }, [token]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <Card className="w-full max-w-md text-center">
        <CardContent className="py-12">
          {status === 'loading' && <><div className="text-4xl mb-4 animate-pulse">⏳</div><h2 className="text-2xl font-bold">Verifying...</h2></>}
          {status === 'success' && <>
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-2xl font-bold mb-2">Email Verified!</h2>
            <p className="text-muted-foreground mb-6">Your email has been verified. Choose a plan to start saving!</p>
            <div className="flex gap-3 justify-center">
              <Button className="bg-emerald hover:bg-emerald/90 text-emerald-foreground" onClick={() => router.push('/subscribe')}>Choose a Plan</Button>
              <Button variant="outline" onClick={() => router.push('/profile')}>Go to Dashboard</Button>
            </div>
          </>}
          {status === 'error' && <>
            <div className="text-5xl mb-4">❌</div>
            <h2 className="text-2xl font-bold mb-2">Verification Failed</h2>
            <p className="text-muted-foreground mb-6">The link may have expired. Please try again.</p>
            <Link href="/login"><Button>Back to Login</Button></Link>
          </>}
        </CardContent>
      </Card>
    </div>
  );
}
