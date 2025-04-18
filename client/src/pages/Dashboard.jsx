const API_URL = import.meta.env.VITE_BACKEND_URL; 

import '../components/Dashboard/Dashboard.css';
import LeadsTable from '../components/Dashboard/LeadsTable';
import CircularProgressChart from '../components/Dashboard/CustomerSatisfaction';
import OnboardedClientsChart from '../components/Dashboard/OnboardedClientsChart';
import ResponseTime from '../components/Dashboard/ResponseTime';
import ClickThroughRate from '../components/Dashboard/ClickThroughRate';
import HandlingResponse from '../components/Dashboard/HandlingResponse';
import useMicrosoftAuthentication from '../utils/AuthMicrosoft';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useEffect, useState } from 'react';

export default function Dashboard() {
  useMicrosoftAuthentication();

  const [clickData, setClickData] = useState([]);
  const [handlingData, setHandlingData] = useState([]);
  const [leads, setLeads] = useState([]);
  const [onboardedData, setOnboardedData] = useState({ currentYear: [], lastYear: [] });
  const [feedbackStats, setFeedbackStats] = useState([]);


useEffect(() => {
  fetch(`${API_URL}/api/onboarded/stats`)
    .then(res => res.json())
    .then(data => setOnboardedData(data))
    .catch(err => console.error('Onboarded Data Error:', err));
}, []);

  // Fetch data
  useEffect(() => {
    fetch(`${API_URL}/api/newsletters/click-data`)
      .then(res => res.json())
      .then(setClickData)
      .catch(err => console.error('Click Data Error:', err));

    fetch(`${API_URL}/api/onboarded/stats`)
    .then(res => res.json())
    .then(data => setOnboardedData(data))
    .catch(err => console.error('Onboarded Data Error:', err));

    fetch(`${API_URL}/api/analytics/handling-time`)
      .then(res => res.json())
      .then(setHandlingData)
      .catch(err => console.error('Handling Time Error:', err));

    fetch(`${API_URL}/api/leads`)
      .then(res => res.json())
      .then(setLeads)
      .catch(err => console.error('Leads Data Error:', err));

    fetch(`${API_URL}/api/feedback/stats`)
      .then(res => res.json())
      .then(setFeedbackStats)
      .catch(err => console.error('Feedback Stats Error:', err));
  }, []);

  const generateDashboardReport = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
  
    // Title
    const title = "Dashboard Report";
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(title, pageWidth / 2, 20, { align: 'center' });
  
    const now = new Date();
    const generatedText = `Generated on ${now.toLocaleDateString()} at ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(generatedText, pageWidth / 2, 27, { align: 'center' });
  
    let currentY = 35;
  
   // Section 1: Click-Through Rate
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Click-Through Rate", 14, currentY);
    currentY += 5;

    autoTable(doc, {
      head: [["#", "Service", "Link", "Clicks", "Popularity (%)"]],
      body: clickData.map(item => [
        item.serviceNum.toString(),
        item.title,
        item.link,
        item.clicks.toString(),
        `${item.popularity}%`
      ]),
      startY: currentY,
      theme: 'grid',
      styles: {
        fontSize: 10,
        font: "helvetica",
        valign: 'middle',
        overflow: 'linebreak',
        cellPadding: 3
      },
      headStyles: {
        fillColor: [209, 231, 255],
        textColor: [0, 0, 0],
        fontStyle: 'bold'
      },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        1: { cellWidth: 50, halign: 'left' },
        2: { cellWidth: 80, halign: 'left' },
        3: { cellWidth: 15, halign: 'center' },
        4: { cellWidth: 25, halign: 'center' }
      },
      margin: { top: currentY, left: 14, right: 14 },
      tableWidth: 'wrap'
    });

    currentY = doc.previousAutoTable.finalY + 15; // 💡 space after Click-Through table

    // Section 2: Yearly On-boarded Clients
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Yearly On-boarded Clients", 14, currentY);
    currentY += 5;

    const currentYear = new Date().getFullYear();
    const previousYear = currentYear - 1;
    const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

    const onboardedHeaders = ["Month", `Clients in ${currentYear}`, `Clients in ${previousYear}`];
    const onboardedRows = monthNames.map((month, index) => [
      month,
      onboardedData.currentYear?.[index]?.toString() || "0",
      onboardedData.lastYear?.[index]?.toString() || "0"
    ]);

    autoTable(doc, {
      head: [onboardedHeaders],
      body: onboardedRows,
      startY: currentY,
      theme: 'grid',
      styles: {
        fontSize: 10,
        font: "helvetica",
        valign: 'middle',
        halign: 'center'
      },
      headStyles: {
        fillColor: [209, 231, 255],
        textColor: [0, 0, 0],
        fontStyle: 'bold'
      },
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 40 },
        2: { cellWidth: 40 }
      },
      margin: { top: currentY, left: 14, right: 14 },
      tableWidth: 'wrap'
    });

    currentY = doc.previousAutoTable.finalY + 15;


    // ✨ NEW PAGE FOR HANDLING TIME
    doc.addPage();
    currentY = 20;
  
    // Section 3: Handling Time
    doc.setFontSize(14);
    doc.text("Handling Time", 14, currentY);
    currentY += 5;
  
    autoTable(doc, {
      head: [["Handling Time Range (Hours)", "Number of Tickets"]],
      body: handlingData.map(row => [row.hours, row.responses.toString()]),
      startY: currentY,
      theme: 'grid',
      styles: {
        fontSize: 10,
        font: "helvetica",
        halign: 'center',
        valign: 'middle'
      },
      headStyles: {
        fillColor: [209, 231, 255],
        textColor: [0, 0, 0],
        fontStyle: 'bold'
      },
      margin: { top: currentY, left: 14, right: 14 },
      tableWidth: 'wrap'
    });
  
    currentY = doc.previousAutoTable.finalY + 15;
  
    // Section 4: Lead List
    doc.setFontSize(14);
    doc.text("Lead List", 14, currentY);
    currentY += 5;
  
    const leadHeaders = ["Company", "Email", "Stage", "Date Added"];
    const leadRows = leads.map(lead => [
      lead.company,
      lead.bestEmail,
      lead.stage,
      new Date(lead.importDate).toLocaleDateString()
    ]);
  
    autoTable(doc, {
      head: [leadHeaders],
      body: leadRows,
      startY: currentY,
      theme: 'grid',
      styles: {
        fontSize: 10,
        font: "helvetica",
        valign: 'middle'
      },
      columnStyles: {
        0: { cellWidth: 45, halign: 'left' },
        1: { cellWidth: 70, halign: 'left' },
        2: { cellWidth: 30, halign: 'center' },
        3: { cellWidth: 25, halign: 'center' }
      },
      headStyles: {
        fillColor: [209, 231, 255],
        textColor: [0, 0, 0],
        fontStyle: 'bold'
      },
      margin: { top: currentY, left: 14, right: 14 },
      tableWidth: 'wrap'
    });

     // ✨ NEW PAGE FOR CUSTOMER SATISFACTION
     doc.addPage();
     currentY = 20;
     
     // Section 5: Customer Satisfaction Score
     doc.setFontSize(14);
     doc.setFont("helvetica", "bold");
     doc.text("Customer Satisfaction Score", 14, currentY);
     currentY += 10;
     
     // Calculate overall score
     const totalResponses = feedbackStats.reduce((sum, item) => sum + item.count, 0);
     const happyCount = feedbackStats.find(item => item.rating === 'happy')?.count || 0;
     const neutralCount = feedbackStats.find(item => item.rating === 'neutral')?.count || 0;
     const weightedValue = happyCount + (neutralCount * 0.5);
     const overallScore = totalResponses > 0 ? Math.round((weightedValue / totalResponses) * 100) : 0;
     
     // Text Summary
     doc.setFontSize(12);
     doc.setFont("helvetica", "normal");
     doc.text(`Overall Score: ${overallScore}%`, 14, currentY);
     currentY += 7;
     doc.text(`Weighted Value: ${weightedValue.toFixed(1)} / ${totalResponses}`, 14, currentY);
     currentY += 10;
     
     // Table without Conversion Points column
     const satisfactionHeaders = ["Rating", "Count", "Score"];
     const satisfactionRows = feedbackStats.map(item => {
       let unitScore = 0;
       if (item.rating === "happy") unitScore = 1;
       else if (item.rating === "neutral") unitScore = 0.5;
       else unitScore = 0;
     
       const score = (item.count * unitScore).toFixed(1);
       return [
         item.rating.charAt(0).toUpperCase() + item.rating.slice(1),
         item.count.toString(),
         score
       ];
     });
     
     autoTable(doc, {
       head: [satisfactionHeaders],
       body: satisfactionRows,
       startY: currentY,
       theme: 'grid',
       styles: {
         fontSize: 10,
         font: "helvetica",
         valign: 'middle',
         halign: 'center'
       },
       headStyles: {
         fillColor: [209, 231, 255],
         textColor: [0, 0, 0],
         fontStyle: 'bold'
       },
       columnStyles: {
         0: { cellWidth: 40 },
         1: { cellWidth: 30 },
         2: { cellWidth: 30 }
       },
       margin: { top: currentY, left: 14, right: 14 },
       tableWidth: 'wrap'
     });
     
     currentY = doc.previousAutoTable.finalY + 10;
     
     // 📝 Keep the reference for transparency
     doc.setFontSize(9);
     doc.setFont("helvetica", "italic");
     doc.setTextColor(100);
     doc.text("Conversion Points: Happy = 1, Neutral = 0.5, Sad = 0", 14, currentY);
  
// After the Customer Satisfaction Score section

    // 🆕 Section 6: Response Time (based on HandlingResponse.js structure)
currentY += 12; // 👈 Adds vertical spacing between sections
doc.setFontSize(14);
doc.setFont("helvetica", "bold");
doc.text("Response Time", 14, currentY);
currentY += 8; // spacing below the title

autoTable(doc, {
  head: [["Response Time Range (Hours)", "Number of Responses"]],
  body: handlingData.map(item => [item.hours, item.responses.toString()]),
  startY: currentY,
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
  margin: { top: currentY },
  tableWidth: 'wrap',
  tableLineWidth: 0,
  didDrawPage: (data) => {
    const pageWidth = doc.internal.pageSize.getWidth();
    const tableWidth = data.table.width;
    const centerX = (pageWidth - tableWidth) / 2;
    data.settings.margin.left = centerX;
  }
});

currentY = doc.previousAutoTable.finalY + 15;




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
