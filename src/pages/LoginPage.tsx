import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../auth/AuthContext";


function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
const navigate = useNavigate();
const { refreshAuth } = useAuth();
  async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");

    try {
      const response = await fetch("/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

     if (response.ok) {
  // Confirm the session before navigating to a protected page.
  const authenticated = await refreshAuth();

  if (authenticated) {
    navigate("/dashboard", { replace: true });
  } else {
    setMessage("Unable to verify login.");
  }
} else {
  setMessage("Login failed.");
}
    } catch {
      setMessage("Unable to connect to the API.");
    }
  }

  return (
  <main className="login-page">
    <section className="login-card">
      <h1>RoomTrack</h1>
      <p>Sign in to your account</p>

      <form onSubmit={handleSubmit} className="login-form">
        <div className="form-field">
          <label htmlFor="username">Username</label>
          <input
            id="username"
            autoComplete="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            required
          />
        </div>

        <div className="form-field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>

        <button type="submit">Sign In</button>
      </form>

      {message && <p role="status">{message}</p>}
    </section>
  </main>
);
}

export default LoginPage;