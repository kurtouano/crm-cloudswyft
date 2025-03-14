import { useEffect, useState, useMemo} from "react";
import Fuse from "fuse.js"; // 🔍 Import Fuse.js
import { FiSearch, FiEdit } from "react-icons/fi";
import { FaStar,FaFilePdf, FaFileWord, FaFileExcel, FaFileImage, FaFileAlt } from "react-icons/fa";
import { CgProfile } from "react-icons/cg";
import { IoArrowBack, IoArrowForward, IoReturnUpBackOutline, IoChevronDownOutline, IoTrashOutline, IoExpandOutline, IoEllipsisVerticalOutline } from "react-icons/io5";
import { MdAttachFile, MdClose } from "react-icons/md";
import "./Communication.css";

export default function CommunicationPageNEW() {
  const [leads, setLeads] = useState([]);
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [activeLead, setActiveLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState(""); 

  const [microsoftAccessToken, setMicrosoftAccessToken] = useState("");
  const [receiveloading, receiveSetLoading] = useState(true);
  const [emails, setEmails] = useState([]);
  const [fetchEmailError, setFetchEmailError] = useState(null);
  const [attachment, setAttachment] = useState(null);
  const [formData, setFormData] = useState({ to: "", subject: "", text: "" });
  const [formDataReply, setFormDataReply] = useState({ text: "", messageId: ""});
  const [selectedAttachment, setSelectedAttachment] = useState(null);

  const [modalOpen, setModalOpen] = useState(false); 

  const [sentEmails, setSentEmails] = useState([]); // Stores paginated sent emails
  const [totalSentEmails, setTotalSentEmails] = useState(0); // Total sent emails count
  const [currentSentPage, setCurrentSentPage] = useState(1); // Current page number
  const sentEmailsPerPage = 1; // Display one email at a time


  const [filteredEmails, setFilteredEmails] = useState([]);
  const [currentEmailIndex, setCurrentEmailIndex] = useState(0);

  //for email suggestion
  const [bestEmails, setBestEmails] = useState([]); // Store all bestEmail values
  const [showSuggestions, setShowSuggestions] = useState(false);


  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const response = await fetch("http://localhost:4000/api/leads");
        if (!response.ok) throw new Error("Failed to fetch leads");
  
        const data = await response.json();
        setLeads(data);
        setFilteredLeads(data);
  
        // Extract bestEmails from leads
        const emails = data.map(lead => lead.bestEmail).filter(email => email);
        setBestEmails(emails);
      } catch (error) {
        console.error("Error fetching leads:", error);
        setError("Failed to fetch leads.");
      } finally {
        setLoading(false);
      }
    };
  
    fetchLeads();
  }, []);
  
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
    const fetchEmails = async () => {
      try {
        const token = localStorage.getItem("microsoftAccessToken");
    
        if (!token) {
          throw new Error("Access token is missing from localStorage.");
        }
    
        const response = await fetch("http://localhost:4000/api/emails/received", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });
    
        const data = await response.json();
        console.log("Fetched Emails:", data.emails); // Debugging log
    
        if (response.ok) {
          setEmails(data.emails); 
        } else {
          throw new Error(data.error || "Failed to fetch emails.");
        }
      } catch (err) {
        console.error("Fetch Emails Error:", err.message);
        setFetchEmailError(err.message);
      } finally {
        receiveSetLoading(false);
      }
    };
    
      fetchEmails();
      const interval = setInterval(fetchEmails, 10000); // Auto-fetch every 10 seconds
      return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (activeLead) {
      const leadEmails = emails
        .filter(email => {
          return email.sender.toLowerCase() === activeLead.bestEmail.toLowerCase();
        })
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setFilteredEmails(leadEmails);
    }
  }, [activeLead, emails]); 
  
  useEffect(() => {
    const fetchSentEmails = async () => {
        if (!activeLead?.bestEmail) return;

        try {
            const response = await fetch(`http://localhost:4000/api/emails/sent?to=${activeLead.bestEmail}&page=${currentSentPage}&limit=${sentEmailsPerPage}`);
            const data = await response.json();

            if (response.ok && data.emails.length > 0) {
                setSentEmails(data.emails);
                setTotalSentEmails(data.totalEmails);  // ✅ Update total sent emails count
            } else {
                setSentEmails([]);
                setTotalSentEmails(0);  // ✅ Reset count if no emails found
            }
        } catch (error) {
            console.error("Error fetching sent emails:", error);
            setSentEmails([]);
        }
    };

    fetchSentEmails();
}, [activeLead, currentSentPage]);  // ✅ Updates when lead changes


  useEffect(() => {
    const fetchReceivedEmails = async () => {
        if (!activeLead?.bestEmail) return;

        try {
            const response = await fetch(`http://localhost:4000/api/emails/received?to=${activeLead.bestEmail}`);
            const data = await response.json();

            if (response.ok && data.emails) {
                setFilteredEmails(data.emails);
            }
        } catch (error) {
            console.error("Error fetching received emails:", error);
        }
    };

    fetchReceivedEmails();
    const interval = setInterval(fetchReceivedEmails, 10000); // Auto-fetch every 10 seconds
    return () => clearInterval(interval);
  }, [activeLead]);


  useEffect(() => {
    if (filteredEmails.length > 0) {
      setFormDataReply((prev) => ({
        ...prev,
        messageId: filteredEmails[currentEmailIndex].messageId, // Update messageId
      }));
    } else {
      console.log("No messageId found for current email");
    }
  }, [currentEmailIndex, filteredEmails]);
  
  // Memoized Fuse.js instance
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
    setFormData((prev) => ({ ...prev, to: lead.bestEmail || "" }));

    setCurrentSentPage(1);
    setSentEmails([]);  
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

 // Open Modal
 const openModal = () => setModalOpen(true);

  // Close Modal
  const closeModal = () => {
    setModalOpen(false);
    setFormData({ to: "", subject: "", text: "" });
    setAttachment(null);
  };

   // Handle Input Changes
   const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => { // WILL BE ADDED IN THE FUTURE FOR CREATE EMAILS 
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


  const handleReplySubmit = async (e) => {
    e.preventDefault();
    const microsoftAccessToken = localStorage.getItem("microsoftAccessToken");
    console.log("Reply Email Token", microsoftAccessToken);
  
    if (!microsoftAccessToken) {
      alert("Please log in via Microsoft first.");
      return;
    }
  
    setLoading(true);
  
    try {
      const res = await fetch("http://localhost:4000/api/emails/reply-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: formDataReply.text, // Reply message
          token: microsoftAccessToken,
          messageId: formDataReply.messageId, // Required for threading the reply
          attachments: attachment ? [attachment] : [], // Include attachment if available
        }),
      });
  
      const data = await res.json();
  
      if (res.ok) {
        alert("Reply sent successfully!");
        setFormDataReply({ messageId: "", text: "" }); // Reset reply form
        setAttachment(null); // Clear attachment
      } else {
        alert(data.error || "Failed to send reply");
      }
    } catch (error) {
      console.error("Error sending reply:", error);
    }
  
    setLoading(false);
  };


  // Helper function to format timestamp
  const formatRelativeTime = (timestamp) => {
    if (!timestamp) return "N/A";
    const emailDate = new Date(timestamp);
    const now = new Date();
    const timeDiff = now - emailDate; // in milliseconds

    const minutes = Math.floor(timeDiff / (1000 * 60));
    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

    if (minutes < 1) {
      return "Just now";
    } else if (minutes < 60) {
      return `${minutes} min${minutes > 1 ? "s" : ""} ago`;
    } else if (hours < 24) {
      return `${hours} hr${hours > 1 ? "s" : ""} ago`;
    } else {
      return `${days} day${days > 1 ? "s" : ""} ago`;
    }
  };

  // Function to open modal
  const handleViewAttachment = (attachment) => {
    setSelectedAttachment(attachment);
  };

  // Function to close modal
  const handleCloseModal = () => {
    setSelectedAttachment(null);
  };

  // attachments icon
  const getFileIcon = (mimeType) => {
    if (mimeType.includes("pdf")) return <FaFilePdf className="attachment-icon pdf" />;
    if (mimeType.includes("msword") || mimeType.includes("word")) return <FaFileWord className="attachment-icon word" />;
    if (mimeType.includes("excel") || mimeType.includes("spreadsheet")) return <FaFileExcel className="attachment-icon excel" />;
    if (mimeType.includes("image")) return <FaFileImage className="attachment-icon image" />;
    return <FaFileAlt className="attachment-icon generic" />;
  };

  const getInitials = (name) => {
    if (!name) return "?";
    return name.charAt(0).toUpperCase(); // First letter only
};

