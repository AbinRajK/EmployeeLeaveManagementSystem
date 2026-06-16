import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import authService from "../../services/authService";

import "./Login.css";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] =
    useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]:
        e.target.value,
    });
  };

  const validateForm = () => {
    if (!formData.email.trim()) {
      toast.error(
        "Email is required"
      );
      return false;
    }

    if (!formData.password.trim()) {
      toast.error(
        "Password is required"
      );
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validateForm()) return;

  try {
    setLoading(true);
    const response = await authService.login(formData);

    // Store both token and user data in localStorage
    localStorage.setItem("token", response.token);
    localStorage.setItem("user", JSON.stringify(response.user));

    toast.success("Login successful");

    // Redirect based on role
    if (response.user.role === "manager") {
      navigate("/manager");
    } else {
      navigate("/employee");
    }
  } catch (error) {
    toast.error(error.response?.data?.message || "Login failed");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>
          Employee Leave
          Management
        </h2>

        <form
          onSubmit={
            handleSubmit
          }
        >
          <div className="form-group">
            <label>
              Email
            </label>

            <input
              type="email"
              name="email"
              value={
                formData.email
              }
              onChange={
                handleChange
              }
              placeholder="Enter email"
            />
          </div>

          <div className="form-group">
            <label>
              Password
            </label>

            <input
              type="password"
              name="password"
              value={
                formData.password
              }
              onChange={
                handleChange
              }
              placeholder="Enter password"
            />
          </div>

          <button
            type="submit"
            className="login-btn"
            disabled={loading}
          >
            {loading
              ? "Logging in..."
              : "Login"}
          </button>
        </form>

        <p className="register-link">
          Don't have an account?

          <Link to="/register">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;