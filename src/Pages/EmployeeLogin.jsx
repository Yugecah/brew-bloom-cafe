import { useState } from "react";
import { useNavigate } from "react-router-dom";

function EmployeeLogin() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (event) => {
    event.preventDefault();

    // Demo employee credentials
    if (username === "staff" && password === "brew2026") {
      sessionStorage.setItem("brewBloomEmployee", "true");
      navigate("/employee");
      return;
    }

    setError("Invalid username or password.");
  };

  return (
    <div className="employee-login-page">
      <div className="employee-login-card">
        <div className="employee-login-brand">
          <span className="employee-login-logo">B</span>

          <div>
            <strong>Brew & Bloom</strong>
            <span>COFFEE HOUSE</span>
          </div>
        </div>

        <div className="employee-login-heading">
          <span className="eyebrow">STAFF PORTAL</span>

          <h1>Welcome back.</h1>

          <p>
            Sign in to manage customer orders and update
            order status.
          </p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="employee-username">
              Username
            </label>

            <input
              id="employee-username"
              type="text"
              value={username}
              onChange={(event) =>
                setUsername(event.target.value)
              }
              placeholder="Enter username"
              autoComplete="username"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="employee-password">
              Password
            </label>

            <input
              id="employee-password"
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              placeholder="Enter password"
              autoComplete="current-password"
              required
            />
          </div>

          {error && (
            <p className="employee-login-error">{error}</p>
          )}

          <button
            type="submit"
            className="employee-login-button"
          >
            Sign In
            <span>→</span>
          </button>
        </form>

        <div className="employee-demo-credentials">
          <span>Demo credentials</span>

          <strong>staff</strong>
          <strong>brew2026</strong>
        </div>

        <button
          type="button"
          className="employee-back-button"
          onClick={() => navigate("/")}
        >
          ← Back to customer website
        </button>
      </div>
    </div>
  );
}

export default EmployeeLogin;