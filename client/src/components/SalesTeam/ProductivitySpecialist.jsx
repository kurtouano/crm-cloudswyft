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
import { useState } from "react";

const data = [
  { name: "1", deals: 10 },
  { name: "2", deals: 15 },
  { name: "3", deals: 8 },
  { name: "4", deals: 12 },
  { name: "5", deals: 18 },
  { name: "6", deals: 6 },
  { name: "7", deals: 11 },
  { name: "8", deals: 14 },
  { name: "9", deals: 9 },
  { name: "10", deals: 13 },
];

export default function ProductivitySpecialist() {
  const [selectedEmployee, setSelectedEmployee] = useState("Specialist 1");

  return (
    <div className="productivity-chart-container">
      <div className="productivity-header-wrapper">
        {/* Dropdown at the top */}
        <select
          className="employee-dropdown"
          value={selectedEmployee}
          onChange={(e) => setSelectedEmployee(e.target.value)}
        >
          <option value="Specialist 1">Select Employee</option>
          <option value="Specialist 1">Specialist 1</option>
          <option value="Specialist 2">Specialist 2</option>
          <option value="Specialist 3">Specialist 3</option>
        </select>
      </div>

      <div className="productivity-header-row">
        <h3 className="productivity-chart-title">
          Productivity Chart - ({selectedEmployee})
        </h3>
        <a href="#" className="download-link">
          DOWNLOAD CHART
        </a>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={data}
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
