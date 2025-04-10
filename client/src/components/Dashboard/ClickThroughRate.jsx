import { useEffect, useState } from 'react';
import io from 'socket.io-client';

export default function ClickThroughRate() {
  const [clickThroughData, setClickThroughData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [socket, setSocket] = useState(null);

  // Set up WebSocket connection
  useEffect(() => {
    const newSocket = io('http://localhost:4000');
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
        const response = await fetch('http://localhost:4000/api/newsletters/click-data');
        
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

  if (loading) return <div>Loading click-through data...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div className="ctr-container">
      <h3 className="ctr-title">Click-Through Rate</h3>

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