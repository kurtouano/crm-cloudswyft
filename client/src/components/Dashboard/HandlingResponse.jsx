import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import jsPDF from "jspdf";

export default function HandlingResponse() {
  const [responseData, setResponseData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:4000/api/tickets/stats");
        const data = await response.json();
        
        // Transform data for your chart
        const chartData = [
          { hours: '0-1', tickets: data.find(item => item._id === '0-1 hour')?.count || 0 },
          { hours: '1-3', tickets: data.find(item => item._id === '1-3 hours')?.count || 0 },
          { hours: '4-6', tickets: data.find(item => item._id === '4-6 hours')?.count || 0 },
          { hours: '7-12', tickets: data.find(item => item._id === '7-12 hours')?.count || 0 },
          { hours: '13-18', tickets: data.find(item => item._id === '13-18 hours')?.count || 0 },
          { hours: '19-24', tickets: data.find(item => item._id === '19-24 hours')?.count || 0 },
          { hours: '24-48', tickets: data.find(item => item._id === '24-48 hours')?.count || 0 },
          { hours: '48-72', tickets: data.find(item => item._id === '48-72 hours')?.count || 0 },
          { hours: '72+', tickets: data.find(item => item._id === '72+ hours')?.count || 0 }
        ];
        
        setResponseData(chartData);
      } catch (error) {
        console.error("Error fetching handling time data:", error);
      }
    };

    fetchData();
  }, []);

  const generatePdfReport = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Handling Time Report", 14, 20);

    const tableColumn = ["Handling Time Range (Hours)", "Number of Tickets"];
    const tableRows = responseData.map((item) => [item.hours, item.tickets.toString()]);

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 30,
      theme: 'grid',
      styles: {
        fontSize: 11,
        halign: 'center',
        valign: 'middle',
        font: "helvetica"
      },
      headStyles: {
        fontStyle: 'bold',
        fillColor: [209, 231, 255],
        textColor: [0, 0, 0],
        halign: 'center',
        valign: 'middle'
      },
      columnStyles: {
        0: { cellWidth: 80 },
        1: { cellWidth: 50 }
      },
      margin: { top: 25 },
      tableWidth: 'wrap',            // 💡 this wraps to content size
      tableLineWidth: 0,             // no outside box
      didDrawPage: (data) => {
        // Center table manually by adjusting X position
        const pageWidth = doc.internal.pageSize.getWidth();
        const tableWidth = data.table.width;
        const centerX = (pageWidth - tableWidth) / 2;
        data.settings.margin.left = centerX;
      }
    });
    
    doc.save("HandlingTimeReport.pdf");
  };

  return (
    <div className="handling-response-container">
      <div className="handling-header">
        <h3 className="handling-title">Handling Time</h3>
        <button className="download-chart-btn" onClick={generatePdfReport}>
          DOWNLOAD DATA
        </button>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={responseData} margin={{ top: 30, right: 20, left: 0, bottom: 38 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="hours"
            tick={{ fontSize: 12, fill: "#4F4F4F", dy: 7 }}
            label={{
              value: "Total Handling Time (Hours)",
              position: "bottom",
              dy: 15,
              fontSize: 12,
              fill: "#4F4F4F",
            }}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 12, fill: "#4F4F4F", dx: -7 }}
            label={{
              value: "Number of Tickets",
              angle: -90,
              position: "insideLeft",
              dy: 65,
              dx: 8,
              fontSize: 12,
              fill: "#4F4F4F",
            }}
          />
          <Tooltip cursor={{ fill: "transparent" }} />
          <Bar dataKey="tickets" fill="#00A3FF" barSize={30} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
