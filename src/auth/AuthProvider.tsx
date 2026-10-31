import { useEffect, useState, type ReactNode } from "react";
import { AuthContext, type User } from "./AuthContext";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  async function refreshAuth(): Promise<boolean> {
    const response = await fetch("/api/auth/me");

    if (response.ok) {
      const result: { data: User } = await response.json();

      setUser(result.data);
      setIsAuthenticated(true);
      return true;
    }

    if (response.status === 401) {
      setUser(null);

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
        const response = await fetch("/api/auth/me");

        if (ignore) return;

        if (response.ok) {
          const result: { data: User } = await response.json();

          if (!ignore) {
            // Store the user returned by the API.
            setUser(result.data);
            setIsAuthenticated(true);
          }
        } else if (response.status === 401) {
          // Clear the user when the session is no longer valid.
          setUser(null);
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
      value={{ user, isAuthenticated, isLoading, refreshAuth }}
    >
      {children}
    </AuthContext.Provider>
  );
}
