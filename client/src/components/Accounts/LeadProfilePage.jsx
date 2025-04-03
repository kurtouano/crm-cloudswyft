import useMicrosoftAuthentication from "../../utils/AuthMicrosoft.js";
import { toast } from "react-hot-toast";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ReactPaginate from "react-paginate";
import usersIcon from "../../assets/users.png";
import clockIcon from "../../assets/clock.png";
import { FiChevronUp, FiChevronDown} from "react-icons/fi";
import hourglassIcon from "../../assets/hourglass.png";
import highPriorityIcon from "../../assets/highpriority.png";
import leadIcon from "../../assets/lead-profile-icon.svg";
import InteractionArrowIcon from "../../assets/interaction-history-arrow.svg";
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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // State for dropdown visibility
  const [activeOption, setActiveOption] = useState("");


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
  
      const response = await fetch(`http://localhost:4000/api/leads/update/${lead._id}`, {
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
  
  
  

  // Change Status of Lead in DB
  const handleStatusChange = async (newStatus) => {
    setStatus(newStatus);

    try {
      // Extract numeric part from formatted leadID
      const leadNumericID = parseInt(lead.leadID.replace("LID-", ""), 10);

      if (isNaN(leadNumericID)) {
        console.error("Invalid lead ID format:", lead.leadID);
        return;
      }

      const response = await fetch(`http://localhost:4000/api/leads/status/${leadNumericID}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();
      if (response.ok) {
        console.log("Status updated:", data);
      } else {
        console.error("Error updating status:", data.error);
      }
    } catch (error) {
      console.error("Request failed:", error);
    }
  };

  const cardData = [
    { title: "Lead Status", type: "dropdown", bgColor: "#2196F3", icon: usersIcon },
    { title: "Last Contact Date", value: "02/07/25", bgColor: "#1BB9F4", icon: clockIcon },
    { title: "Next Action Needed", value: "Follow Up", bgColor: "#2196F3", icon: hourglassIcon },
    { title: "Lead Score", value: "Priority", bgColor: "#307ADB", icon: highPriorityIcon },
  ];

  const dropdownOptions = [
    { value: "active", label: "Active" },
    { value: "successful", label: "Closed - Successful" },
    { value: "lost", label: "Closed - Lost" },
  ];

  const currentLabel = dropdownOptions.find((option) => option.value === status)?.label || status;

  // Handle dropdown option click
  const handleOptionClick = (optionValue) => {
    setStatus(optionValue); // Update the status
    handleStatusChange(optionValue); // Send the update to the backend
    setActiveOption(optionValue); // Update the active option
    setIsDropdownOpen(false); // Close the dropdown
  };

  useEffect(() => {
    setStatus(leadData.status); // Update status if lead.status changes (e.g., after refresh)
  }, [leadData.status]); // Runs when lead.status updates

  useEffect(() => {
    const fetchEmails = async () => {
      try {
        if (!lead?.bestEmail) return; // ✅ Prevents errors if undefined

        console.log("Fetching emails for:", lead.bestEmail);

        const sentResponse = await fetch(`http://localhost:4000/api/emails/fetch-sent-email-raw?leadEmail=${lead.bestEmail}`);
        const sentData = await sentResponse.json();
        console.log("Sent Emails Data:", sentData);

        const receivedResponse = await fetch(`http://localhost:4000/api/emails/fetch-reply-emails-raw?leadEmail=${lead.bestEmail}`);
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
                  {card.type === "dropdown" ? (
                    <div className="custom-dropdown">
                      <div
                        className="dropdown-header"
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      >
                        {currentLabel} {/* Display the label instead of the value */}
                        <div className="dropdown-arrow">{isDropdownOpen ? <FiChevronUp /> : <FiChevronDown />}</div>
                      </div>
                      {isDropdownOpen && (
                        <div className="dropdown-options">
                          {dropdownOptions.map((option) => (
                            <div
                              key={option.value}
                              className={`dropdown-option ${activeOption === option.value ? "active" : ""}`}
                              onClick={() => handleOptionClick(option.value)}
                            >
                              {option.label} {/* Display the label in the dropdown options */}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="account-value">{card.value}</p>
                  )}
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
                    <span>{field.replace(/([A-Z])/g, " $1")}: </span>
                    {isEditingBasic ? (
                      <input
                        value={editedLead[field] || ""}
                        onChange={(e) => handleInputChange(field, e.target.value)}
                        style={{ border: "1px solid #ccc", borderRadius: "5px", padding: "2px 5px" }}
                      />
                    ) : (
                      <span>{leadData[field]}</span>
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
                    <span>{field.replace(/([A-Z])/g, " $1")}: </span>
                    {isEditingContact ? (
                      <input
                        value={editedLead[field] || ""}
                        onChange={(e) => handleInputChange(field, e.target.value)}
                        style={{ border: "1px solid #ccc", borderRadius: "5px", padding: "2px 5px" }}
                      />
                    ) : (
                      <span>{leadData[field]}</span>
                    )}
                  </p>
                ))}

              </div>
             
            </div>

          
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
                  <p className="interaction-history-description">- {interaction.message || interaction.content}</p>
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
        <div className="pagination-container">
          <ReactPaginate
            breakLabel="..."
            nextLabel=">"
            onPageChange={handlePageClick}
            pageRangeDisplayed={3}
            marginPagesDisplayed={1}
            pageCount={Math.ceil(emailsToShow.length / itemsPerPage) || 1} // Ensure pagination updates dynamically
            previousLabel="<"
            containerClassName="pagination"
            activeClassName="active"
          />
        </div>
      </div>
    </>
  );
}