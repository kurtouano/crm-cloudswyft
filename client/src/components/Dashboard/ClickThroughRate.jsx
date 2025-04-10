import { useEffect, useState } from 'react';

export default function ClickThroughRate() {
  const [clickThroughData, setClickThroughData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalClicks, setTotalClicks] = useState(0);

  useEffect(() => {
    const fetchClickData = async () => {
      try {
        const response = await fetch('http://localhost:4000/api/newsletters/click-data');
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Calculate total clicks for display
        const total = data.reduce((sum, item) => sum + item.clicks, 0);
        setTotalClicks(total);
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

  if (loading) return <div>Loading click-through data...</div>;
  if (error) return <div>Error: {error}</div>;
  return (
    <div className="ctr-container">
      <h3 className="ctr-title">Click-Through Rate</h3>

      <div className="ctr-table">
        <table>
          <thead>
            <tr>
              <th>Service Advertised</th>
              <th>Popularity</th>
              <th>Clicks</th>
            </tr>
          </thead>
          <tbody>
            {clickThroughData.map((item) => (
              <tr key={item.serviceNum}>
                <td>{item.title}</td>

                <td>
                  <div className="ctr-progress">
                    <div
                      className="ctr-progress-bar"
                      style={{ width: `${item.popularity}%`, backgroundColor: "#1976D2" }}
                    ></div>
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



