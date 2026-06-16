import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import authService from "../../services/authService";

import "./Register.css";

function Register() {
  const navigate = useNavigate();

  const [loading, setLoading] =
    useState(false);

  const [formData, setFormData] =
    useState({
      name: "",
      email: "",
      password: "",
      role: "employee",
    });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]:
        e.target.value,
    });
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error(
        "Name is required"
      );
      return false;
    }

    if (!/^[a-zA-Z\s]+$/.test(formData.name)) {
      toast.error(
        "Name must contain only letters"
      );
      return false;
    }

    if (!formData.email.trim()) {
      toast.error(
        "Email is required"
      );
      return false;
    }

    if (
      !formData.email.includes(
        "@"
      )
    ) {
      toast.error(
        "Invalid email"
      );
      return false;
    }

    if (
      formData.password.length <
      6
    ) {
      toast.error(
        "Password must be at least 6 characters"
      );
      return false;
    }

    return true;
  };

  const handleSubmit = async (
    e
  ) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      await authService.register(
        formData
      );

      toast.success(
        "Registration successful"
      );

      navigate("/login");
    } catch (error) {
      toast.error(
        error.response?.data
          ?.message ||
          "Registration failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h2>
          Create Account
        </h2>

        <form
          onSubmit={
            handleSubmit
          }
        >
          <div className="form-group">
            <label>
              Name
            </label>

            <input
              type="text"
              name="name"
              value={
                formData.name
              }
              onChange={
                handleChange
              }
              placeholder="Enter name"
            />
          </div>

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

          <div className="form-group">
            <label>
              Role
            </label>

            <select
              name="role"
              value={
                formData.role
              }
              onChange={
                handleChange
              }
            >
              <option value="employee">
                Employee
              </option>

              <option value="manager">
                Manager
              </option>
            </select>
          </div>

          <button
            type="submit"
            className="register-btn"
            disabled={loading}
          >
            {loading
              ? "Creating..."
              : "Register"}
          </button>
        </form>

        <p className="login-link">
          Already have an account?

          <Link to="/login">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;