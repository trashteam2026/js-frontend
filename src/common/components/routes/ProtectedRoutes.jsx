import { Navigate, Outlet } from 'react-router-dom';

import { useUser } from '@/common/contexts/UserContext';
import useIsMobile from '@/common/hooks/useIsMobile';

export function PrivateRoute() {
  return <Outlet />;
}

export function PublicOnlyRoute() {
  const { role, isLoading } = useUser();

  if (isLoading) return null;
  if (role === 'owner') return <Navigate to='/inventory' replace />;
  if (role === 'volunteer') return <Navigate to='/scan-in' replace />;
  return <Outlet />;
}

export function OwnerOnlyRoute() {
  const { role, isLoading } = useUser();

  if (isLoading) return null;
  if (role !== 'owner') return <Navigate to='/' replace />;
  return <Outlet />;
}

export function AuthenticatedRoute() {
  const { role, isLoading } = useUser();

  if (isLoading) return null;
  if (role === null) return <Navigate to='/' replace />;
  return <Outlet />;
}

export function MobileOnlyRoute() {
  const isMobile = useIsMobile();

  if (!isMobile) return <Navigate to='/login' replace />;
  return <Outlet />;
}