const handleRecipientChange = (e) => {
  const input = e.target.value;
  setFormData({ ...formData, to: input });

  if (!input) {
    setFilteredEmails(bestEmails); // Show all emails when input is empty
  } else {
    const matches = bestEmails.filter(email =>
      email.toLowerCase().includes(input.toLowerCase())
    );
    setFilteredEmails(matches);
  }

  setShowSuggestions(true);
};


const handleSelectEmail = (email) => {
  setFormData({ ...formData, to: email });
  setShowSuggestions(false);
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
            onChange={handleSearch} 
          />
           <button className="inbox-header-create-email-btn" onClick={openModal}>
              <FiEdit className="inbox-header-create-email-icon" />
           </button>
        </div>

         {/* Floating Modal for Creating Email */}
          {modalOpen && (
            <div className="modal-overlay">
              <div className="modal-content">
                <div className="modal-header">
                  <h2>New Email</h2>
                  <MdClose className="modal-close-icon" onClick={closeModal} />
                </div>

                <form className="email-form" onSubmit={handleSubmit}>
                  
                  {/* ✅ Updated Recipient Input with Suggestions */}
                  <div className="recipient-container">
                  <input
                    type="email"
                    name="to"
                    className="email-input"
                    placeholder="Recipient"
                    value={formData.to}
                    onChange={handleRecipientChange}
                    required
                    autoComplete="off"
                    onFocus={() => {
                      setFilteredEmails(bestEmails); // Show all emails on focus
                      setShowSuggestions(true);
                    }}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} // Delay hiding for click selection
                  />


                  {showSuggestions && filteredEmails.length > 0 && (
                    <ul className="suggestions-dropdown">
                      {filteredEmails.map((email, index) => (
                        <li key={index} onClick={() => handleSelectEmail(email)}>
                          {email}
                        </li>
                      ))}
                    </ul>
                  )}


                  </div>

                  {/* Subject */}
                  <input
                    type="text"
                    name="subject"
                    className="email-input"
                    placeholder="Subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                  />

                  {/* Message Body */}
                  <textarea
                    name="text"
                    className="email-textarea"
                    placeholder="Write your message..."
                    value={formData.text}
                    onChange={handleChange}
                    required
                  />

                  {/* Attachments & Send */}
                  <div className="email-actions-send">
                    <div className="email-attachment-container">
                      <label className="email-attach-label">
                        <MdAttachFile className="email-attach-icon-send" />
                        <input type="file" className="email-attach-input" onChange={handleFileChange} />
                      </label>

                      {attachment && (
                        <div className="email-attachment-preview">
                          {getFileIcon(attachment.mimeType)}
                          <span className="attachment-name-send">{attachment.fileName}</span>
                          <MdClose className="email-attach-remove-icon-send" onClick={() => setAttachment(null)} />
                        </div>
                      )}
                    </div>

                    {/* Send Button */}
                    <button className="send-button-send" type="submit">Send</button>
                  </div>
                </form>
              </div>
            </div>
          )}


        {/* Leads List */}
        <div className="inbox-body-list-grid">
          {loading ? (
            <p>Loading leads...</p>
          ) : error ? (
            <p className="error-message">{error}</p>
          ) : filteredLeads.length === 0 ? (
            <p>No leads found.</p>
          ) : (
            filteredLeads.map((lead) => {
              // Get emails for this lead
              const leadEmails = emails.filter(
                (email) => email.sender.toLowerCase() === lead.bestEmail.toLowerCase()
              );

              const lastEmail = leadEmails.reduce((latest, current) => {
                return (!latest || new Date(current.timestamp) > new Date(latest.timestamp))
                  ? current
                  : latest;
              }, null);
              
              return (
                <div
                  key={lead._id}
                  className={`inbox-body-list-container ${
                    activeLead?._id === lead._id ? "active" : ""
                  }`}
                  onClick={() => handleLeadClick(lead)}
                >
                  <div className="inbox-body-header">
                    <CgProfile className="inbox-body-header-icon" />
                    <p className="inbox-body-lead-type">
                      {lead.leadName || "Unknown Lead"}
                    </p>
                    <p className="inbox-body-last-message-time">
                      {lastEmail ? formatRelativeTime(lastEmail.timestamp) : "No email"}
                    </p>
                  </div>
                  <p className="inbox-body-company-name">{lead.company}</p>
                  <div className="inbox-body-reply-preview-container">
                    <p className="inbox-body-reply-preview">
                      {lead.lastMessage ||
                        "No recent message Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ex tellus, maximus pharetra tellus ac."}
                    </p>
                    <FaStar className="inbox-body-reply-type-star" />
                  </div>
                </div>
              );
            })
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

          {/* Pagination Controls */}
          <div className="email-pagination-container">
              <button 
                  className="pagination-arrow" 
                  onClick={() => setCurrentSentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentSentPage === 1} // Disable on first email
              >
                  <IoArrowBack />
              </button>

              <span className="email-pagination">
                  {totalSentEmails > 0 ? currentSentPage : 0} of {Math.max(1, Math.ceil(totalSentEmails / sentEmailsPerPage))}
              </span>

              <button 
                  className="pagination-arrow" 
                  onClick={() => setCurrentSentPage((prev) => Math.min(prev + 1, Math.ceil(totalSentEmails / sentEmailsPerPage)))}
                  disabled={currentSentPage >= Math.ceil(totalSentEmails / sentEmailsPerPage)} // Disable on last email
              >
                  <IoArrowForward />
              </button>
          </div>


          {/* Right Side Icons */}
          <div className="email-header-right">
              <IoArrowForward className="email-nav-icon circle-icon" />
              <IoExpandOutline className="email-nav-icon" />
              <IoEllipsisVerticalOutline className="email-nav-icon" />
          </div>
        </div>

      {/* Display Sent Emails */}
      <div className="email-received-space">
          {sentEmails.length > 0 && (
              <div className="email-received-message">
                  {/* Email Header */}
                  <div className="email-header-details">
                      {/*  Profile Icon  */}
                      <div 
                          className="email-user-icon"
                          style={{
                              backgroundColor: "#007bff", // Fixed blue color
                              color: "#fff", // White text
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "16px",
                              fontWeight: "bold",
                              textTransform: "uppercase",
                              width: "45px",
                              height: "45px",
                              borderRadius: "50%",
                              marginRight: "12px"
                          }}
                      >
                          {getInitials("Cloudswyft")}
                      </div>

                      {/* ✅ Sender Name & Email */}
                      <div className="email-header-info">
                          <p className="email-sender-name">Cloudswyft</p>
                          <p className="email-sender-email">crm-cloudswyft-test@outlook.com</p>
                      </div>

                      {/* ✅ Timestamp (Aligned Right) */}
                      <p className="email-timestamp">
                          {sentEmails[0].sentAt
                              ? new Date(sentEmails[0].sentAt).toLocaleString()
                              : "No Timestamp Available"}
                      </p>
                  </div>

                  {/* Email Subject (Proper Padding) */}
                  <p className="email-subject-display">{sentEmails[0].subject || "No Subject"}</p>

                  {/* Email Body (Better Spacing) */}
                  <div className="email-body-container">
                      <p className="email-body-display">{sentEmails[0].content || "No Content"}</p>
                  </div>

                  {/* Attachments Section */}
                  {sentEmails[0].attachments.length > 0 && (
                      <div className="email-attachments-container">
                          <p className="attachments-header">Attachments:</p>
                          <div className="attachments-list">
                              {sentEmails[0].attachments.map((attachment, index) => (
                                  <div key={index} className="attachment-item">
                                      {/* File Icon */}
                                      {getFileIcon(attachment.mimeType)}

                                      <div className="attachment-details">
                                          <p className="attachment-name">{attachment.fileName}</p>
                                          
                                          {/* View & Download Actions */}
                                          <div className="attachment-actions">
                                              <button
                                                  className="view-link"
                                                  onClick={() => handleViewAttachment(attachment)}
                                              >
                                                  View
                                              </button>

                                              <span className="separator">|</span>

                                              <a
                                                  href={`data:${attachment.mimeType};base64,${attachment.contentBytes}`}
                                                  download={attachment.fileName}
                                                  className="download-link"
                                              >
                                                  Download
                                              </a>
                                          </div>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      </div>
                  )}

                  {/* Attachment Modal */}
                  {selectedAttachment && (
                      <div className="attachment-modal" onClick={handleCloseModal}>
                          <div className="attachment-modal-content" onClick={(e) => e.stopPropagation()}>
                              <div className="attachment-header">
                                  <p>{selectedAttachment.fileName}</p>
                                  <span className="close-icon" onClick={handleCloseModal}>×</span>
                              </div>

                              {/* File Preview */}
                              {selectedAttachment.mimeType.includes("image") ? (
                                  <img
                                      src={`data:${selectedAttachment.mimeType};base64,${selectedAttachment.contentBytes}`}
                                      alt="Preview"
                                      className="attachment-preview"
                                  />
                              ) : (
                                  <iframe
                                      src={`data:${selectedAttachment.mimeType};base64,${selectedAttachment.contentBytes}`}
                                      title="Attachment Preview"
                                      className="attachment-preview"
                                  />
                              )}
                          </div>
                      </div>
                  )}

              </div>
          )}
      </div>


        <form className="email-compose-box" onSubmit={handleReplySubmit}>
          <div className="email-header">
            <div className="email-left-icons">
              <IoReturnUpBackOutline className="email-icon" />
              <IoChevronDownOutline className="email-icon" />
              <input className={`email-recipient ${formData.to ? "" : "empty"}`}
                type="email"
                name="to"
                value={formData.to}
                readOnly
              />
            </div>
            <div className="email-actions-icons">
              <IoTrashOutline className="email-icon" />
              <IoExpandOutline className="email-icon" />
            </div>
          </div>

          {/* Message Body */}
          <textarea
            name="text"
            className="email-body"
            value={formDataReply.text}
              onChange={(e) => setFormDataReply({ ...formDataReply, text: e.target.value })}
            placeholder="Write your message..."
          />

          {/* Send Button & Attachments */}
          <div className="email-actions">
            <button className="send-button" type="submit" disabled={loading}>{loading ? "Sending..." : "Send"}</button>
            
            {attachment && (
              <div className="email-attach-preview">
                <p>{attachment.fileName}</p>
                <MdClose className="email-attach-remove-icon" onClick={() => setAttachment(null)} />
              </div>
            )}

            <label className="email-attach-label">
              <MdAttachFile className="email-attach-icon" />
              <input type="file" className="email-attach-input" onChange={handleFileChange}  key={attachment ? attachment.fileName : "file-input"}/>
            </label>
          </div>

        </form>
      </div>
    </div>
  );
}
