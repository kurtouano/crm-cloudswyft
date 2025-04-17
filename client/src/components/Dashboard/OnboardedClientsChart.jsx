import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';

const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

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
  const [chartData, setChartData] = useState([]);
  const [maxValue, setMaxValue] = useState(100);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:4000/api/onboarded/stats');
        const { currentYear, lastYear } = response.data;
        
        // Calculate max value for YAxis domain
        const allValues = [...currentYear, ...lastYear];
        const calculatedMax = Math.max(...allValues) + 10;
        setMaxValue(calculatedMax < 10 ? 10 : calculatedMax);
        
        // Format data for chart
        const formattedData = monthNames.map((month, index) => ({
          month,
          current: currentYear[index],
          past: lastYear[index]
        }));
        
        setChartData(formattedData);
      } catch (error) {
        console.error('Error fetching onboarded stats:', error);
      }
    };
    
    fetchData();
  }, []);

  return (
    <div className="onboarded-chart-container">
      <h3 className="onboarded-chart-title">Yearly On-boarded Clients</h3>

      <CustomLegend />

      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={chartData} margin={{ top: 15, right: 15, left: 0, bottom: 10 }}>
          <CartesianGrid strokeDasharray="0" vertical={false} horizontal={false} />
          <XAxis 
            dataKey="month" 
            tick={{ fontSize: 10, fill: "#949494" }}
            padding={{ left: 10, right: 10 }} 
            tickMargin={10} 
          />
          <YAxis 
            domain={[0, maxValue]} 
            ticks={Array.from({ length: Math.ceil(maxValue/10) }, (_, i) => (i+1)*10)} 
            tick={{ fontSize: 9, fill: "#949494" }}
            tickMargin={10} 
          />
          <Tooltip />
          <Line 
            type="monotone" 
            dataKey="current" 
            stroke="#347EFF" 
            strokeWidth={1.5} 
            name="Current Year" 
            dot={false} 
          />
          <Line 
            type="monotone" 
            dataKey="past" 
            stroke="#5A5A5A" 
            strokeWidth={1.5} 
            name="Past Year" 
            dot={false} 
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}