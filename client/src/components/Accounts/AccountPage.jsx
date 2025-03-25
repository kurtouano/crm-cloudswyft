import useMicrosoftAuthentication from "../../utils/AuthMicrosoft.js";
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
import arrowRightIcon from "../../assets/arrow-right.png";
import chatIcon from "../../assets/bubble-chat.png"; 
import userIcon from "../../assets/user-circle.png";
import { FiDownload } from "react-icons/fi";

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
  const [selectedFilter, setSelectedFilter] = useState(""); // State for selected filter
  const [userRole, setUserRole] = useState(localStorage.getItem("role"));

  const displayedLeads = filteredLeads.slice(page * rowsPerPage, (page + 1) * rowsPerPage);

  useMicrosoftAuthentication(); // Ensure user is authenticated in Microsoft

  // Fetch leads from the backend
  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const response = await axios.get("http://localhost:4000/api/leads"); 
        // Sort leads by createdAt in descending order (newest first)
        const sortedLeads = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setLeads(sortedLeads);
        setFilteredLeads(sortedLeads); // Set filteredLeads to the sorted leads
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

  // Filter leads based on selected filter
  useEffect(() => {
    let filtered = leads;
  
    // Apply status filter
    if (selectedFilter === "new") {
      const today = new Date();
      const sevenDaysAgo = new Date(today.setDate(today.getDate() - 7));
      filtered = leads.filter((lead) => {
        const leadDate = new Date(lead.createdAt);
        return leadDate >= sevenDaysAgo;
      });
    } else if (selectedFilter === "active") {
      filtered = leads.filter((lead) => lead.status === "active");
    } else if (selectedFilter === "successful") {
      filtered = leads.filter((lead) => lead.status === "successful");
    } else if (selectedFilter === "lost") {
      filtered = leads.filter((lead) => lead.status === "lost");
    }
  
    // Apply search query to the filtered leads
    if (searchQuery) {
      const fuse = new Fuse(filtered, { keys: ["leadName", "company"], threshold: 0.3 });
      const results = fuse.search(searchQuery).map(({ item }) => item);
      filtered = results;
    }
  
    // Sort the final filtered leads by createdAt in descending order (newest first)
    filtered = [...filtered].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
    setFilteredLeads(filtered);
    setPage(0); // Reset to the first page after filtering
  }, [selectedFilter, searchQuery, leads]);


  useEffect(() => {
    const handleStorageChange = () => {
      setUserRole(localStorage.getItem("role"));
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);


  const cardData = useMemo(() => {
    const totalLeads = leads.length;
    const highPriorityLeads = leads.filter((lead) => lead.priority === "High").length;
    const conversionRate = totalLeads > 0 ? ((leads.filter((lead) => lead.status === "successful").length / totalLeads) * 100).toFixed(2) + "%" : "0%";
    const recentActivity = `${leads.filter((lead) => lead.lastInteraction).length} Interactions`;
  
    return [
      { title: "Total Number of Leads", value: totalLeads, bgColor: "#2196F3", icon: usersIcon },
      { title: "Conversion Rate", value: conversionRate, bgColor: "#1BB9F4", icon: clockIcon },
      { title: "Recent Activity", value: recentActivity, bgColor: "#2196F3", icon: hourglassIcon },
      { title: "High Priority Leads", value: `${highPriorityLeads} Urgent`, bgColor: "#307ADB", icon: highPriorityIcon },
    ];
  }, [leads]);

  // Handle search input change
  const handleSearch = (event) => {
    const query = event.target.value;
    setSearchQuery(query);
  
    // Apply the search query to the already filtered leads
    let filtered = leads;
  
    // Apply status filter first
    if (selectedFilter === "new") {
      const today = new Date();
      const sevenDaysAgo = new Date(today.setDate(today.getDate() - 7));
      filtered = leads.filter((lead) => {
        const leadDate = new Date(lead.createdAt);
        return leadDate >= sevenDaysAgo;
      });
    } else if (selectedFilter === "active") {
      filtered = leads.filter((lead) => lead.status === "active");
    } else if (selectedFilter === "successful") {
      filtered = leads.filter((lead) => lead.status === "successful");
    } else if (selectedFilter === "lost") {
      filtered = leads.filter((lead) => lead.status === "lost");
    }
  
    // Apply search query to the filtered leads
    if (query) {
      const fuse = new Fuse(filtered, { keys: ["leadName", "company"], threshold: 0.3 });
      const results = fuse.search(query).map(({ item }) => item);
      filtered = results;
    }
  
    // Sort the final filtered leads by createdAt in descending order (newest first)
    filtered = [...filtered].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
    setFilteredLeads(filtered);
    setPage(0); // Reset to the first page after filtering
  };

  // Handle filter dropdown change
  const handleFilterChange = (event) => {
    setSelectedFilter(event.target.value);
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
            <select 
              className="search-dropdown"
              value={selectedFilter}
              onChange={handleFilterChange}
            >
              <option value="">Select Status</option>
              <option value="new">New (Last 7 Days)</option> {/* Newest for the last 7 Days*/}
              <option value="active">Active</option>
              <option value="successful">Closed - Successful</option>
              <option value="lost">Closed - Lost</option>
            </select>
            <img src={arrowRightIcon} alt="Dropdown Icon" className="dropdown-icon" />
          </div>
        </div>
        
        <p className="import-error-display"></p>

         {userRole === "admin" && (
            <label className="accounts-import-btn">
              <p>Import Leads</p>
              <FiDownload className="accounts-import-btn-icon"/>
              <input type="file" accept=".csv, .xlsx" onChange={handleFileUpload} style={{ display: "none" }} />
            </label>
          )}
      </div>

      {/* Loading & Error Handling */}
      {loading && <p>Loading leads...</p>}
      {error && <p className="error">{error}</p>}

      {/* Lead Cards Section */}
      {!loading && !error && (
        <>
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
                  <h3 className="lead-name">{lead.company}</h3>
                  <span className="company-badge">{lead.leadName}</span>
                  
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
            <div className="modal-overlay-accounts">
              <div className="modal-content-accounts">
                <h3>Confirm Deletion</h3>
                <p>Are you sure you want to delete <strong><br></br>{deleteModal.leadName}</strong>?</p>
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