import { useState, useEffect, useMemo } from "react";
import ReactPaginate from "react-paginate";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // For API requests
import Fuse from "fuse.js";
import Papa from "papaparse";
import "./Accounts.css";
import * as XLSX from "xlsx";

// Import icons
import usersIcon from "../../assets/users.png";
import clockIcon from "../../assets/clock.png";
import hourglassIcon from "../../assets/hourglass.png";
import highPriorityIcon from "../../assets/highpriority.png";
import searchIcon from "../../assets/search.png";
import arrowRightIcon from "../../assets/arrow-right.png";
import chatIcon from "../../assets/bubble-chat.png"; 
import userIcon from "../../assets/user-circle.png";
import { FiDownload } from "react-icons/fi";

const cardData = [
  { title: "Total Number of Leads", value: "50", bgColor: "#2196F3", icon: usersIcon },
  { title: "Conversion Rate", value: "12.5%", bgColor: "#1BB9F4", icon: clockIcon },
  { title: "Recent Activity", value: "23 Interactions", bgColor: "#2196F3", icon: hourglassIcon },
  { title: "High Priority Leads", value: "8 Urgent", bgColor: "#307ADB", icon: highPriorityIcon },
];

const rowsPerPage = 10;

export default function AccountPage() {
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [selectedLead, setSelectedLead] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const displayedLeads = filteredLeads.slice(page * rowsPerPage, (page + 1) * rowsPerPage);

  // Fetch leads from the backend
  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const response = await axios.get("http://localhost:4000/api/leads"); 
        setLeads(response.data);
        setFilteredLeads(response.data);
        setError(null); // Clear any previous errors
      } catch (err) {
        console.error("Error fetching leads:", err); // Log for debugging
        setError(`Failed to fetch leads: ${err.message}`); // Set a more useful error message
      } finally {
        setLoading(false);
      }
    };
  
    fetchLeads();
  }, []);

  // Memoize Fuse.js instance
  const fuse = useMemo(() => {
    return new Fuse(leads, { keys: ["leadName", "company"], threshold: 0.3 });
  }, [leads]);

  // Handle search input change
  const handleSearch = (event) => {
    const query = event.target.value;
    setSearchQuery(query);

    if (!query) {
      setFilteredLeads(leads);
    } else {
      const results = fuse.search(query).map(({ item }) => item);
      setFilteredLeads(results);
    }
    setPage(0);
  };

  const handlePageClick = (event) => {
    setPage(event.selected);
  };
  
  const openDeleteModal = (lead) => {
    setDeleteModal(lead);
  };

  const handleDeleteLead = async () => {
    if (!deleteModal) return;

    try {
      const leadIdNumber = parseInt(deleteModal.leadID.replace("LID-", ""), 10);
      await axios.delete(`http://localhost:4000/api/leads/leadID/${leadIdNumber}`);

      // ✅ Remove lead from UI instantly
      setLeads((prevLeads) => prevLeads.filter((lead) => lead.leadID !== deleteModal.leadID));
      setFilteredLeads((prevLeads) => prevLeads.filter((lead) => lead.leadID !== deleteModal.leadID));

      // ✅ Close Modal
      setDeleteModal(null);
    } catch (error) {
      console.error("Error deleting lead:", error);
    }
  };
  

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
  
    const fileExtension = file.name.split(".").pop().toLowerCase();
    const requiredHeaders = [
      "leadName", "bestEmail", "nameOfPresident", "nameOfHrHead", "company",
      "industry", "companyAddress", "phone", "website", "social"
    ];
  
    if (fileExtension === "csv") {
      // Handle CSV File
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (result) => processFileData(result.data, requiredHeaders, event),
      });
    } else if (fileExtension === "xlsx") {
      // Handle Excel (.xlsx) File
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0]; // Assuming first sheet
        const sheet = workbook.Sheets[sheetName];
        const parsedData = XLSX.utils.sheet_to_json(sheet, { defval: "" }); // Ensure empty values are handled
  
        processFileData(parsedData, requiredHeaders, event);
      };
      reader.readAsArrayBuffer(file);
    } else {
      document.querySelector(".import-error-display").textContent =
        "Unsupported file format. Please upload a CSV or XLSX file.";
    }
  };
  
  // Helper function to process file data
  const processFileData = async (data, requiredHeaders, event) => {
    const fileHeaders = Object.keys(data[0] || {}).map((h) => h.trim());
    console.log("Extracted Headers:", fileHeaders);
  
    const isValid = requiredHeaders.every((header) => fileHeaders.includes(header));
  
    if (!isValid) {
      document.querySelector(".import-error-display").textContent =
        `File does not have the correct headers! Found: ${fileHeaders.join(", ")}`;
      return;
    }
  
    document.querySelector(".import-error-display").textContent = "";
  
    const formattedData = data
      .map((lead) => ({
        ...lead,
        importDate: new Date().toISOString().split("T")[0],
      }))
      .filter((lead) =>
        Object.values(lead).some((value) => value?.toString().trim()) 
      );
  
    console.log("Filtered Data Before Upload:", formattedData);
  
    try {
      const microsoftAccessToken = localStorage.getItem("microsoftAccessToken");
      if (!microsoftAccessToken) {
        alert("Please log in with Microsoft first to send automated emails.");
        return;
      }
  
      const response = await axios.post(
        "http://localhost:4000/api/leads/upload",
        { leads: formattedData },
        { headers: { Authorization: `Bearer ${microsoftAccessToken}` } }  // ✅ Include token here
      );
  
      const insertedCount = response.data.insertedCount || 0;
      const skippedCount = response.data.skippedCount || 0;
  
      alert(`${insertedCount} new leads added! ${skippedCount} duplicates skipped.`);
  
      const updatedLeads = await axios.get("http://localhost:4000/api/leads");
      setLeads(updatedLeads.data);
      setFilteredLeads(updatedLeads.data);
  
      event.target.value = "";
    } catch (err) {
      console.error("Error uploading leads:", err);
      document.querySelector(".import-error-display").textContent =
        err.response?.data?.error || "Failed to upload leads.";
    }
  };
  
  
  const handleChatClick = (lead) => {
    navigate(`/communications?leadEmail=${encodeURIComponent(lead.bestEmail)}`);
  };
  return (
    <div className="accounts-container">
      {/* Cards Section */}
      <div className="cards-wrapper">
        {cardData.map((card, index) => (
          <div key={index} className="account-card" style={{ backgroundColor: card.bgColor }}>
            <div className="icon-container">
              <img src={card.icon} alt={card.title} className="account-icon" />
            </div>
            <div className="account-text">
              <p className="account-title">{card.title}</p>
              <p className="account-value">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

            {/* Search Filter Section */}
      <div className="search-container-row">

        <div className="search-container">
          <input 
            type="text" 
            placeholder="Search leads..." 
            className="search-input"
            value={searchQuery}
            onChange={handleSearch} 
          />

          <div className="dropdown-container">
            <select className="search-dropdown">
              <option value="">Select Status</option>
              <option value="new">New</option>
              <option value="in-progress">In Progress</option>
              <option value="closed">Closed</option>
            </select>
            <img src={arrowRightIcon} alt="Dropdown Icon" className="dropdown-icon" />
          </div>

          <button className="search-button">
            <img src={searchIcon} alt="Search" className="search-icon" />
          </button>
        </div>
        
        <p className="import-error-display"></p>

        <label className="accounts-import-btn">
          <FiDownload />
          <input type="file" accept=".csv, .xlsx" onChange={handleFileUpload} style={{ display: "none" }} />
        </label>

      </div>

      {/* Loading & Error Handling */}
      {loading && <p>Loading leads...</p>}
      {error && <p className="error">{error}</p>}

      {/* Lead Cards Section */}
      {!loading && !error && (
        <>
      {/* Lead Cards Section */}
      <div className="lead-cards-container">
        {displayedLeads.map((lead, index) => (
          <div key={index} className="lead-card">
          {/* Three-dot menu */}
          <div 
            className="options-icon clickable"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedLead(selectedLead === lead.leadID ? null : lead.leadID);
            }}
          >
            ⋮
          </div>
        
            {selectedLead === lead.leadID && (
              <div className="lead-dropdown-menu">
                <button 
                  className="delete-lead-btn" 
                  onClick={() => openDeleteModal(lead)} // ✅ Open delete modal
                >
                  Delete Lead
                </button>
              </div>
            )}

        
          {/* Lead Details */}
          <div className="lead-info">
            <h3 className="lead-name">{lead.leadName}</h3>
            <span className="company-badge">{lead.company}</span>
            
            <div className="lead-details">
              <p>Lead ID</p>
              <p className="lead-value">{lead.leadID}</p>
            </div>
            <div className="lead-details">
              <p>Join Date</p>
              <p className="lead-value">
                {lead.importDate ? lead.importDate.split("T")[0] : "N/A"}
              </p>
            </div>
          </div>
        
          {/* Action Icons */}
          <div className="lead-actions">
            <div 
              className="chat-icon clickable"
              onClick={(e) => {
                e.stopPropagation();
                handleChatClick(lead);
              }}
            >
              <img src={chatIcon} alt="Chat" />
            </div>

            <div 
              className="user-icon clickable"
              onClick={(e) => { 
                e.stopPropagation(); 
                navigate("/lead-profile", { state: { lead } });
              }} 
            >
              <img src={userIcon} alt="Profile" />
            </div>
          </div>
        </div>
        
        ))}
      </div>

      {/* Floating Delete Confirmation Modal */}
      {deleteModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Delete Lead</h3>
            <p>Are you sure you want to delete <strong>{deleteModal.leadName}</strong>?</p>
            <div className="modal-buttons">
              <button className="cancel-btn" onClick={() => setDeleteModal(null)}>Cancel</button>
              <button className="delete-btn" onClick={handleDeleteLead}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Pagination */}
      <div className="pagination-container">
        <ReactPaginate
          breakLabel="..."
          nextLabel=">"
          onPageChange={handlePageClick}
          pageRangeDisplayed={4}
          marginPagesDisplayed={1}
          pageCount={Math.ceil(filteredLeads.length / rowsPerPage)}
          previousLabel="<"
          containerClassName="pagination"
          activeClassName="active"
        />
      </div>
      </>
    )}
    </div>
  );
}
