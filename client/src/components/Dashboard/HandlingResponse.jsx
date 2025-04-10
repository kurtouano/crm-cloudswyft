import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function HandlingResponse() {
  const [responseData, setResponseData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:4000/api/analytics/handling-time");
        const data = await response.json();
        setResponseData(data);
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

    const tableColumn = ["Handling Time Range (Hours)", "Number of Responses"];
    const tableRows = responseData.map((item) => [item.hours, item.responses.toString()]);

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

      <ResponsiveContainer width="100%" height={315}>
        <BarChart data={responseData} margin={{ top: 30, right: 20, left: 0, bottom: 38 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="hours"
            tick={{ fontSize: 12, fill: "#4F4F4F", dy: 7 }}
            label={{
              value: "Hours",
              position: "bottom",
              dy: 8,
              fontSize: 12,
              fill: "#4F4F4F",
            }}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 12, fill: "#4F4F4F", dx: -7 }}
            label={{
              value: "Number of Responses",
              angle: -90,
              position: "insideLeft",
              dy: 65,
              dx: 8,
              fontSize: 12,
              fill: "#4F4F4F",
            }}
          />
          <Tooltip cursor={{ fill: "transparent" }} />
          <Bar dataKey="responses" fill="#00A3FF" barSize={30} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
