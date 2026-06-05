'use client';

import { SWRConfig } from 'swr';
import { ReactNode } from 'react';

// Custom fetcher that busts cache on every request
const fetcher = (url: string) =>
  fetch(url, {
    cache: 'no-store',
    headers: { 'Cache-Control': 'no-cache' },
  }).then(r => r.json());

export function SWRProvider({ children }: { children: ReactNode }) {
  return (
    <SWRConfig
      value={{
        fetcher,
        revalidateOnFocus: true,
        revalidateOnReconnect: true,
        shouldRetryOnError: true,
        errorRetryCount: 3,
        errorRetryInterval: 5000,
        dedupingInterval: 2000,
        provider: () => new Map(),
      }}
    >
      {children}
    </SWRConfig>
  );
}
