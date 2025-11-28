import { Navigate, Outlet } from 'react-router';
import { isAuthenticated } from './auth';

const RedirectIfAuthenticated = () => {
  return isAuthenticated() ? <Navigate to="/" replace /> : <Outlet />;
};

export default RedirectIfAuthenticated;