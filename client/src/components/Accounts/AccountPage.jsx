import React, { useState } from "react";
import ReactPaginate from "react-paginate";
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

const cardData = [
  { title: "Total Number of Leads", value: "50", bgColor: "#2196F3", icon: usersIcon },
  { title: "Conversion Rate", value: "12.5%", bgColor: "#1BB9F4", icon: clockIcon },
  { title: "Recent Activity", value: "23 Interactions", bgColor: "#2196F3", icon: hourglassIcon },
  { title: "High Priority Leads", value: "8 Urgent", bgColor: "#307ADB", icon: highPriorityIcon },
];

const leads = new Array(100).fill({
  name: "Ruben Korsgaard",
  company: "Cloudswyft",
  leadID: "FD-1467",
  joinDate: "2/4/2023",
});

const rowsPerPage = 10;

export default function AccountPage() {
  const [page, setPage] = useState(0);

  const handlePageClick = (event) => {
    setPage(event.selected);
  };

  const displayedLeads = leads.slice(page * rowsPerPage, (page + 1) * rowsPerPage);

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

      {/* Lead Cards Section */}
      <div className="lead-cards-container">
        {displayedLeads.map((lead, index) => (
          <div 
            key={index} 
            className="lead-card" 
            onClick={() => console.log("Card Clicked")} // Placeholder for routing
          >
            <div className="options-icon">⋮</div>

            <div className="lead-info">
              <h3 className="lead-name">{lead.name}</h3>
              <span className="company-badge">{lead.company}</span>

              <div className="lead-details">
                <p>Lead ID</p>
                <p className="lead-value">{lead.leadID}</p>
              </div>
              <div className="lead-details">
                <p>Join Date</p>
                <p className="lead-value">{lead.joinDate}</p>
              </div>
            </div>

            {/* Action Icons */}
            <div className="lead-actions">
              <div 
                className="chat-icon clickable"
                onClick={(e) => { e.stopPropagation(); console.log("Chat Clicked"); }} // Prevents card click
              >
                <img src={chatIcon} alt="Chat" />
              </div>
              <div 
                className="user-icon clickable"
                onClick={(e) => { e.stopPropagation(); console.log("User Profile Clicked"); }} 
              >
                <img src={userIcon} alt="Profile" />
              </div>
            </div>
          </div>
        ))}
      </div>


        <div className="pagination-container">
          <ReactPaginate
            breakLabel="..."
            nextLabel=">"
            onPageChange={handlePageClick}
            pageRangeDisplayed={4}
            marginPagesDisplayed={1}
            pageCount={Math.ceil(leads.length / rowsPerPage)}
            previousLabel="<"
            containerClassName="pagination"
            activeClassName="active"
          />
        </div>

    </div>
  );
}
