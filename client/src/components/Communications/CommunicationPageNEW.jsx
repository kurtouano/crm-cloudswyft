import { useEffect, useState } from "react";
import { FiSearch, FiEdit } from "react-icons/fi";
//import { FaFile } from "react-icons/fa6";
import { FaStar } from "react-icons/fa";
import { CgProfile } from "react-icons/cg";
import "./CommunicationNEW.css";

export default function CommunicationPageNEW() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeLead, setActiveLead] = useState(null); // Track active lead

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const response = await fetch("http://localhost:4000/api/leads");
        if (!response.ok) throw new Error("Failed to fetch leads");

        const data = await response.json();
        setLeads(data);
      } catch (error) {
        console.error("Error fetching leads:", error);
        setError("Failed to fetch leads.");
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, []);

  return (
    <div className="communications-container">
      <div className="inbox-container">
        {/* Search Box */}
        <div className="inbox-header-searchbox-container">
          <FiSearch className="inbox-header-searchbox-icon" />
          <input className="inbox-header-searchbox-input" type="text" placeholder="Search" />
          <button className="inbox-header-create-email-btn">
            <FiEdit className="inbox-header-create-email-icon" />
          </button>
        </div>

        {/* Leads List */}
        <div className="inbox-body-list-grid">
          {loading ? (
            <p>Loading leads...</p>
          ) : error ? (
            <p className="error-message">{error}</p>
          ) : leads.length === 0 ? (
            <p>No leads found.</p>
          ) : (
            leads.map((lead) => (
              <div
                key={lead._id}
                className={`inbox-body-list-container ${activeLead === lead._id ? "active" : ""}`} // Apply active class
                onClick={() => setActiveLead(lead._id)} // Set active lead on click
              >
                <div className="inbox-body-header">
                  <CgProfile className="inbox-body-header-icon" />
                  <p className="inbox-body-lead-type">Representative</p>
                  <p className="inbox-body-last-message-time">{lead.lastMessageTime || "N/A"}</p>
                </div>
                <p className="inbox-body-company-name">{lead.company}</p>
                <p className="inbox-body-reply-preview">{lead.lastMessage || "No recent message"}</p>
                <div className="inbox-body-reply-type">
                  <div className="inbox-body-reply-type-icons">
                    {/* <span><FaFile className="inbox-body-file-icon"/>Schedule</span> */}
                    {/* <span><FaFile className="inbox-body-file-icon"/>List</span> */}
                  </div>
                  <FaStar className="inbox-body-reply-type-star" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="replies-container"></div>
        {/* ADD CODE HERRE FOR REPLIESS*/}
    </div>
  );
}
