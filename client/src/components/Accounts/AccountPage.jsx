import { useState, useEffect, useMemo } from "react";
import ReactPaginate from "react-paginate";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // For API requests
import Fuse from "fuse.js";
import Papa from "papaparse";
import "./Accounts.css";

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
    return new Fuse(leads, { keys: ["name", "company"], threshold: 0.3 });
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
  
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const requiredHeaders = [
      "leadName", "bestEmail", "nameOfPresident", "nameOfHrHead", "company",
      "industry", "companyAddress", "phone", "website", "social"
    ];

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (result) => {
        const fileHeaders = Object.keys(result.data[0] || {}).map(h => h.trim());
        console.log("Extracted Headers:", fileHeaders);

        const isValid = requiredHeaders.every(header => fileHeaders.includes(header));

        if (!isValid) {
          document.querySelector(".import-error-display").textContent =
            `CSV file does not have the correct headers! Found: ${fileHeaders.join(", ")}`;
          return;
        }

        document.querySelector(".import-error-display").textContent = "";

        const formattedData = result.data
          .map(lead => ({
            ...lead,
            importDate: new Date().toISOString().split("T")[0], // Ensure correct date format
          }))
          .filter(lead => 
            Object.values(lead).some(value => value?.trim()) // Keep only non-empty rows
          );

        console.log("Filtered Data Before Upload:", formattedData);


        console.log("Formatted CSV Data:", formattedData);

        try {
          await axios.post("http://localhost:4000/api/leads/upload", { leads: formattedData });
          alert("Leads imported successfully!");

          const response = await axios.get("http://localhost:4000/api/leads");
          setLeads(response.data);
          setFilteredLeads(response.data);
        } catch (err) {
          console.error("Error uploading leads:", err);
          if (err.response && err.response.data) {
            document.querySelector(".import-error-display").textContent =
              err.response.data.error || "Unknown error occurred.";
          } else {
            document.querySelector(".import-error-display").textContent = "Failed to upload leads.";
          }
        }
      }
    });
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
          <input type="file" accept=".csv" onChange={handleFileUpload} style={{ display: "none" }} />
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
            <div className="options-icon">⋮</div>

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
                onClick={(e) => { e.stopPropagation(); console.log("Chat Clicked"); }}
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
