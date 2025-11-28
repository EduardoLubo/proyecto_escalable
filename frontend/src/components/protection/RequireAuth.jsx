import { Navigate, Outlet } from 'react-router';
import { isAuthenticated } from './auth';

const RequireAuth = () => {
  return isAuthenticated() ? <Outlet /> : <Navigate to="/auth/login" replace />;
};

export default RequireAuth;