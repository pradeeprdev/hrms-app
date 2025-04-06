import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/Auth.css";
import Logo from '../assets/Logo.png';
import OnboardImg from '../assets/Onboarding.png';
import EyeClosed from '../assets/eye-closed.png';
import EyeOpened from '../assets/eye-opened.png';
import { API_ENDPOINTS } from "../config";

export default function AuthPage() {
  const API_URL = API_ENDPOINTS.AUTH;
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "pradeep@example.com",
    password: "password123",
    confirmPassword: ""
  });

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { fullName, email, password, confirmPassword } = formData;

    // Basic validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email || !password) {
      toast.error("Email and Password are required.");
      return;
    }

    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    if (!isLogin) {
      if (!fullName) {
        toast.error("Full name is required.");
        return;
      }

      if (!confirmPassword) {
        toast.error("Please confirm your password.");
        return;
      }

      if (password !== confirmPassword) {
        toast.error("Passwords do not match.");
        return;
      }
    }

    try {
      setLoading(true);

      const res = await fetch(`${API_URL}/${isLogin ? "login" : "register"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Something went wrong.");

      if (isLogin) {
        login(data.token);
        toast.success("Login successful!");
        navigate("/dashboard");
      } else {
        toast.success("Registration successful. Please login.");
        setIsLogin(true);
        setFormData({ fullName: "", email: "", password: "", confirmPassword: "" });
      }
    } catch (err) {
      if (err.name === "TypeError") {
        toast.error("Failed to connect to server. Please try again.");
      } else {
        toast.error(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-header">
        <img src={Logo} className="auth-logo" alt="Logo" />
      </div>

      <div className="auth-body">
        <div className="auth-left-img">
          <img src={OnboardImg} alt="Onboarding" />
        </div>

        <div className="auth-form-wrapper">
          <h2 className="auth-title">Welcome to Dashboard</h2>
          <form onSubmit={handleSubmit} className="auth-form">
            {!isLogin && (
              <>
                <label htmlFor="fullName">Full Name<span className="required-asterisk">*</span></label>
                <input
                  type="text"
                  name="fullName"
                  id="fullName"
                  placeholder="Full Name"
                  onChange={handleChange}
                  value={formData.fullName}
                  className="auth-input"
                />
              </>
            )}

            <label htmlFor="email">Email<span className="required-asterisk">*</span></label>
            <input
              type="email"
              name="email"
              id="email"
              placeholder="Email"
              onChange={handleChange}
              value={formData.email}
              className="auth-input"
            />

            <label htmlFor="password">Password<span className="required-asterisk">*</span></label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                id="password"
                placeholder="Password"
                onChange={handleChange}
                value={formData.password}
                className="auth-input"
              />
              <img
                src={showPassword ? EyeOpened : EyeClosed}
                alt="Toggle visibility"
                className="eye-icon"
                onClick={() => setShowPassword(!showPassword)}
              />
            </div>

            {!isLogin && (
              <>
                <label htmlFor="confirmPassword">Confirm Password<span className="required-asterisk">*</span></label>
                <div className="password-input-wrapper">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    id="confirmPassword"
                    placeholder="Confirm Password"
                    onChange={handleChange}
                    value={formData.confirmPassword}
                    className="auth-input"
                  />
                  <img
                    src={showConfirmPassword ? EyeOpened : EyeClosed}
                    alt="Toggle visibility"
                    className="eye-icon"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  />
                </div>
              </>
            )}

            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? (isLogin ? "Logging in..." : "Registering...") : (isLogin ? "Login" : "Register")}
            </button>
          </form>

          <p className="auth-toggle">
            {isLogin ? (
              <>
                Don&apos;t have an account?{" "}
                <span onClick={() => setIsLogin(false)} className="auth-switch">Register</span>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <span onClick={() => setIsLogin(true)} className="auth-switch">Login</span>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}