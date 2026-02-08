import { useMemo } from 'react';
import { useAuth } from './useAuth';
import type { UserRole } from '../types/database';

interface RoleInfo {
  role: UserRole;
  isModerator: boolean;
  isAdmin: boolean;
  isSuspended: boolean;
  suspendedUntil: string | undefined;
  suspensionReason: string | undefined;
}

export function useRole(): RoleInfo {
  const { user } = useAuth();

  return useMemo(() => {
    const role: UserRole = user?.role ?? 'user';
    const suspendedUntil = user?.suspended_until;
    const isSuspended = !!suspendedUntil && new Date(suspendedUntil) > new Date();

    return {
      role,
      isModerator: role === 'moderator' || role === 'admin',
      isAdmin: role === 'admin',
      isSuspended,
      suspendedUntil: isSuspended ? suspendedUntil : undefined,
      suspensionReason: isSuspended ? user?.suspension_reason : undefined,
    };
  }, [user?.role, user?.suspended_until, user?.suspension_reason]);
}
