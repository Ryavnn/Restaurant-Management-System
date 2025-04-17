import { useState, useEffect } from "react";
import { Lock, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!loginForm.email || !loginForm.password) {
      setLoginError("Please enter both email and password");
      return;
    }

    try {
      const res = await fetch("http://127.0.0.1:5000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginForm),
      });

      const data = await res.json();

      if (data.success) {
        // Store token in localStorage
        localStorage.setItem("token", data.token);

        // Store user information
        localStorage.setItem("user", JSON.stringify(data.user));
        setUserData(data.user);

        setIsAuthenticated(true);
        setLoginError("");
      } else {
        setLoginError(data.message || "Invalid email or password");
      }
    } catch (err) {
      setLoginError("An error occurred. Please try again later.");
      console.error(err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      const timer = setTimeout(() => {
        navigate("/dashboard"); // Change this to your actual dashboard route
      }, 2000); // 2 seconds delay before redirecting

      return () => clearTimeout(timer); // Cleanup on unmount
    }
  }, [isAuthenticated, navigate]);

  // Styles
  const styles = {
    container: {
      display: "flex",
      height: "100vh",
      fontFamily: "Arial, sans-serif",
    },
    leftPanel: {
      flex: "1",
      backgroundColor: "#ff6b6b",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      color: "white",
      padding: "2rem",
    },
    rightPanel: {
      flex: "1",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      padding: "2rem",
    },
    logoText: {
      fontSize: "2.5rem",
      fontWeight: "bold",
      marginBottom: "1rem",
    },
    tagline: {
      fontSize: "1.2rem",
      marginBottom: "2rem",
      textAlign: "center",
    },
    features: {
      textAlign: "left",
      width: "100%",
      maxWidth: "400px",
    },
    featureItem: {
      margin: "1rem 0",
      display: "flex",
      alignItems: "center",
    },
    featureIcon: {
      marginRight: "1rem",
      backgroundColor: "rgba(255,255,255,0.2)",
      borderRadius: "50%",
      padding: "0.5rem",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    },
    loginForm: {
      width: "100%",
      maxWidth: "400px",
      margin: "0 auto",
    },
    formTitle: {
      fontSize: "1.8rem",
      fontWeight: "bold",
      marginBottom: "2rem",
      color: "#333",
    },
    formGroup: {
      marginBottom: "1.5rem",
    },
    label: {
      display: "block",
      marginBottom: "0.5rem",
      fontWeight: "bold",
      color: "#555",
    },
    inputContainer: {
      position: "relative",
    },
    input: {
      width: "100%",
      padding: "12px 12px 12px 40px",
      fontSize: "1rem",
      border: "1px solid #ddd",
      borderRadius: "4px",
      boxSizing: "border-box",
    },
    inputIcon: {
      position: "absolute",
      top: "50%",
      left: "12px",
      transform: "translateY(-50%)",
      color: "#888",
    },
    button: {
      width: "100%",
      padding: "12px",
      backgroundColor: "#ff6b6b",
      color: "white",
      border: "none",
      borderRadius: "4px",
      fontSize: "1rem",
      fontWeight: "bold",
      cursor: "pointer",
      marginTop: "1rem",
    },
    error: {
      color: "#e74c3c",
      marginTop: "1rem",
      textAlign: "center",
    },
    forgotPassword: {
      textAlign: "right",
      marginTop: "0.5rem",
    },
    forgotPasswordLink: {
      color: "#ff6b6b",
      textDecoration: "none",
      fontSize: "0.9rem",
    },
    demoCredentials: {
      marginTop: "2rem",
      padding: "1rem",
      backgroundColor: "#f8f9fa",
      borderRadius: "4px",
      fontSize: "0.9rem",
      color: "#666",
    },
  };

  // If authenticated, you would normally redirect to the dashboard
  // For demo purposes, we'll just show a success message
  if (isAuthenticated) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          background: "#f8f9fa",
        }}
      >
        <div
          style={{
            backgroundColor: "white",
            padding: "2rem",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            textAlign: "center",
            maxWidth: "400px",
          }}
        >
          <h2 style={{ color: "#28a745", marginBottom: "1rem" }}>
            Login Successful!
          </h2>
          <p>Welcome, {userData?.name || "User"}!</p>
          <p>Role: {userData?.role || "User"}</p>
          <p>You will be redirected to the Restaurant Dashboard.</p>
          <button
            style={{
              ...styles.button,
              backgroundColor: "#28a745",
              marginTop: "1rem",
            }}
            onClick={() => setIsAuthenticated(false)}
          >
            Go Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Left Panel - Branding & Features */}
      <div style={styles.leftPanel}>
        <div style={styles.logoText}>Restaurant Manager</div>
        <div style={styles.tagline}>
          Streamline your restaurant operations with our comprehensive
          management solution
        </div>

        <div style={styles.features}>
          <div style={styles.featureItem}>
            <span style={styles.featureIcon}>✓</span>
            <span>Staff Management</span>
          </div>
          <div style={styles.featureItem}>
            <span style={styles.featureIcon}>✓</span>
            <span>Menu Control</span>
          </div>
          <div style={styles.featureItem}>
            <span style={styles.featureIcon}>✓</span>
            <span>Inventory Tracking</span>
          </div>
          <div style={styles.featureItem}>
            <span style={styles.featureIcon}>✓</span>
            <span>Performance Analytics</span>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div style={styles.rightPanel}>
        <form style={styles.loginForm} onSubmit={handleLogin}>
          <h2 style={styles.formTitle}>Login to your Dashboard</h2>

          <div style={styles.formGroup}>
            <label style={styles.label}>Email</label>
            <div style={styles.inputContainer}>
              <input
                type="email"
                style={styles.input}
                placeholder="your@email.com"
                value={loginForm.email}
                onChange={(e) =>
                  setLoginForm({ ...loginForm, email: e.target.value })
                }
              />
              <Mail size={20} style={styles.inputIcon} />
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Password</label>
            <div style={styles.inputContainer}>
              <input
                type="password"
                style={styles.input}
                placeholder="••••••••"
                value={loginForm.password}
                onChange={(e) =>
                  setLoginForm({ ...loginForm, password: e.target.value })
                }
              />
              <Lock size={20} style={styles.inputIcon} />
            </div>
            <div style={styles.forgotPassword}>
              <a href="#" style={styles.forgotPasswordLink}>
                Forgot password?
              </a>
            </div>
          </div>

          {loginError && <div style={styles.error}>{loginError}</div>}

          <button type="submit" style={styles.button}>
            Login to Dashboard
          </button>

        </form>
      </div>
    </div>
  );
}
