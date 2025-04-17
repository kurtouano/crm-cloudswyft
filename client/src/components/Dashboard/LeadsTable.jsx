const API_URL = import.meta.env.VITE_BACKEND_URL; 

import { useState, useEffect } from "react";
import ReactPaginate from "react-paginate";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "./Dashboard.css";

export default function LeadsTable() {
  const [leads, setLeads] = useState([]);
  const [page, setPage] = useState(0);
  const rowsPerPage = 6;

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/leads`);
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

  const generateLeadsPdf = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Lead List Report", 105, 20, null, null, "center");

    const tableColumn = ["Company",  "Email", "Stage", "Date Added"];
    const tableRows = leads.map((lead) => [
      lead.company,
      lead.bestEmail,
      lead.stage,
      lead.importDate
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 30,
      theme: 'grid',
      headStyles: {
        fillColor: [209, 231, 255],
        textColor: [0, 0, 0],
        fontStyle: 'bold'
      },
      styles: {
        fontSize: 11,
        halign: 'center',
        font: 'helvetica'
      },
      margin: { top: 30 }
    });

    doc.save("LeadsReport.pdf");
  };

  return (
    <div className="table-container">
      <div className="table-title-bar">
        <h3 className="table-section-title">Leads</h3>
        <button className="download-leads-btn" onClick={generateLeadsPdf}>
          DOWNLOAD LEADS
        </button>
      </div>

      <table aria-label="leads table">
        <thead>
          <tr className="table-header-container">
            <th className='table-header-list lead-table'>Company</th>
            <th className='table-header-list font-geist'>Email</th>
            <th className='table-header-list'>Stage</th>
            <th className='table-header-list date-table'>Date Added</th>
          </tr>
        </thead>
        <tbody>
          {leads.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((lead, index) => (
            <tr className='table-body-list-container' key={index}>
              <td className='table-body-list'>{lead.company}</td>
              <td className='table-body-list font-geist'>{lead.bestEmail}</td>
              <td className='table-body-list lead-stage'>{lead.stage}</td>
              <td className='table-body-list'>{lead.importDate}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="leads-table-pagination-container">
        <ReactPaginate
          breakLabel="..."
          nextLabel=">"
          onPageChange={handlePageClick}
          pageRangeDisplayed={4}
          marginPagesDisplayed={1}
          pageCount={Math.ceil(leads.length / rowsPerPage)}
          previousLabel="<"
          containerClassName="leads-table-pagination"
          activeClassName="active"
        />
      </div>
    </div>
  );
}
