import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { month: 'JAN', current: 22, past: 28 },
  { month: 'FEB', current: 25, past: 29 },
  { month: 'MAR', current: 12, past: 24 },
  { month: 'APR', current: 19, past: 32 },
  { month: 'MAY', current: 73, past: 38 },
  { month: 'JUN', current: 41, past: 23 },
  { month: 'JUL', current: 50, past: 40 },
  { month: 'AUG', current: 85, past: 60 },
  { month: 'SEP', current: 70, past: 55 },
  { month: 'OCT', current: 72, past: 75 },
  { month: 'NOV', current: 85, past: 98 },
  { month: 'DEC', current: 88, past: 100 }
];

// Custom legend to match the image
const CustomLegend = () => {
  return (
    <div className="onboarded-custom-legend">
      <div className="onboarded-legend-item">
        <span className="onboarded-legend-line" style={{ backgroundColor: "#347EFF" }}></span>
        <span className="onboarded-legend-text">CURRENT YEAR</span>
      </div>
      <div className="onboarded-legend-item">
        <span className="onboarded-legend-line" style={{ backgroundColor: "#5A5A5A" }}></span>
        <span className="onboarded-legend-text">PAST YEAR</span>
      </div>
    </div>
  );
};

export default function OnboardedClientsChart() {
  return (
    <div className="onboarded-chart-container">
      <h3 className="onboarded-chart-title">Yearly On-boarded Clients</h3>

      <CustomLegend />

      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={data} margin={{ top: 20, right: 30, left: 30, bottom: 30 }}>
          <CartesianGrid strokeDasharray="0" vertical={false} horizontal={false} />
          <XAxis 
            dataKey="month" 
            tick={{ fontSize: 10, fill: "#949494" }}
            padding={{ left: 10, right: 10 }} 
            tickMargin={10} 
          />
          <YAxis 
            domain={[10, 100]} 
            ticks={[10, 20, 30, 40, 50, 60, 70, 80, 90, 100]} 
            tick={{ fontSize: 9, fill: "#949494" }}
            tickMargin={10} 
          />
          <Tooltip />
          <Line type="monotone" dataKey="current" stroke="#347EFF" strokeWidth={1.5} name="Current Year" dot={false} />
          <Line type="monotone" dataKey="past" stroke="#5A5A5A" strokeWidth={1.5} name="Past Year" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
