const API_URL = import.meta.env.VITE_BACKEND_URL; 

import { useEffect, useState } from 'react';
import io from 'socket.io-client';
import jsPDF from 'jspdf';
import 'jspdf-autotable'; 


export default function ClickThroughRate() {
  const [clickThroughData, setClickThroughData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [socket, setSocket] = useState(null);

  // Set up WebSocket connection
  useEffect(() => {
    const newSocket = io(`${API_URL}`);
    setSocket(newSocket);
    
    console.log('WebSocket connection initialized');
    
    // Clean up the connection when component unmounts
    return () => {
      console.log('Closing WebSocket connection');
      newSocket.disconnect();
    };
  }, []);

  // Initial data fetch
  useEffect(() => {
    const fetchClickData = async () => {
      try {
        console.log('Fetching initial click data...');
        const response = await fetch(`${API_URL}/api/newsletters/click-data`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Initial click data received:', data);
        setClickThroughData(data);
      } catch (err) {
        console.error("Error fetching click data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchClickData();
  }, []);

  // Listen for real-time updates
  useEffect(() => {
    if (!socket) return;
    
    // Listen for click data updates from server
    socket.on('click-data-update', (updatedData) => {
      console.log('Real-time update received:', updatedData);
      setClickThroughData(updatedData);
    });

    return () => {
      socket.off('click-data-update');
    };
  }, [socket]);

  const generatePdfReport = () => {
    const doc = new jsPDF();
  
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text('Click-Through Rate Report', 14, 20);
  
    const tableColumn = ["#", "Service Advertised", "Link", "Clicks", "Popularity (%)"];
    const tableRows = [];
  
    clickThroughData.forEach((item) => {
      tableRows.push([
        item.serviceNum.toString(),
        item.title,
        item.link,
        item.clicks.toString(),
        `${item.popularity}%`
      ]);
    });
  
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
        0: { cellWidth: 10 },
        1: { cellWidth: 50 },
        2: { cellWidth: 80 },
        3: { cellWidth: 15 },
        4: { cellWidth: 25 }
      },
      margin: { top: 25 },
    });
  
    doc.save('ClickThroughRateReport.pdf');
  };
  

  if (loading) return <div>Loading click-through data...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div className="ctr-container">
      <div className="ctr-header">
          <h3 className="ctr-title">Click-Through Rate</h3>
          <button className="download-chart-btn" onClick={generatePdfReport}>
            DOWNLOAD DATA
          </button>
        </div>
      <div className="ctr-table">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Service Advertised</th>
              <th>Popularity</th>
              <th>Clicks</th>
            </tr>
          </thead>
          <tbody>
            {clickThroughData.map((item) => (
              <tr key={item.serviceNum}>
                <td>{item.serviceNum}</td>
                <td>{item.title}</td>

                <td title={`${item.popularity}%`}>
                  <div className="ctr-progress">
                    <div
                      className="ctr-progress-bar"
                      style={{ width: `${item.popularity}%`, backgroundColor: "#1976D2" }}
                    >
                    </div>
                  </div>
                </td>

                <td>
                  <div className="ctr-sales">{item.clicks}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}