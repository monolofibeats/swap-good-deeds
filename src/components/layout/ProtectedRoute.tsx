import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAdmin = false,
}) => {
  const { user, profile, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Redirect to onboarding if not completed (but allow access to onboarding page itself and supporter application)
  const onboardingPaths = ["/onboarding", "/supporter-application"];
  if (profile && !profile.onboarding_completed && !onboardingPaths.includes(location.pathname)) {
    return <Navigate to="/onboarding" replace />;
  }

  // Redirect approved supporters to supporter dashboard when accessing main index
  const userType = (profile as any)?.user_type;
  if (userType === "supporter" && location.pathname === "/" && !isAdmin) {
    return <Navigate to="/supporter" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
