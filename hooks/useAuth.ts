import { useAppSelector } from '@/redux/hooks';
import { RootState } from '@/redux/store';

export const useAuth = () => {
  const { user, token } = useAppSelector((state: RootState) => state.login);
  const firstName = user?.firstName || 'User';
  const lastName = user?.lastName || '';
  const email = user?.username || 'user@example.com';

  return {
    user,
    token,
    firstName,
    lastName,
    email,
    isLoggedIn: !!user,
  };
};