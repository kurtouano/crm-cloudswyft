const API_URL = import.meta.env.VITE_BACKEND_URL; 

import useMicrosoftAuthentication from "../../utils/AuthMicrosoft.js";
import { toast } from "react-hot-toast";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ReactPaginate from "react-paginate";
import usersIcon from "@/assets/users.png";
import clockIcon from "@/assets/clock.png";
import hourglassIcon from "@/assets/hourglass.png";
import highPriorityIcon from "@/assets/highpriority.png";
import leadIcon from "@/assets/lead-profile-icon.svg";
import InteractionArrowIcon from "@/assets/interaction-history-arrow.svg";
import { MdEdit } from "react-icons/md";

export default function LeadProfilePage() {
  useMicrosoftAuthentication(); // Ensure user is authenticated in Microsoft

  const navigate = useNavigate();
  const location = useLocation();
  const lead = location.state?.lead || {};

  const [activeTab, setActiveTab] = useState("sent");
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 5;

  const [sentEmails, setSentEmails] = useState([]);
  const [receivedEmails, setReceivedEmails] = useState([]);
  const [status, setStatus] = useState(lead.status);

  // 🆕 Editing states
  const [leadData, setLeadData] = useState({ ...lead });
  const [isEditingBasic, setIsEditingBasic] = useState(false);
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [editedLead, setEditedLead] = useState({ ...lead });

  const handleEditToggle = (section) => {
    if (section === "basic") setIsEditingBasic(true);
    else if (section === "contact") setIsEditingContact(true);
  };

  const handleInputChange = (field, value) => {
    setEditedLead((prev) => ({ ...prev, [field]: value }));
  };

  const cancelEdit = () => {
    setEditedLead({ ...leadData });
    setIsEditingBasic(false);
    setIsEditingContact(false);
  };
  

  const saveChanges = async () => {
    try {
      // Clone and sanitize edited lead
      const sanitizedLead = { ...editedLead };
  
      // If leadID is a string like "LID-055", strip it or remove it completely
      if (typeof sanitizedLead.leadID === "string") {
        delete sanitizedLead.leadID;
      }
  
      const response = await fetch(`${API_URL}/api/leads/update/${lead._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(sanitizedLead),
      });
  
      if (response.ok) {
        const updated = await response.json();
        setIsEditingBasic(false);
        setIsEditingContact(false);
        setEditedLead(updated);
        setLeadData(updated); // 👈 force UI to show updated info
        toast.success("Lead updated successfully!");
      } else {
        toast.error("Failed to update lead.");
      }
    } catch (error) {
      console.error("Error saving lead:", error);
      toast.error("⚠️ An error occurred while saving.");
    }
  };

  const cardData = [
    { 
      title: "Lead Status", 
      value: leadData.status === "active" ? "Active" : 
             leadData.status === "successful" ? "Closed - Successful" : 
             leadData.status === "lost" ? "Closed - Lost" : 
             leadData.status, // fallback
      bgColor: "#2196F3", 
      icon: usersIcon 
    },
    { title: "Sales Flow Stage", value: leadData.stage, bgColor: "#1BB9F4", icon: hourglassIcon },
    { title: "Lead Warmth", value: leadData.temperature, bgColor: "#2196F3", icon: highPriorityIcon },
    { title: "Date Added", value: leadData.importDate, bgColor: "#307ADB", icon: clockIcon },
  ];

  useEffect(() => {
    setStatus(leadData.status); // Update status if lead.status changes (e.g., after refresh)
  }, [leadData.status]); // Runs when lead.status updates

  useEffect(() => {
    const fetchEmails = async () => {
      try {
        if (!lead?.bestEmail) return; // ✅ Prevents errors if undefined

        console.log("Fetching emails for:", lead.bestEmail);

        const sentResponse = await fetch(`${API_URL}/api/emails/fetch-sent-email-raw?leadEmail=${lead.bestEmail}`);
        const sentData = await sentResponse.json();
        console.log("Sent Emails Data:", sentData);

        const receivedResponse = await fetch(`${API_URL}/api/emails/fetch-reply-emails-raw?leadEmail=${lead.bestEmail}`);
        const receivedData = await receivedResponse.json();
        console.log("Received Emails Data:", receivedData);

        setSentEmails(sentData);
        setReceivedEmails(receivedData);
      } catch (error) {
        console.error("Error fetching emails:", error);
      }
    };

    fetchEmails();

    const interval = setInterval(fetchEmails, 12000);
    return () => clearInterval(interval);
  }, [lead?.bestEmail]);

  const handleToggle = (tab) => {
    setActiveTab(tab);
    setCurrentPage(0); // Reset to first page when switching tabs
  };

  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
  };

  // Get paginated emails
  const emailsToShow = activeTab === "sent" ? sentEmails : receivedEmails;
  const dataToShow = emailsToShow.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString("en-US", {
      month: "long", // Full month name (e.g., "March")
      day: "numeric", // Day number (e.g., "19")
      hour: "numeric", // Hour (e.g., "5")
      minute: "2-digit", // Minutes (e.g., "16")
      hour12: true, // Use AM/PM format
    }).replace("at", "-"); // Replace the comma with " -"
  };

  return (
    <>
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

          {/* Lead Profile Details */}
          <div className="lead-profile-details-container">
            <div className="lead-profile-name-container">
              <img src={leadIcon} className="lead-profile-icon" alt="Lead Icon" />
              <p className="lead-profile-name">{leadData.leadName}</p>
            </div>

            <div className="lead-profile-basic-information">
              <div className="profile-basic-title-container" style={{ position: "relative" }}>
                <p className="profile-basic-title">Basic Information</p>
                {!isEditingBasic && <MdEdit className="edit-icon" onClick={() => handleEditToggle("basic")} />}
              </div>
              <div className="profile-body-list">
                {["company", "industry", "companyAddress", "nameOfPresident", "nameOfHrHead", "temperature"].map((field) => (
                  <p className="profile-body" key={field}>
                    <span className="profile-body-item-title">{field.replace(/([A-Z])/g, " $1")}: </span>
                    {isEditingBasic ? (
                      <input
                        value={editedLead[field] || ""}
                        onChange={(e) => handleInputChange(field, e.target.value)}
                        style={{ border: "1px solid #ccc", borderRadius: "5px", padding: "2px 5px" }}
                      />
                    ) : (
                      <span className="profile-body-item-value">{leadData[field]}</span>
                    )}
                  </p>
                ))}
              </div>
            </div>



            <div className="lead-profile-basic-information">
              <div className="profile-basic-title-container" style={{ position: "relative" }}>
                <p className="profile-basic-title">Contact Information</p>
                {!isEditingContact && <MdEdit className="edit-icon" onClick={() => handleEditToggle("contact")} />}
              </div>
              <div className="profile-body-list">
                {["leadName", "bestEmail", "phone", "social", "website"].map((field) => (
                  <p className="profile-body" key={field}>
                    <span className="profile-body-item-title">{field.replace(/([A-Z])/g, " $1")}: </span>
                    {isEditingContact ? (
                      <input
                        value={editedLead[field] || ""}
                        onChange={(e) => handleInputChange(field, e.target.value)}
                        style={{ border: "1px solid #ccc", borderRadius: "5px", padding: "2px 5px" }}
                      />
                    ) : (
                      <span className="profile-body-item-value">{leadData[field]}</span>
                    )}
                  </p>
                ))}

              </div>
             
            </div>
            <div className="editButtons">
            {(isEditingBasic || isEditingContact) && (
              <div className="lead-profile-edit-actions">
                <button onClick={saveChanges} className="lead-profile-save-btn">Save</button>
                <button onClick={cancelEdit} className="lead-profile-cancel-btn">Cancel</button>
              </div>
            )}
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
        {dataToShow.length > 0 ? (
            dataToShow.map((interaction) => {
              console.log("Interaction Object:", interaction); // Debugging: Log the interaction object
              return (
                <div
                  key={interaction._id}
                  className={`interaction-history-item ${activeTab === "sent" ? "disabled" : ""}`}
                  onClick={() =>
                    navigate(`/communications?leadEmail=${encodeURIComponent(lead.bestEmail)}&threadId=${encodeURIComponent(interaction.threadId)}`)
                  }
                >
                  <img src={InteractionArrowIcon} className="interaction-history-icon" alt="Arrow Icon" />
                  <p className="interaction-history-title">Base</p>
                  <p className="interaction-history-type">Promotions</p>
                  <p className="interaction-history-subject">{interaction.subject}</p>
                  <p className="interaction-history-description" dangerouslySetInnerHTML={{ __html: interaction.message || interaction.content }}></p>
                  <p className="interaction-history-date">
                    {[interaction.timestamp, interaction.sentAt]
                      .filter(Boolean)
                      .map(formatDate)
                      .join(" || ")}
                  </p>
                </div>
              );
            })
          ) : (
            <p className="no-interactions-message">No Emails found.</p>
          )}
        </div>

        {/* Pagination */}
        <div className="accounts-pagination-container">
          <ReactPaginate
            breakLabel="..."
            nextLabel=">"
            onPageChange={handlePageClick}
            pageRangeDisplayed={3}
            marginPagesDisplayed={1}
            pageCount={Math.ceil(emailsToShow.length / itemsPerPage) || 1} // Ensure pagination updates dynamically
            previousLabel="<"
            containerClassName="accounts-pagination"
            activeClassName="active"
          />
        </div>
      </div>
    </>
  );
}