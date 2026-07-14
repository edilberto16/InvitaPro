'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
export function useCurrentUser() {
  const [userId, setUserId] = useState<string | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => { setUserId(data.user?.id ?? null); setLoadingUser(false); });
  }, []);
  return { userId, loadingUser };
}
