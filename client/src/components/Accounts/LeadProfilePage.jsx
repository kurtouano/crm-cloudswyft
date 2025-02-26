import { useState } from "react";
import { useLocation } from "react-router-dom";
import ReactPaginate from "react-paginate";
import usersIcon from "../../assets/users.png";
import clockIcon from "../../assets/clock.png";
import hourglassIcon from "../../assets/hourglass.png";
import highPriorityIcon from "../../assets/highpriority.png";
import leadIcon from "../../assets/lead-profile-icon.svg";
import InteractionArrowIcon from "../../assets/interaction-history-arrow.svg";

export default function LeadProfilePage() {
  const location = useLocation();
  const lead = location.state?.lead || {};

  const [activeTab, setActiveTab] = useState("sent");
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 5;

const cardData = [
  { title: "Lead Status", value: "Email Sent", bgColor: "#2196F3", icon: usersIcon },
  { title: "Last Contact Date", value: "02/07/25", bgColor: "#1BB9F4", icon: clockIcon },
  { title: "Next Action Needed", value: "Follow Up", bgColor: "#2196F3", icon: hourglassIcon },
  { title: "Lead Score", value: "Priority", bgColor: "#307ADB", icon: highPriorityIcon },
];

// JSON data for interactions
const interactionData = {
  sent: [
    { title: "Base", type: "Promotion", subject: "Subject base", description: "Base, this is a preview of your email, enjoy! Your subscription has resumed.", date: "6:19 PM" },
    { title: "Base", type: "Promotion", subject: "Subject base", description: "Base, this is a preview of your email, enjoy! Your subscription has resumed.", date: "7:00 PM" },
    { title: "Base", type: "Promotion", subject: "Subject base", description: "Base, this is a preview of your email, enjoy! Your subscription has resumed.", date: "8:45 AM" },
    { title: "Base", type: "Promotion", subject: "Subject base", description: "Base, this is a preview of your email, enjoy! Your subscription has resumed.", date: "9:30 AM" },
    { title: "Base", type: "Promotion", subject: "Subject base", description: "Base, this is a preview of your email, enjoy! Your subscription has resumed.", date: "10:15 AM" },
    { title: "Base", type: "Promotion", subject: "Subject base", description: "Base, this is a preview of your email, enjoy! Your subscription has resumed.", date: "11:00 AM" },
    { title: "Base", type: "Promotion", subject: "Subject base", description: "Base, this is a preview of your email, enjoy! Your subscription has resumed.", date: "6:19 PM" },
    { title: "Base", type: "Promotion", subject: "Subject base", description: "Base, this is a preview of your email, enjoy! Your subscription has resumed.", date: "7:00 PM" },
    { title: "Base", type: "Promotion", subject: "Subject base", description: "Base, this is a preview of your email, enjoy! Your subscription has resumed.", date: "8:45 AM" },
    { title: "Base", type: "Promotion", subject: "Subject base", description: "Base, this is a preview of your email, enjoy! Your subscription has resumed.", date: "9:30 AM" },
    { title: "Base", type: "Promotion", subject: "Subject base", description: "Base, this is a preview of your email, enjoy! Your subscription has resumed.", date: "10:15 AM" },
    { title: "Base", type: "Promotion", subject: "Subject base", description: "Base, this is a preview of your email, enjoy! Your subscription has resumed.", date: "11:00 AM" },
  ],
  received: [
    { title: "Base", type: "Inquiry", subject: "Received Subject 1", description: "Received email 1", date: "5:19 PM" },
    { title: "Base", type: "Inquiry", subject: "Received Subject 2", description: "Received email 2", date: "4:30 PM" },
    { title: "Base", type: "Inquiry", subject: "Received Subject 3", description: "Received email 3", date: "3:45 PM" },
    { title: "Base", type: "Inquiry", subject: "Received Subject 4", description: "Received email 4", date: "2:15 PM" },
    { title: "Base", type: "Inquiry", subject: "Received Subject 5", description: "Received email 5", date: "1:30 PM" },
    { title: "Base", type: "Inquiry", subject: "Received Subject 6", description: "Received email 6", date: "12:10 PM" },
  ],
};

  const handleToggle = (tab) => {
    setActiveTab(tab);
    setCurrentPage(0); // Reset to first page when switching tabs
  };

  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
  };

  // Get paginated emails
  const dataToShow = interactionData[activeTab].slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  return (
    <div className="lead-profile-container">
      {/* Cards Section */}
      <div className="lead-profile-container-row">
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

        <div className="lead-profile-details-container">
          <div className="lead-profile-name-container">
            <img src={leadIcon} className="lead-profile-icon" alt="Lead Icon" />
            <p className="lead-profile-name">{lead.name}</p>
          </div>

          <div className="lead-profile-basic-information">
            <div className="profile-basic-title-container">
              <p className="profile-basic-title">Basic Information</p>
            </div>
            <div className="profile-body-list">
              <p className="profile-body"><span>Full Name: </span> {lead.leadName}</p>
              <p className="profile-body"><span>Company Name: </span> {lead.company}</p>
              <p className="profile-body"><span>Industry: </span> {lead.industry}</p>
              <p className="profile-body"><span>Name of President: </span> {lead.nameOfPresident}</p>
              <p className="profile-body"><span>Name of HR Head: </span> {lead.nameOfHrHead}</p>
              <p className="profile-body"><span>Company Address: </span> {lead.companyAddress}</p>
            </div>
          </div>

          <div className="lead-profile-basic-information">
            <div className="profile-basic-title-container">
              <p className="profile-basic-title">Contact Information</p>
            </div>
            <div className="profile-body-list">
              <p className="profile-body"><span>Email: </span>{lead.bestEmail}</p>
              <p className="profile-body"><span>Phone: </span>{lead.phone}</p>
              <p className="profile-body"><span>Social Media: </span>{lead.social}</p>
            </div>
          </div>
          
        </div>
      </div>

      {/* Interaction History Section */}
      <p className="interaction-header-title">Interaction History</p>

      <div className="interaction-history-buttons">
        <button onClick={() => handleToggle("sent")} className={activeTab === "sent" ? "active" : ""}>Sent</button>
        <button onClick={() => handleToggle("received")} className={activeTab === "received" ? "active" : ""}>Received</button>
      </div>

      {/* Interaction List with Pagination */}
      <div className="interaction-history-container">
        {dataToShow.map((interaction, index) => (
          <div key={index} className="interaction-history-item">
            <img src={InteractionArrowIcon} className="interaction-history-icon" alt="Arrow Icon" />
            <p className="interaction-history-title">{interaction.title}</p>
            <p className="interaction-history-type">{interaction.type}</p>
            <p className="interaction-history-subject">{interaction.subject}</p>
            <p className="interaction-history-description">- {interaction.description}</p>
            <p className="interaction-history-date">{interaction.date}</p>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="pagination-container">
        <ReactPaginate
          breakLabel="..."
          nextLabel=">"
          onPageChange={handlePageClick}
          pageRangeDisplayed={4}  // Show 4 pages in the middle
          marginPagesDisplayed={1} // Show 1 page on each side (first and last)
          pageCount={Math.ceil(interactionData[activeTab].length / itemsPerPage)}
          previousLabel="<"
          containerClassName="pagination"
          activeClassName="active"
        />
      </div>
    </div>
  );
}
