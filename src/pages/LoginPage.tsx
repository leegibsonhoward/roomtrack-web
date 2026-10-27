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
    <main>
      <h1>Login</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username">Username</label>
          <input
            id="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>

        <button type="submit">Login</button>
      </form>

      <p role="status">{message}</p>
    </main>
  );
}

export default LoginPage;