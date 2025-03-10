import { useState, useEffect } from "react";
import "./Communication.css";
import { LiaPaperPlaneSolid } from "react-icons/lia";
import { FaUserFriends, FaSearch, FaPaperclip, FaImage } from "react-icons/fa";

export default function CommunicationPage() {
  const [microsoftAccessToken, setMicrosoftAccessToken] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [formData, setFormData] = useState({ to: "", subject: "", text: "" });
  const [loading, setLoading] = useState(false);
  const [leads, setLeads] = useState([]);
  const [leadsLoading, setLeadsLoading] = useState(true);
  const [leadsError, setLeadsError] = useState(null);
  const [attachment, setAttachment] = useState(null); // Store selected file  
  const [emails, setEmails] = useState([]);
  const [receiveloading, receiveSetLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get("accessToken");
    const expiryTime = params.get("expiry");

    if (accessToken && expiryTime) {
      localStorage.setItem("microsoftAccessToken", accessToken);
      localStorage.setItem("tokenExpiry", expiryTime);
      setMicrosoftAccessToken(accessToken);
      window.history.replaceState({}, document.title, "/communications");
    } else {
      const storedToken = localStorage.getItem("microsoftAccessToken");
      const tokenExpiry = localStorage.getItem("tokenExpiry");

      if (!storedToken || !tokenExpiry || new Date().getTime() > tokenExpiry) {
        localStorage.removeItem("microsoftAccessToken");
        localStorage.removeItem("tokenExpiry");
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

  useEffect(() => {
    const fetchEmails = async () => {
        try {
            const token = localStorage.getItem("microsoftAccessToken");

            console.log("Fetched Email Token from localStorage:", token); // Debugging log

            if (!token) {
                throw new Error("Access token is missing from localStorage.");
            }

            const response = await fetch("http://localhost:4000/api/emails/received", {
              method: "GET",
              headers: {
                  "Authorization": `Bearer ${token}`,  // Ensure "Bearer " is added
                  "Content-Type": "application/json"
              }
          });

            console.log("Response Status:", response.status); // Debugging log

            const data = await response.json();
            console.log("Response Data:", data); // Debugging log

            if (response.ok) {
                setEmails(data.emails);
            } else {
                throw new Error(data.error || "Failed to fetch emails.");
            }
        } catch (err) {
            console.error("Fetch Emails Error:", err.message); // Debugging log
            setError(err.message);
        } finally {
            receiveSetLoading(false);
        }
    };

      fetchEmails();

      const interval = setInterval(fetchEmails, 10000);  // Set interval to fetch emails every 5 seconds (TO BE CHANGED INTO)

      return () => clearInterval(interval); // Cleanup when component unmounts
  }, []);

  const handleLeadSelection = (index) => {
    setSelectedIndex(index);
    setFormData((prev) => ({
      ...prev,
      to: leads[index]?.bestEmail || "",
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        setAttachment({
          fileName: file.name,
          mimeType: file.type,
          contentBytes: reader.result.split(",")[1], // Extract Base64 data
        });
      };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const microsoftAccessToken = localStorage.getItem("microsoftAccessToken");
    console.log("Send Email Token", microsoftAccessToken);

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
          token: microsoftAccessToken,
          attachments: attachment ? [attachment] : [], // Include attachment if available
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Email sent successfully!");
        setFormData({ to: "", subject: "", text: "" });
        setAttachment(null); // Clear attachment after sending
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

            {/* File Input for Attachments */}
            <input type="file" onChange={handleFileChange} className="w-full p-2 border rounded" />
            {attachment && <p>📎 {attachment.fileName}</p>}

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
