'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { usePathname } from 'next/navigation';

interface LayoutContextType {
  hideChrome: boolean;
  setHideChrome: (hide: boolean) => void;
}

const LayoutContext = createContext<LayoutContextType>({
  hideChrome: false,
  setHideChrome: () => {},
});

export function LayoutProvider({ children }: { children: ReactNode }) {
  const [hideChrome, setHideChrome] = useState(false);
  const pathname = usePathname();

  // Auto-detect admin/owner routes and hide chrome
  useEffect(() => {
    const isAdmin = pathname?.startsWith('/admin');
    const isOwner = pathname?.startsWith('/owner');
    setHideChrome(isAdmin || isOwner);
  }, [pathname]);

  return (
    <LayoutContext.Provider value={{ hideChrome, setHideChrome }}>
      {children}
    </LayoutContext.Provider>
  );
}

export function useLayout() {
  return useContext(LayoutContext);
}
