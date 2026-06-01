'use client';

import { useAuth } from '@/context/AuthContext';

export function useSession() {
  const { user, loading, refreshUser } = useAuth();
  return { user, loading, refreshUser, isAuthenticated: !!user, role: user?.role || null };
}
