import { useEffect, useState, useMemo } from "react";
import Fuse from "fuse.js"; // 🔍 Import Fuse.js
import { FiSearch, FiEdit } from "react-icons/fi";
import { FaStar } from "react-icons/fa";
import { CgProfile } from "react-icons/cg";
import { IoArrowBack, IoArrowForward, IoReturnUpBackOutline, IoChevronDownOutline, IoTrashOutline, IoExpandOutline, IoEllipsisVerticalOutline } from "react-icons/io5";
import { MdAttachFile } from "react-icons/md";
import "./CommunicationNEW.css";

export default function CommunicationPageNEW() {
  const [leads, setLeads] = useState([]);
  const [filteredLeads, setFilteredLeads] = useState([]); // ✅ For filtered results
  const [activeLead, setActiveLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState(""); // ✅ Search input state

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const response = await fetch("http://localhost:4000/api/leads");
        if (!response.ok) throw new Error("Failed to fetch leads");

        const data = await response.json();
        setLeads(data);
        setFilteredLeads(data); // ✅ Initialize filtered leads
      } catch (error) {
        console.error("Error fetching leads:", error);
        setError("Failed to fetch leads.");
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, []);

  // ✅ Memoized Fuse.js instance
  const fuse = useMemo(() => {
    return new Fuse(leads, { keys: ["leadName", "company"], threshold: 0.3 });
  }, [leads]);

  // ✅ Handle search input change
  const handleSearch = (event) => {
    const query = event.target.value;
    setSearchQuery(query);

    if (!query) {
      setFilteredLeads(leads); // Reset to original leads when search is cleared
    } else {
      const results = fuse.search(query).map(({ item }) => item);
      setFilteredLeads(results);
    }
  };

  // Handle lead selection
  const handleLeadClick = (lead) => {
    setActiveLead(lead);
    setEmail(lead.bestEmail || ""); // Auto-fill recipient email
    setSubject("");
    setMessage("");
  };

  return (
    <div className="communications-container">
      {/* Left Panel (Inbox) */}
      <div className="inbox-container">
        {/* Search Box */}
        <div className="inbox-header-searchbox-container">
          <FiSearch className="inbox-header-searchbox-icon" />
          <input
            className="inbox-header-searchbox-input"
            type="text"
            placeholder="Search leads..."
            value={searchQuery}
            onChange={handleSearch} // ✅ Attach search handler
          />
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
          ) : filteredLeads.length === 0 ? (
            <p>No leads found.</p>
          ) : (
            filteredLeads.map((lead) => (
              <div
                key={lead._id}
                className={`inbox-body-list-container ${activeLead?._id === lead._id ? "active" : ""}`}
                onClick={() => handleLeadClick(lead)}
              >
                <div className="inbox-body-header">
                  <CgProfile className="inbox-body-header-icon" />
                  <p className="inbox-body-lead-type">{lead.leadName || "Unknown Lead"}</p>
                  <p className="inbox-body-last-message-time">{lead.lastMessageTime || "N/A"}</p>
                </div>
                <p className="inbox-body-company-name">{lead.company}</p>

                {/* Last message preview & star aligned properly */}
                <div className="inbox-body-reply-preview-container">
                  <p className="inbox-body-reply-preview">{lead.lastMessage || "No recent message"}</p>
                  <FaStar className="inbox-body-reply-type-star" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Panel (Email Composition) */}
      <div className="email-compose-container">
        {/* Email Header */}
        <div className="email-header">
          {/* Left Side Icons */}
          <div className="email-header-left">
            <IoArrowBack className="email-nav-icon circle-icon" />
            <IoTrashOutline className="email-nav-icon" />
          </div>

          {/* Pagination */}
          <span className="email-pagination">1 of 200</span>

          {/* Right Side Icons */}
          <div className="email-header-right">
            <IoArrowForward className="email-nav-icon circle-icon" />
            <IoExpandOutline className="email-nav-icon" />
            <IoEllipsisVerticalOutline className="email-nav-icon" />
          </div>
        </div>

        {/* NEW: Whitespace for displaying received emails */}
        <div className="email-received-space"></div>

        <div className="email-compose-box">
          <div className="email-header">
            <div className="email-left-icons">
              <IoReturnUpBackOutline className="email-icon" />
              <IoChevronDownOutline className="email-icon" />
              <div className="email-recipient-box">
                <span className="email-recipient">{email}</span>
              </div>
            </div>
            <div className="email-actions-icons">
              <IoTrashOutline className="email-icon" />
              <IoExpandOutline className="email-icon" />
            </div>
          </div>

          {/* Subject Input */}
          <input
            type="text"
            className="email-subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Subject"
          />

          {/* Message Body */}
          <textarea
            className="email-body"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write your message..."
          />

          {/* Send Button & Attachments */}
          <div className="email-actions">
            <button className="send-button">Send</button>
            <MdAttachFile className="email-attach-icon" />
          </div>
        </div>
      </div>
    </div>
  );
}
