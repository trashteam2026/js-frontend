import { Outlet } from 'react-router-dom';

export function PrivateRoute() {
  return <Outlet />;
}

export function PublicOnlyRoute() {
  return <Outlet />;
}
