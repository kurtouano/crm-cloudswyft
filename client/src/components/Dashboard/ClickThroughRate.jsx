const clickThroughData = [
  { id: 1, service: "Option 1", popularity: 80, sales: 45 },
  { id: 2, service: "Option 2", popularity: 60, sales: 29 },
  { id: 3, service: "Option 3", popularity: 50, sales: 18 },
  { id: 4, service: "Option 4", popularity: 30, sales: 25 },
];

export default function ClickThroughRate() {
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
              <th>Sales</th>
            </tr>
          </thead>
          <tbody>
            {clickThroughData.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.service}</td>
                <td>
                  <div className="ctr-progress">
                    <div
                      className="ctr-progress-bar"
                      style={{ width: `${item.popularity}%`, backgroundColor: "#1976D2" }}
                    ></div>
                  </div>
                </td>
                <td>
                  <div className="ctr-sales">{item.sales}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
