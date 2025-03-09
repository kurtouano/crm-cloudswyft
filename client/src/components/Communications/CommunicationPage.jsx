import { useState, useEffect } from "react";
import "./Communication.css";
import { LiaPaperPlaneSolid } from "react-icons/lia";
import { FaUserFriends, FaSearch, FaPaperclip, FaImage } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function CommunicationPage() {
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [formData, setFormData] = useState({ to: "", subject: "", text: "" });
  const [sentEmails, setSentEmails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [microsoftAccessToken, setMicrosoftAccessToken] = useState("");
  const [leads, setLeads] = useState([]);
  const [leadsLoading, setLeadsLoading] = useState(true);
  const [leadsError, setLeadsError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get("accessToken");
    const expiryTime = params.get("expiry"); // Capture expiry from URL

    if (accessToken && expiryTime) {
      // Store token and expiry time in localStorage
      localStorage.setItem("microsoftAccessToken", accessToken);
      localStorage.setItem("tokenExpiry", expiryTime);
      setMicrosoftAccessToken(accessToken);

      // Remove token from URL after storing it
      window.history.replaceState({}, document.title, "/communications");
    } else {
      // If no new token in URL, check existing stored token
      const storedToken = localStorage.getItem("microsoftAccessToken");
      const tokenExpiry = localStorage.getItem("tokenExpiry");

      if (!storedToken || !tokenExpiry || new Date().getTime() > tokenExpiry) {
        // Remove old token if expired
        localStorage.removeItem("microsoftAccessToken");
        localStorage.removeItem("tokenExpiry");

        // Redirect only if there's no valid token
        window.location.href = "http://localhost:4000/api/emails/microsoft-login";
      } else {
        setMicrosoftAccessToken(storedToken);
      }
    }
  }, []);

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const response = await fetch("http://localhost:4000/api/leads");
        const data = await response.json();
        setLeads(data);
      } catch (error) {
        console.error("Error fetching leads:", error);
        setLeadsError("Failed to fetch leads.");
      } finally {
        setLeadsLoading(false);
      }
    };

    fetchLeads();
  }, []);

  const fetchSentEmails = async () => {
    try {
      const res = await fetch("http://localhost:4000/api/emails/sent");
      const data = await res.json();
      setSentEmails(data);
    } catch (error) {
      console.error("Failed to fetch sent emails", error);
    }
  };

  const handleLeadSelection = (index) => {
    setSelectedIndex(index);
    setFormData((prev) => ({
      ...prev,
      to: leads[index]?.bestEmail || "", // Auto-fill recipient email
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const microsoftAccessToken = localStorage.getItem("microsoftAccessToken");

    if (!microsoftAccessToken) {
      alert("Please log in via Microsoft first.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://localhost:4000/api/emails/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: formData.to,
          subject: formData.subject,
          content: formData.text,
          token: microsoftAccessToken, // Add token here
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Email sent successfully!");
        setFormData({ to: "", subject: "", text: "" });
        fetchSentEmails();
      } else {
        alert(data.error || "Failed to send email");
      }
    } catch (error) {
      console.error("Error sending email:", error);
    }

    setLoading(false);
  };

  return (
    <div className="messaging-panel">
      {/* Sidebar */}
      <div className="sidebar-panel">
        {/* Search Bar */}
        <div className="panel-search-container">
          <FaSearch className="panel-search-icon" />
          <input type="text" placeholder="Search in Leads" />
        </div>
        <div className="panel-search-underline"></div>

        {/* Display Leads */}
        <div className="panel-leads-list">
          {leadsLoading && <p>Loading leads...</p>}
          {leadsError && <p className="error">{leadsError}</p>}
          {!leadsLoading && !leadsError && leads.length === 0 && <p>No leads available.</p>}
          {!leadsLoading &&
            !leadsError &&
            leads.map((lead, index) => (
              <div
                key={index}
                className={`panel-lead-item ${selectedIndex === index ? "active" : ""}`}
                onClick={() => handleLeadSelection(index)}
              >
                <FaUserFriends className="panel-lead-icon" />
                <div className="panel-lead-info">
                  <div className="panel-lead-status">
                    <span className="panel-status-dot"></span> Online
                  </div>
                  <h4>{lead.leadName}</h4>
                  <p>{lead.company}</p>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* 📨 Message Box */}
      <div className="message-panel">
        {/* Header */}
        {selectedIndex !== null && (
          <div className="message-header-panel">
            <span className="panel-status-dot"></span> {leads[selectedIndex]?.leadName}
          </div>
        )}

        {/* Chat Area */}
        <div className="message-chat-area">
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              name="to"
              placeholder="Recipient Email"
              value={formData.to}
              className="w-full p-2 border rounded bg-gray-100 cursor-not-allowed"
              readOnly
            />
            <input
              type="text"
              name="subject"
              placeholder="Subject"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="w-full p-2 border rounded"
              required
            />
            <textarea
              name="text"
              placeholder="Message"
              value={formData.text}
              onChange={(e) => setFormData({ ...formData, text: e.target.value })}
              className="w-full p-2 border rounded"
              required
            ></textarea>
            <button
              type="submit"
              className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
              disabled={loading}
            >
              {loading ? "Sending..." : "Send Email"}
            </button>
          </form>
        </div>

        {/* Message Input */}
        <div className="message-input-box">
          <FaPaperclip className="message-input-icon" />
          <FaImage className="message-input-icon" />
          <input type="text" placeholder="Type Message" className="message-text-input" />
          <button onClick={handleSubmit} className="send-email-btn">
            <LiaPaperPlaneSolid className="send-email-btn-icon" />
          </button>
        </div>
      </div>
    </div>
  );
}
