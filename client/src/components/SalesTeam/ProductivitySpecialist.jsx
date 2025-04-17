const API_URL = import.meta.env.VITE_BACKEND_URL;

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import "./SalesTeam.css";
import { useState, useEffect } from "react";

const dummyDataByEmployee = {
  "Nhick Fabian": [
    { name: "1", deals: 10 },
    { name: "2", deals: 12 },
    { name: "3", deals: 8 },
    { name: "4", deals: 14 },
    { name: "5", deals: 9 },
    { name: "6", deals: 11 },
    { name: "7", deals: 10 },
    { name: "8", deals: 15 },
    { name: "9", deals: 13 },
    { name: "10", deals: 17 },
  ],
  "Kurt Ouano": [
    { name: "1", deals: 6 },
    { name: "2", deals: 8 },
    { name: "3", deals: 5 },
    { name: "4", deals: 9 },
    { name: "5", deals: 11 },
    { name: "6", deals: 7 },
    { name: "7", deals: 6 },
    { name: "8", deals: 8 },
    { name: "9", deals: 7 },
    { name: "10", deals: 9 },
  ],
  "Jash Villegas": [
    { name: "1", deals: 12 },
    { name: "2", deals: 14 },
    { name: "3", deals: 13 },
    { name: "4", deals: 15 },
    { name: "5", deals: 16 },
    { name: "6", deals: 17 },
    { name: "7", deals: 14 },
    { name: "8", deals: 16 },
    { name: "9", deals: 15 },
    { name: "10", deals: 17 },
  ],
  "Kyle Castillo": [
    { name: "1", deals: 10 },
    { name: "2", deals: 12 },
    { name: "3", deals: 8 },
    { name: "4", deals: 14 },
    { name: "5", deals: 9 },
    { name: "6", deals: 11 },
    { name: "7", deals: 10 },
    { name: "8", deals: 15 },
    { name: "9", deals: 13 },
    { name: "10", deals: 17 },
  ],
  "Vincent Mendoza": [
    { name: "1", deals: 6 },
    { name: "2", deals: 8 },
    { name: "3", deals: 5 },
    { name: "4", deals: 9 },
    { name: "5", deals: 11 },
    { name: "6", deals: 7 },
    { name: "7", deals: 6 },
    { name: "8", deals: 8 },
    { name: "9", deals: 7 },
    { name: "10", deals: 9 },
  ],
  "Tyron Silva": [
    { name: "1", deals: 12 },
    { name: "2", deals: 14 },
    { name: "3", deals: 13 },
    { name: "4", deals: 15 },
    { name: "5", deals: 16 },
    { name: "6", deals: 17 },
    { name: "7", deals: 14 },
    { name: "8", deals: 16 },
    { name: "9", deals: 15 },
    { name: "10", deals: 17 },
  ],
  "Labanos": [
    { name: "1", deals: 12 },
    { name: "2", deals: 14 },
    { name: "3", deals: 13 },
    { name: "4", deals: 15 },
    { name: "5", deals: 16 },
    { name: "6", deals: 17 },
    { name: "7", deals: 14 },
    { name: "8", deals: 16 },
    { name: "9", deals: 15 },
    { name: "10", deals: 17 },
  ],
};

export default function ProductivitySpecialist() {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");

  useEffect(() => {
    fetch(`${API_URL}/api/auth/employees`)
      .then((res) => res.json())
      .then(setEmployees)
      .catch((err) => console.error("Error loading employees", err));
  }, []);

  const chartData = dummyDataByEmployee[selectedEmployee] || [];

  return (
    <div className="productivity-chart-container">
      <div className="productivity-header-wrapper">
      <select
          className="employee-dropdown"
          value={selectedEmployee}
          onChange={(e) => setSelectedEmployee(e.target.value.trim())}
        >
          <option value="">Select Employee</option>
          {employees.map((emp) => {
            const cleanName = emp.name.trim();
            return (
              <option key={emp.employeeId} value={cleanName}>
                {cleanName}
              </option>
            );
          })}
        </select>
      </div>

      <div className="productivity-header-row">
        <h3 className="productivity-chart-title">
          Productivity Chart - ({selectedEmployee || "No Selection"})
        </h3>
        <a href="#" className="download-link">
          DOWNLOAD CHART
        </a>
      </div>

      <ResponsiveContainer width="100%" height={315}>
        <LineChart
          data={chartData}
          margin={{ top: 10, right: 20, left: 10, bottom: 20 }}
        >
          <CartesianGrid stroke="#ccc" strokeDasharray="3 3" />
          <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#2c2c2c" }} />
          <YAxis domain={[0, 20]} tick={{ fontSize: 12, fill: "#2c2c2c" }} />
          <Tooltip />
          <Line
            type="linear"
            dataKey="deals"
            stroke="#00145D"
            strokeWidth={1.5}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
