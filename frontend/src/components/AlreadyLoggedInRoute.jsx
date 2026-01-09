import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AlreadyLoggedInRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  // If user is already authenticated, redirect to home
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // If not authenticated, show the component (login/register page)
  return children;
};

export default AlreadyLoggedInRoute;