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

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

    if (!formData.email || !formData.password || (!isLogin && (!formData.fullName || formData.password !== formData.confirmPassword))) {
      toast.error("Please fill in all fields correctly.");
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/auth/${isLogin ? "login" : "register"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

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
      toast.error(err.message);
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

            <button type="submit" className="auth-button">
              {isLogin ? "Login" : "Register"}
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
