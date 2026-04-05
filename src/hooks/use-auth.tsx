import { useUser, useClerk } from '@clerk/clerk-react';
import { isAdmin } from '@/lib/admin';

export function useAuth() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();

  return {
    user: user ?? null,
    loading: !isLoaded,
    isAdmin: isAdmin(user?.primaryEmailAddress?.emailAddress),
    signOut: () => signOut(),
  };
}
