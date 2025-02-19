import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const responseData = [
  { hours: "0 -3", responses: 11 },
  { hours: "4-6", responses: 12 },
  { hours: "7-9", responses: 11 },
  { hours: "10-13", responses: 18 },
  { hours: "14-17", responses: 10 },
  { hours: "18-24", responses: 25 },
];

export default function HandlingResponse() {
  return (
    <div className="handling-response-container">
      <h3 className="handling-response-title">Handling Time</h3>

      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={responseData} margin={{ top: 30, right: 20, left: 0, bottom: 38 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis 
            dataKey="hours" 
            tick={{ fontSize: 12, fill: "#4F4F4F" }} 
            label={{ value: "Hours", position: "bottom", dy: -2, fontSize: 12, fill: "#4F4F4F" }}
          />
          <YAxis 
            tick={{ fontSize: 12, fill: "#4F4F4F" }} 
            label={{ value: "Number of Responses", angle: -90, position: "insideLeft", dy: 65,dx: 8, fontSize: 12, fill: "#4F4F4F" }}
          />
          <Tooltip cursor={{ fill: "transparent" }} />
          <Bar dataKey="responses" fill="#00A3FF" barSize={30} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
