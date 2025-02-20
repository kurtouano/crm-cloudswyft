import { useState, useEffect } from "react";
import ReactPaginate from "react-paginate";
import axios from "axios";
import "./Dashboard.css";  

export default function LeadsTable() {
  const [leads, setLeads] = useState([]);
  const [page, setPage] = useState(0);
  const rowsPerPage = 6; 

  // ✅ Function to Fetch Leads
  const fetchLeads = async () => {
    try {
      const response = await axios.get("http://localhost:4000/api/leads");
      setLeads(response.data);
    } catch (error) {
      console.error("Error fetching leads:", error);
    }
  };

  // ✅ Fetch Leads on Initial Load & Auto-Refresh Every 5 Seconds
  useEffect(() => {
    fetchLeads(); // Initial Fetch
    const interval = setInterval(fetchLeads, 5000); // Auto-refresh every 5 sec
    return () => clearInterval(interval); // Cleanup interval on unmount
  }, []);

  const handlePageClick = (event) => {
    setPage(event.selected);
  };

  return (
    <div className="table-container">
      <table aria-label="leads table">
        <thead>
          <tr className="table-header-container">
            <th className='table-header-list lead-table'>Lead</th>
            <th className='table-header-list font-geist'>Email</th>
            <th className='table-header-list'>Stage</th>
            <th className='table-header-list date-table'>Date Contacted</th>
          </tr>
        </thead>
        <tbody>
          {leads.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((lead, index) => (
            <tr className='table-body-list-container' key={index}>
              <td className='table-body-list'>{lead.lead}</td>
              <td className='table-body-list font-geist'>{lead.email}</td>
              <td className='table-body-list'>{lead.stage}</td>
              <td className='table-body-list'>{lead.date}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="pagination-container">
        <ReactPaginate
          breakLabel="..."
          nextLabel=">"
          onPageChange={handlePageClick}
          pageRangeDisplayed={4} 
          marginPagesDisplayed={1} 
          pageCount={Math.ceil(leads.length / rowsPerPage)}
          previousLabel="<"
          containerClassName="pagination"
          activeClassName="active"
        />
      </div>
    </div>
  );
}
