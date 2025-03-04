import { useState } from "react";
import "./Communication.css";
import { FaUserFriends, FaSearch, FaCommentDots, FaPhone, FaCog, FaPaperclip, FaImage } from "react-icons/fa";

export default function CommunicationPage() {
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [selectedTab, setSelectedTab] = useState("messages"); // Track active tab

  const leads = [
    { name: "Robert King", status: "Online", lastMessage: "Adwords Keyword Research For Beginners", time: "12:45" },
    { name: "Nhick Fabian", status: "Online", lastMessage: "Adwords Keyword Research For Beginners", time: "12:45" },
    { name: "Kurt Ouano", status: "Online", lastMessage: "Adwords Keyword Research For Beginners", time: "12:45" },
    { name: "Vincent Mendoza", status: "Online", lastMessage: "Adwords Keyword Research For Beginners", time: "12:45" },
  ];

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
          {/* Messages will be dynamically displayed here */}
        </div>

        {/* Message Input */}
        <div className="message-input-box">
          <FaPaperclip className="message-input-icon" />
          <FaImage className="message-input-icon" />
          <input type="text" placeholder="Type Message" className="message-text-input" />
        </div>
      </div>
    </div>
  );
}
