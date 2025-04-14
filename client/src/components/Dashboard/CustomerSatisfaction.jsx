import './Dashboard.css';
import { RadialBarChart, RadialBar, Legend, PolarAngleAxis } from "recharts";
import { useEffect, useState } from 'react';
import axios from 'axios';

const CustomerSatisfactionChart = () => {
  const [chartData, setChartData] = useState([]);
  const [overallScore, setOverallScore] = useState(0);
  const [weightedValue, setWeightedValue] = useState(0);
  const [totalResponses, setTotalResponses] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeedbackData = async () => {
      try {
        const response = await axios.get('http://localhost:4000/api/feedback/stats');
        const feedbackStats = response.data;
        
        // Transform MongoDB data to chart format
        const transformedData = [
          { 
            name: "Sad", 
            value: feedbackStats.find(item => item.rating === 'sad')?.count || 0,
            fill: "#D3D3D3"
          },
          { 
            name: "Neutral", 
            value: feedbackStats.find(item => item.rating === 'neutral')?.count || 0,
            fill: "#0D4DA1"
          },
          { 
            name: "Happy", 
            value: feedbackStats.find(item => item.rating === 'happy')?.count || 0,
            fill: "#57A8F5"
          }
        ];

        // Calculate weighted score (Happy + Neutral*0.5)
        const happyCount = transformedData[2].value;
        const neutralCount = transformedData[1].value;
        const total = transformedData.reduce((sum, item) => sum + item.value, 0);
        const weighted = happyCount + (neutralCount * 0.5);
        const score = total > 0 ? Math.round((weighted / total) * 100) : 0;
        
        setChartData(transformedData);
        setOverallScore(score);
        setWeightedValue(weighted);
        setTotalResponses(total);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching feedback data:', error);
        setLoading(false);
      }
    };

    fetchFeedbackData();
  }, []);

  if (loading) {
    return <div className="circular-chart-container">Loading satisfaction data...</div>;
  }

  return (
    <div className="circular-chart-container" style={{ textAlign: "center" }}>
      <h3 style={{ color: "#0D0D3D" }}>Customer Satisfaction Score</h3>
      <RadialBarChart
        width={365}
        height={310}
        cx="50%"
        cy="45%"
        innerRadius="47%"
        outerRadius="95%"
        barSize={16}
        data={chartData}
        startAngle={90}
        endAngle={-270}
      >
        <PolarAngleAxis type="number" domain={[0, Math.max(...chartData.map(d => d.value))]} angleAxisId={0} tick={false} />
        <RadialBar dataKey="value" background cornerRadius={50} />
        <text
          x="50%"
          y="45%"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={24}
          fontWeight="bold"
        >
          {overallScore}%
        </text>
        <text
          x="50%"
          y="52%"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={12}
          fill="#666"
        >
          ({weightedValue.toFixed(1)}/{totalResponses})
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
          payload={[...chartData].reverse().map((entry) => ({
            value: entry.name,
            color: entry.fill,
            type: "rect",
          }))}
        />
      </RadialBarChart>
    </div>
  );
};

export default CustomerSatisfactionChart;