import { Navigate, useLocation } from "react-router-dom";
import { isAdmin } from '@/utils/permissions';

const CheckAuth = ({ children, isAuthenticated, user }) => {
  const location = useLocation();
  const path = location.pathname;

  // 1. If not logged in, allow only auth pages
  if (!isAuthenticated) {
    if (path.startsWith("/auth")) {
      return children; // allow login or signup
    } else {
      return <Navigate to="/auth/login" replace />;
    }
  }

  // 2. If authenticated and on auth routes, redirect to role-based home
  if (isAuthenticated && path.startsWith("/auth")) {
    const redirectPath = isAdmin(user?.role) ? "/admin/dashboard" : "/user/dashboard"; // Changed from /user/home
    return <Navigate to={redirectPath} replace />;
  }

  // 3. Role-based access control
  if (path.startsWith("/admin") && !isAdmin(user?.role)) {
    return <Navigate to="/unauth-page" replace />;
  }

  // // 4. Role-based access control for users (optional - if you want to restrict user routes)
  // if (path.startsWith("/user") && user?.role !== "user") {
  //   return <Navigate to="/unauth-page" replace />;
  // }

  // 5. If everything is fine, render the route's children
  return children;
};

export default CheckAuth;