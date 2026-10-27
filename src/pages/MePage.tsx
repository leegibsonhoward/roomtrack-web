import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../auth/AuthContext";

function MePage() {
  const navigate = useNavigate();
  const { refreshAuth } = useAuth();
  const [error, setError] = useState("");
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    setError("");
    setIsLoggingOut(true);

    try {
      const response = await fetch("/auth/logout", {
        method: "POST",
      });

      if (!response.ok) {
        setError("Unable to log out.");
        return;
      }

      // Recheck the session so protected routes recognize the logout.
      await refreshAuth();
      navigate("/login", { replace: true });
    } catch {
      setError("Unable to connect to the API.");
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <main>
      <h1>My Account</h1>
      <p>View your account information.</p>

      <button onClick={handleLogout} disabled={isLoggingOut}>
        {isLoggingOut ? "Logging out..." : "Logout"}
      </button>

      {error && <p role="alert">{error}</p>}
    </main>
  );
}

export default MePage;