import { useState, useEffect } from "react";
import ReactPaginate from "react-paginate";
import axios from "axios";
import "./Dashboard.css";  

export default function LeadsTable() {
  const [leads, setLeads] = useState([]);
  const [page, setPage] = useState(0);
  const rowsPerPage = 6; 

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const response = await axios.get("http://localhost:4000/api/leads");
        setLeads(response.data);
      } catch (error) {
        console.error("Error fetching leads:", error);
      }
    };

    fetchLeads();
  }, []);

  const handlePageClick = (event) => {
    setPage(event.selected);
  };

  return (
    <div className="table-container">
      <table aria-label="leads table">
        <thead>
          <tr className="table-header-container">
            <th className='table-header-list lead-table'>Company</th>
            <th className='table-header-list lead-table'>Lead Name</th>
            <th className='table-header-list font-geist'>Email</th>
            <th className='table-header-list'>Stage</th>
            <th className='table-header-list date-table'>Import Date</th>
          </tr>
        </thead>
        <tbody>
          {leads.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((lead, index) => (
            <tr className='table-body-list-container' key={index}>
              <td className='table-body-list'>{lead.company}</td>
              <td className='table-body-list'>{lead.leadName}</td>
              <td className='table-body-list font-geist'>{lead.bestEmail}</td>
              <td className='table-body-list lead-stage'>{lead.stage}</td>
              <td className='table-body-list'>{lead.importDate}</td>
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
