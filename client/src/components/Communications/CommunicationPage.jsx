import { useState, useEffect } from "react";
import "./Communication.css";
import { LiaPaperPlaneSolid } from "react-icons/lia";
import { FaUserFriends, FaSearch, FaPaperclip, FaImage } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function CommunicationPage() {
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [selectedTab, setSelectedTab] = useState("messages"); // Track active tab
  const [formData, setFormData] = useState({ to: "", subject: "", text: "" });
  const [sentEmails, setSentEmails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [microsoftAccessToken, setMicrosoftAccessToken] = useState("");
  const navigate = useNavigate();

  const leads = [
    { name: "Robert King", status: "Online", lastMessage: "Adwords Keyword Research For Beginners", time: "12:45" },
    { name: "Nhick Fabian", status: "Online", lastMessage: "Adwords Keyword Research For Beginners", time: "12:45" },
    { name: "Kurt Ouano", status: "Online", lastMessage: "Adwords Keyword Research For Beginners", time: "12:45" },
    { name: "Vincent Mendoza", status: "Online", lastMessage: "Adwords Keyword Research For Beginners", time: "12:45" },
  ];

  const handleMicrosoftLogin = () => {
    window.location.href = "http://localhost:4000/api/emails/microsoft-login"; // Backend API to initiate Microsoft OAuth login
  };

  useEffect(() => {
    fetchSentEmails();
    
    // Check if access token is available in localStorage (or wherever you are storing it)
    const storedToken = localStorage.getItem("microsoftAccessToken");
    if (storedToken) {
      setMicrosoftAccessToken(storedToken);
    }
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const microsoftAccessToken = localStorage.getItem("microsoftAccessToken");
    console.log(microsoftAccessToken);

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

  useEffect(() => {
    // Check the URL for the access token after redirect from Microsoft OAuth
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get("accessToken");
  
    if (accessToken) {
      setMicrosoftAccessToken(accessToken);
      localStorage.setItem("microsoftAccessToken", accessToken); // Store token in local storage
      navigate("/communications"); // Redirect to communications if needed
    }
  }, [navigate]);
  


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

        {/* Display Content Based on Selected Tab */}
        {selectedTab === "messages" && (
          <div className="panel-leads-list">
            {leads.map((lead, index) => (
              <div
                key={index}
                className={`panel-lead-item ${selectedIndex === index ? "active" : ""}`}
                onClick={() => setSelectedIndex(index)}
              >
                <FaUserFriends className="panel-lead-icon" />
                <div className="panel-lead-info">
                  <div className="panel-lead-status">
                    <span className="panel-status-dot"></span> {lead.status}
                  </div>
                  <h4>{lead.name}</h4>
                  <p>{lead.lastMessage}</p>
                </div>
                <span className="panel-message-time">{lead.time}</span>
              </div>
            ))}
          </div>
        )}

        {/* Placeholder for Other Tabs */}
        {selectedTab === "calls" && <div className="panel-tab-content">📞 Call Logs</div>}
        {selectedTab === "settings" && <div className="panel-tab-content">⚙️ Settings</div>}
      </div>

      {/* 📨 Message Box */}
      <div className="message-panel">
        {/* Header */}
        {selectedIndex !== null && (
          <div className="message-header-panel">
            <span className="panel-status-dot"></span> {leads[selectedIndex].name}
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
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
            <input
              type="text"
              name="subject"
              placeholder="Subject"
              value={formData.subject}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
            <textarea
              name="text"
              placeholder="Message"
              value={formData.text}
              onChange={handleChange}
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
        <button
          className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600"
          onClick={handleMicrosoftLogin}
        >
          Log in with Microsoft
        </button>
        <div className="message-input-box">
          <FaPaperclip className="message-input-icon" />
          <FaImage className="message-input-icon" />
          <input type="text" placeholder="Type Message" className="message-text-input" />
          <button onClick={handleSubmit} className="send-email-btn">
            <LiaPaperPlaneSolid className="send-email-btn-icon"/>
          </button>
        </div>
      </div>
    </div>
  );
}
