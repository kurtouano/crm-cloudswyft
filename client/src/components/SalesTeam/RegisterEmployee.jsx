const API_URL = import.meta.env.VITE_BACKEND_URL;

import { useState, useEffect } from "react";
import axios from "axios";
import "./SalesTeam.css";

export default function RegisterEmployee() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    employeeId: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validEmployeeId = /^CS\d{4}$/.test(formData.employeeId);
    if (!validEmployeeId) {
      setError("Employee ID must start with 'CS' followed by 4 digits (e.g., CS0001)");
      return;
    }

    try {
      await axios.post(`${API_URL}/api/auth/register-employee`, formData);
      setSuccess("Registered successfully!");
      setFormData({ name: "", email: "", employeeId: "" });
    } catch (error) {
      const message = error.response?.data?.message || "Something went wrong";
      if (message.includes("User already exists")) {
        setError("⚠️ This employee is already registered.");
      } else {
        setError(`❌ ${message}`);
      }
    }
  };

  // Auto-dismiss alerts after 3 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError("");
        setSuccess("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  return (
    <div className="register-employee-container">
      <h3 className="form-title">Register Employee</h3>

      {success && <div className="success-box">{success}</div>}
      {error && <div className="error-box">{error}</div>}

      <form onSubmit={handleSubmit} className="form-group">
        <label className="form-label">Employee Name</label>
        <input
          type="text"
          name="name"
          className="form-input"
          placeholder="John Doe"
          value={formData.name}
          onChange={handleChange}
          required
        />

        <label className="form-label">Employee Email</label>
        <input
          type="email"
          name="email"
          className="form-input"
          placeholder="spc@outlook.com"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <label className="form-label ">Employee ID</label>
        <input
          type="text"
          name="employeeId"
          className="form-input employee-id-input"
          placeholder="CS0085"
          value={formData.employeeId}
          onChange={handleChange}
          required
        />

        <button type="submit" className="save-btn">Save</button>
      </form>
    </div>
  );
}
