import { Navigate, Outlet } from 'react-router-dom';

import { useUser } from '@/common/contexts/UserContext';

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

export function VolunteerOnlyRoute() {
  const { role, isLoading } = useUser();

  if (isLoading) return null;
  if (role !== 'volunteer') return <Navigate to='/volunteer/entry' replace />;
  return <Outlet />;
}
