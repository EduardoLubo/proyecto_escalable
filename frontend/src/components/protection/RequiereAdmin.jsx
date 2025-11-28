import { Navigate, Outlet } from 'react-router';
import { isAdmin } from './isAdmin';

const RequireAdmin = () => {
  return isAdmin() ? <Outlet /> : <Navigate to="/" replace />;
};

export default RequireAdmin;
