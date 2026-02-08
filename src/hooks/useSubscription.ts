import { useAuth } from './useAuth';

export function useSubscription() {
  const { user } = useAuth();

  const isPaid = user?.subscription_status === 'active';
  const canComment = isPaid;

  const canCreateGoal = (currentActiveCount: number) => {
    if (isPaid) return true;
    return currentActiveCount < 3;
  };

  const isExpiring = () => {
    if (!user?.subscription_expires_at) return false;
    const expires = new Date(user.subscription_expires_at);
    const daysLeft = (expires.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    return daysLeft <= 7 && daysLeft > 0;
  };

  const isLapsed = user?.subscription_status === 'lapsed';

  return { isPaid, isLapsed, canComment, canCreateGoal, isExpiring };
}
