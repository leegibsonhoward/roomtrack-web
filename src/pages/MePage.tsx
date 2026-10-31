import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../auth/AuthContext";

function MePage() {
  const navigate = useNavigate();
  const { user, refreshAuth } = useAuth();
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
    <main className="account-page">
      <section className="account-card">
        <h1>My Account</h1>

        <div className="account-info">
          <div className="account-avatar" aria-hidden="true">
            {user?.username.charAt(0).toUpperCase()}
          </div>

          <div>
            <strong>{user?.username}</strong>
            <p>role: {user?.role}</p>
          </div>
        </div>

        <button
          type="button"
          className="logout-button"
          onClick={handleLogout}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? "Logging out..." : "Log Out"}
        </button>

        {error && <p role="alert">{error}</p>}
      </section>
    </main>
  );
}

export default MePage;
