import { useEffect, useState, type ReactNode } from "react";
import { AuthContext } from "./AuthContext";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  async function refreshAuth(): Promise<boolean> {
    const response = await fetch("/auth/me");

    if (response.ok) {
      setIsAuthenticated(true);
      return true;
    }

    if (response.status === 401) {
      setIsAuthenticated(false);
      return false;
    }

    // A server error doesn't necessarily mean the session expired.
    throw new Error("Unable to verify session.");
  }

  useEffect(() => {
    let ignore = false;

    async function checkSession() {
      try {
        const response = await fetch("/auth/me");

        if (ignore) return;

        if (response.ok) {
          setIsAuthenticated(true);
        } else if (response.status === 401) {
          setIsAuthenticated(false);
        }
      } catch {
        // Keep the existing authentication state if verification fails.
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    // Check for an existing session when the application starts.
    void checkSession();

    // Ignore responses from a previous effect instance.
    return () => {
      ignore = true;
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, isLoading, refreshAuth }}
    >
      {children}
    </AuthContext.Provider>
  );
}