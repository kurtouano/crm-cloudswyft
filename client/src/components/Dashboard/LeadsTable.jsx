import { useState } from 'react';
import ReactPaginate from 'react-paginate';
import './Dashboard.css';  // Import the CSS file for styling

// Sample leads data
const leads = [
  { lead: "Lead Name 1", email: "lead1@outlook.com", stage: "Lead", date: "2024/02/01" },
  { lead: "Lead Name 2", email: "lead2@outlook.com", stage: "Prospect", date: "2024/02/02" },
  { lead: "Lead Name 3", email: "lead3@outlook.com", stage: "Negotiation", date: "2024/02/03" },
  { lead: "Lead Name 4", email: "lead4@outlook.com", stage: "Closed", date: "2024/02/04" },
  { lead: "Lead Name 5", email: "lead5@outlook.com", stage: "Lost", date: "2024/02/05" },
  { lead: "Lead Name 6", email: "lead6@outlook.com", stage: "Lead", date: "2024/02/06" },
  { lead: "Lead Name 7", email: "lead7@outlook.com", stage: "Prospect", date: "2024/02/07" },
  { lead: "Lead Name 8", email: "lead8@outlook.com", stage: "Negotiation", date: "2024/02/08" },
  { lead: "Lead Name 9", email: "lead9@outlook.com", stage: "Closed", date: "2024/02/09" },
  { lead: "Lead Name 3", email: "lead3@outlook.com", stage: "Negotiation", date: "2024/02/03" },
  { lead: "Lead Name 4", email: "lead4@outlook.com", stage: "Closed", date: "2024/02/04" },
  { lead: "Lead Name 5", email: "lead5@outlook.com", stage: "Lost", date: "2024/02/05" },
  { lead: "Lead Name 6", email: "lead6@outlook.com", stage: "Lead", date: "2024/02/06" },
  { lead: "Lead Name 7", email: "lead7@outlook.com", stage: "Prospect", date: "2024/02/07" },
  { lead: "Lead Name 8", email: "lead8@outlook.com", stage: "Negotiation", date: "2024/02/08" },
  { lead: "Lead Name 9", email: "lead9@outlook.com", stage: "Closed", date: "2024/02/09" },
  { lead: "Lead Name 3", email: "lead3@outlook.com", stage: "Negotiation", date: "2024/02/03" },
  { lead: "Lead Name 4", email: "lead4@outlook.com", stage: "Closed", date: "2024/02/04" },
  { lead: "Lead Name 5", email: "lead5@outlook.com", stage: "Lost", date: "2024/02/05" },
  { lead: "Lead Name 6", email: "lead6@outlook.com", stage: "Lead", date: "2024/02/06" },
  { lead: "Lead Name 7", email: "lead7@outlook.com", stage: "Prospect", date: "2024/02/07" },
  { lead: "Lead Name 8", email: "lead8@outlook.com", stage: "Negotiation", date: "2024/02/08" },
  { lead: "Lead Name 9", email: "lead9@outlook.com", stage: "Closed", date: "2024/02/09" },
  { lead: "Lead Name 4", email: "lead4@outlook.com", stage: "Closed", date: "2024/02/04" },
  { lead: "Lead Name 5", email: "lead5@outlook.com", stage: "Lost", date: "2024/02/05" },
  { lead: "Lead Name 6", email: "lead6@outlook.com", stage: "Lead", date: "2024/02/06" },
  { lead: "Lead Name 7", email: "lead7@outlook.com", stage: "Prospect", date: "2024/02/07" },
  { lead: "Lead Name 8", email: "lead8@outlook.com", stage: "Negotiation", date: "2024/02/08" },
  { lead: "Lead Name 9", email: "lead9@outlook.com", stage: "Closed", date: "2024/02/09" },
  { lead: "Lead Name 3", email: "lead3@outlook.com", stage: "Negotiation", date: "2024/02/03" },

];

export default function LeadsTable() {
  const [page, setPage] = useState(0);
  const rowsPerPage = 6; // Fixed number of rows per page

  // Handle page change using react-paginate
  const handlePageClick = (event) => {
    const selectedPage = event.selected;
    setPage(selectedPage);
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

      {/* Pagination using react-paginate */}
      <div className="pagination-container">
        <ReactPaginate
          breakLabel="..."
          nextLabel=">"
          onPageChange={handlePageClick}
          pageRangeDisplayed={4}  // Show 4 pages in the middle
          marginPagesDisplayed={1} // Show 1 page on each side (first and last)
          pageCount={Math.ceil(leads.length / rowsPerPage)}
          previousLabel="<"
          containerClassName="pagination"
          activeClassName="active"
        />
      </div>
    </div>
  );
}
