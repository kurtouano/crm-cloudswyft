import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
  } from "recharts";
  import "./SalesTeam.css";
  
  const data = [
    { name: "1", spec1: 30, spec2: 20, spec3: 25 },
    { name: "2", spec1: 28, spec2: 32, spec3: 30 },
    { name: "3", spec1: 35, spec2: 28, spec3: 28 },
    { name: "4", spec1: 25, spec2: 22, spec3: 20 },
    { name: "5", spec1: 23, spec2: 17, spec3: 10 },
    { name: "6", spec1: 35, spec2: 20, spec3: 35 },
    { name: "7", spec1: 38, spec2: 35, spec3: 30 },
    { name: "8", spec1: 28, spec2: 10, spec3: 15 },
    { name: "9", spec1: 30, spec2: 40, spec3: 25 },
    { name: "10", spec1: 35, spec2: 28, spec3: 25 },
  ];
  
  export default function ProductivityChart() {
    return (
      <div className="productivity-chart-container">
        <div className="productivity-header-row">
          <h3 className="productivity-chart-title">Productivity Chart - All</h3>
          <div className="productivity-custom-legend">
            <div className="productivity-legend-item">
              <span
                className="productivity-legend-line"
                style={{ backgroundColor: "#00CFFF" }}
              ></span>
              <span className="productivity-legend-text">SPECIALIST 1</span>
            </div>
            <div className="productivity-legend-item">
              <span
                className="productivity-legend-line"
                style={{ backgroundColor: "#1E91FF" }}
              ></span>
              <span className="productivity-legend-text">SPECIALIST 2</span>
            </div>
            <div className="productivity-legend-item">
              <span
                className="productivity-legend-line"
                style={{ backgroundColor: "#0A3381" }}
              ></span>
              <span className="productivity-legend-text">SPECIALIST 3</span>
            </div>
          </div>
        </div>
  
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={data}
            margin={{ top: 10, right: 20, left: 10, bottom: 20 }}
            barCategoryGap="35%"
          >
            <CartesianGrid
              strokeDasharray="0"
              vertical={false}
              horizontal={true}
              stroke="#E5E5E5"
            />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12, fill: "#2c2c2c" }}
              tickMargin={10}
              padding={{ left: 5, right: 5 }}
            />
            <YAxis
              domain={[0, 100]}
              ticks={[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]}
              tick={{ fontSize: 12, fill: "#2c2c2c" }}
              tickMargin={10}
            />
            <Tooltip />
            <Bar dataKey="spec1" stackId="a" fill="#00CFFF" name="SPECIALIST 1" barSize={30} />
            <Bar dataKey="spec2" stackId="a" fill="#1E91FF" name="SPECIALIST 2" barSize={30} />
            <Bar dataKey="spec3" stackId="a" fill="#0A3381" name="SPECIALIST 3" barSize={30} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }
  