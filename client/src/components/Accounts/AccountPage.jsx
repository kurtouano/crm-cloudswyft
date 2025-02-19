import React from "react";
import "./Accounts.css";

// Import icons
import usersIcon from "../../assets/users.png";
import clockIcon from "../../assets/clock.png";
import hourglassIcon from "../../assets/hourglass.png";
import highPriorityIcon from "../../assets/highpriority.png";
import searchIcon from "../../assets/search.png"; // Search button icon
import arrowRightIcon from "../../assets/arrow-right.png"; // Arrow right icon for dropdown

const cardData = [
  { 
    title: "Total Number of Leads", value: "50", bgColor: "#2196F3", icon: usersIcon 
  },
  { 
    title: "Conversion Rate", value: "12.5%", bgColor: "#1BB9F4", icon: clockIcon 
  },
  { 
    title: "Recent Activity", value: "23 Interactions", bgColor: "#2196F3", icon: hourglassIcon 
  },
  { 
    title: "High Priority Leads", value: "8 Urgent", bgColor: "#307ADB", icon: highPriorityIcon 
  },
];

export default function AccountPage() {
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
      <div className="search-container">
        <input type="text" placeholder="Lead Name" className="search-input" />
        
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
    </div>
  );
}
