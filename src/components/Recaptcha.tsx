'use client';

import { useCallback } from 'react';

const SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

export function useRecaptcha() {
  const getToken = useCallback(async (): Promise<string> => {
    if (!SITE_KEY) return ''; // Dev mode - no reCAPTCHA

    // Ensure script is loaded
    if (!(window as any).grecaptcha) {
      return '';
    }

    try {
      const token = await (window as any).grecaptcha.execute(SITE_KEY, { action: 'submit' });
      return token;
    } catch {
      return '';
    }
  }, []);

  return { getToken, enabled: !!SITE_KEY };
}

export function RecaptchaScript() {
  if (!SITE_KEY) return null;
  return (
    <script
      src={`https://www.google.com/recaptcha/api.js?render=${SITE_KEY}`}
      async
      defer
    />
  );
}
