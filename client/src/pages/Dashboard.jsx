import '../components/Dashboard/Dashboard.css';
import LeadsTable from '../components/Dashboard/LeadsTable';
import CircularProgressChart from '../components/Dashboard/CircularProgressChart';
import OnboardedClientsChart from '../components/Dashboard/OnboardedClientsChart';
import ProjectSummaryCards from '../components/Dashboard/ProjectSummaryCards';
import ResponseTime from '../components/Dashboard/ResponseTime';
import ClickThroughRate from '../components/Dashboard/ClickThroughRate';
import HandlingResponse from '../components/Dashboard/HandlingResponse';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useEffect, useState } from 'react';

export default function Dashboard() {
  const [clickData, setClickData] = useState([]);
  const [handlingData, setHandlingData] = useState([]);

  // Fetch data from both endpoints
  useEffect(() => {
    fetch('http://localhost:4000/api/newsletters/click-data')
      .then(res => res.json())
      .then(setClickData)
      .catch(err => console.error('Click Data Error:', err));

    fetch('http://localhost:4000/api/analytics/handling-time')
      .then(res => res.json())
      .then(setHandlingData)
      .catch(err => console.error('Handling Time Error:', err));
  }, []);

  const generateDashboardReport = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Title
    const title = "Dashboard Report";
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    const titleWidth = doc.getTextWidth(title);
    doc.text(title, (pageWidth - titleWidth) / 2, 20);

    const now = new Date();
    const formattedDate = now.toLocaleDateString();
    const formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const generatedText = `Generated on ${formattedDate} at ${formattedTime}`;


    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const dateWidth = doc.getTextWidth(generatedText);
    doc.text(generatedText, (pageWidth - dateWidth) / 2, 27); 

    // Section 1: Click-Through Rate
    doc.setFontSize(14);
    doc.text("Click-Through Rate", 14, 35);

    const clickHeaders = ["#", "Service", "Link", "Clicks", "Popularity (%)"];
    const clickRows = clickData.map(item => [
      item.serviceNum.toString(),
      item.title,
      item.link,
      item.clicks.toString(),
      `${item.popularity}%`
    ]);

    autoTable(doc, {
      head: [clickHeaders],
      body: clickRows,
      startY: 40,
      theme: 'grid',
      styles: {
        fontSize: 10,
        halign: 'center',
        valign: 'middle',
        font: "helvetica"
      },
      headStyles: {
        fillColor: [209, 231, 255],
        textColor: [0, 0, 0],
        fontStyle: 'bold'
      },
      columnStyles: {
        0: { cellWidth: 10 },
        1: { cellWidth: 50 },
        2: { cellWidth: 70 },
        3: { cellWidth: 15 },
        4: { cellWidth: 25 }
      },
      margin: { top: 40 },
      didDrawPage: (data) => {
        const tableWidth = data.table.width;
        const centerX = (pageWidth - tableWidth) / 2;
        data.settings.margin.left = centerX;
      }
    });

    // Section 2: Handling Time
    const handlingY = doc.previousAutoTable.finalY + 15;
    doc.setFontSize(14);
    doc.text("Handling Time", 14, handlingY);

    const handlingHeaders = ["Handling Time Range (Hours)", "Number of Tickets"];
    const handlingRows = handlingData.map(row => [row.hours, row.responses.toString()]);

    autoTable(doc, {
      head: [handlingHeaders],
      body: handlingRows,
      startY: handlingY + 5,
      theme: 'grid',
      styles: {
        fontSize: 10,
        halign: 'center',
        valign: 'middle',
        font: "helvetica"
      },
      headStyles: {
        fillColor: [209, 231, 255],
        textColor: [0, 0, 0],
        fontStyle: 'bold'
      },
      columnStyles: {
        0: { cellWidth: 80 },
        1: { cellWidth: 50 }
      },
      didDrawPage: (data) => {
        const tableWidth = data.table.width;
        const centerX = (pageWidth - tableWidth) / 2;
        data.settings.margin.left = centerX;
      }
    });

    doc.save("DashboardReport.pdf");
  };

  return (
    <div className='dashboard-page-container'>
      <div className="dashboard-header-bar">
        <div className="dashboard-header-text">Dashboard</div>
        <button className="dashboard-report-btn" onClick={generateDashboardReport}>
          GENERATE REPORT
        </button>
      </div>

      <div className="dashboard-horizontal-alignment">
        <LeadsTable />
        <CircularProgressChart />
      </div>

      <div className="onboarded-dashboard-grid-container">
        <div className="onboarded-dashboard-grid-large">
          <OnboardedClientsChart />
        </div>
        <div className="onboarded-dashboard-grid-small">
          <ResponseTime />
        </div>
      </div>

      <div className="clickthrough-dashboard-grid-container">
        <div className="clickthrough-dashboard-grid-large">
          <ClickThroughRate />
        </div>
        <div className="clickthrough-dashboard-grid-small">
          <HandlingResponse />
        </div>
      </div>
    </div>
  );
}
