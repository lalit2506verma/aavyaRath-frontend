import React, { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth, apiClient } from "@/App";
import { toast } from "sonner";

const AuthCallback = () => {
  const { setAuthUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const hasProcessed = useRef(false);

  useEffect(() => {
    // Prevent double processing in StrictMode
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const processAuth = async () => {
      // Extract session_id from URL hash
      const hash = location.hash || window.location.hash;
      const sessionIdMatch = hash.match(/session_id=([^&]+)/);

      if (!sessionIdMatch) {
        toast.error("Authentication failed - no session ID");
        navigate("/login");
        return;
      }

      const sessionId = sessionIdMatch[1];

      try {
        // Exchange session_id for app session
        const response = await apiClient.post("/auth/session", {
          session_id: sessionId,
        });

        const { token, user } = response.data;

        // Set auth state
        setAuthUser(user, token);

        toast.success(`Welcome, ${user.name}!`);

        // Navigate to dashboard or intended page
        navigate("/", { replace: true, state: { user } });
      } catch (error) {
        console.error("Auth callback error:", error);
        toast.error("Authentication failed. Please try again.");
        navigate("/login");
      }
    };

    processAuth();
  }, [location, navigate, setAuthUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Completing sign in...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
