import './Dashboard.css';
import { RadialBarChart, RadialBar, Legend, PolarAngleAxis } from "recharts";

const data = [
  { name: "Dissatisfied", value: 64, fill: "#D3D3D3" }, // Light Blue
  { name: "Neutral", value: 75, fill: "#0D4DA1" }, // Dark Blue
  { name: "Satisfied", value: 90, fill: "#57A8F5" }, // Gray
]; 

const CircularProgressChart = () => {
  return (
      <div className="circular-chart-container" style={{ textAlign: "center" }}>
        <h3 style={{ color: "#0D0D3D" }}>Customer Satisfaction Score</h3>
        <RadialBarChart
          width={350}
          height={310}
          cx="50%"
          cy="45%"
          innerRadius="47%"
          outerRadius="95%"
          barSize={16}
          data={data}
          startAngle={90}
          endAngle={-270}
        >
          <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
          <RadialBar dataKey="value" background cornerRadius={50} /> {/* Rounded Ends */}
          <text
            x="50%"
            y="45%"
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={24}
            fontWeight="bold"
          >
            99%
          </text>
          <Legend
            iconSize={11}
            layout="horizontal"
            wrapperStyle={{
              position: "absolute", 
              left: "50%", 
              fontSize: "13px", 
              transform: "translateX(-50%)", 
              top: "90%", 
            }}
              payload={[...data].reverse().map((entry) => ({
              value: entry.name,
              color: entry.fill,
              type: "rect", // Use rectangle instead of default square
            }))} // Reverse only legend, not chart
          />
        </RadialBarChart>
      </div>
  );
};

export default CircularProgressChart;
