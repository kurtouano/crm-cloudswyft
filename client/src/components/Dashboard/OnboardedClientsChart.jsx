const API_URL = import.meta.env.VITE_BACKEND_URL; 

import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import axios from 'axios';
import jsPDF from 'jspdf';

const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

const CustomLegend = () => (
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

export default function OnboardedClientsChart() {
  const [chartData, setChartData] = useState([]);
  const [maxValue, setMaxValue] = useState(100);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/onboarded/stats`);
        const { currentYear, lastYear } = response.data;

        const allValues = [...currentYear, ...lastYear];
        const calculatedMax = Math.max(...allValues) + 10;
        setMaxValue(calculatedMax < 10 ? 10 : calculatedMax);

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

  const generatePdfReport = () => {
    const doc = new jsPDF();
    const currentYear = new Date().getFullYear();
    const previousYear = currentYear - 1;

    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Yearly On-boarded Clients Report", 105, 20, null, null, "center");

    const tableColumn = ["Month", `Clients in ${currentYear}`, `Clients in ${previousYear}`];
    const tableRows = chartData.map(row => [
      row.month,
      row.current.toString(),
      row.past.toString()
    ]);

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 30,
      theme: 'grid',
      headStyles: {
        fillColor: [209, 231, 255],
        textColor: [0, 0, 0],
        fontStyle: 'bold',
        halign: 'center'
      },
      styles: {
        fontSize: 11,
        halign: 'center',
        font: 'helvetica'
      },
      margin: { top: 30 }
    });

    doc.save("OnboardedClientsReport.pdf");
  };

  return (
    <div className="onboarded-chart-container">
      <div className="onboarded-header-row">
        <h3 className="onboarded-chart-title">Yearly On-boarded Clients</h3>
        <button className="onboarded-download-btn" onClick={generatePdfReport}>
          DOWNLOAD DATA
        </button>
      </div>

      <CustomLegend />

      <ResponsiveContainer width="100%" height={330}>
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
            ticks={Array.from({ length: Math.ceil(maxValue / 10) }, (_, i) => (i + 1) * 10)}
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
