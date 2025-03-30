import { useState, useEffect } from "react";
import ReactPaginate from "react-paginate";
import axios from "axios";
import "./SalesTeam.css";  

export default function TeamsTable() {
  const [leads, setLeads] = useState([]);
  const [page, setPage] = useState(0);
  const rowsPerPage = 7; 

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axios.get("http://localhost:4000/api/auth/employees");
        setLeads(response.data);
      } catch (error) {
        console.error("Error fetching employees:", error);
      }
    };
  
    fetchEmployees();
  }, []);
  

  const handlePageClick = (event) => {
    setPage(event.selected);
  };

  return (
    <div className="table-container">
      <table aria-label="leads table">
        <thead>
          <tr className="table-header-container">
            <th className='table-header-list lead-table'>Name </th>
            <th className='table-header-list font-geist'>Email</th>
            <th className='table-header-list'>Employee ID</th>
            <th className='table-header-list date-table'>Last Login Date</th>
          </tr>
        </thead>
        <tbody>
          {leads.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((emp, index) => (
            <tr className='table-body-list-container' key={index}>
              <td className='table-body-list'>{emp.name}</td>
              <td className='table-body-list font-geist'>{emp.email}</td>
              <td className='table-body-list lead-stage'>{emp.employeeId}</td>
              <td className='table-body-list'>
                {emp.lastLogin ? new Date(emp.lastLogin).toISOString().split("T")[0] : "N/A"}
              </td>
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
