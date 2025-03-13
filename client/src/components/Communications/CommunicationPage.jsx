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
  const [selectedFile, setSelectedFile] = useState(null);
  const [filteredEmails, setFilteredEmails] = useState([]);
  const [currentEmailIndex, setCurrentEmailIndex] = useState(0);

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const response = await fetch("http://localhost:4000/api/leads");
        if (!response.ok) throw new Error("Failed to fetch leads");

        const data = await response.json();
        setLeads(data);
        setFilteredLeads(data); // ✅ Initialize filtered leads
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

  /* const handleSubmit = async (e) => { // WILL BE ADDED IN THE FUTURE FOR CREATE EMAILS 
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

    */

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

    // Utility function to remove HTML tags
    const stripHtmlTags = (html) => {
      const doc = new DOMParser().parseFromString(html, "text/html");
      return doc.body.textContent || "";
    };

    // attachments icon
    const getFileIcon = (mimeType) => {
      if (mimeType.includes("pdf")) return <FaFilePdf className="attachment-icon pdf" />;
      if (mimeType.includes("msword") || mimeType.includes("word")) return <FaFileWord className="attachment-icon word" />;
      if (mimeType.includes("excel") || mimeType.includes("spreadsheet")) return <FaFileExcel className="attachment-icon excel" />;
      if (mimeType.includes("image")) return <FaFileImage className="attachment-icon image" />;
      return <FaFileAlt className="attachment-icon generic" />;
    };


    const handlePreviousEmail = () => {
      if (currentEmailIndex > 0) { 
        setCurrentEmailIndex(currentEmailIndex - 1); // Move Back
      }
    };
    
    const handleNextEmail = () => {
      if (currentEmailIndex < filteredEmails.length - 1) {
        setCurrentEmailIndex(currentEmailIndex + 1); // Move Forward
      }
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
            onChange={handleSearch} // ✅ Attach search handler
          />
          <button className="inbox-header-create-email-btn">
            <FiEdit className="inbox-header-create-email-icon" />
          </button>
        </div>

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

          {/* Pagination */}
          <div className="email-pagination-container">
              <button 
                className="pagination-arrow" 
                onClick={handlePreviousEmail} 
                disabled={currentEmailIndex <= 0} // Disable on first email
              >
                <IoArrowBack />
              </button>

              <span className="email-pagination">
                {filteredEmails.length > 0 ? currentEmailIndex + 1 : 0} of {filteredEmails.length}
              </span>

              <button 
                className="pagination-arrow" 
                onClick={handleNextEmail} 
                disabled={currentEmailIndex >= filteredEmails.length - 1} // Disable on last email
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

        {/* Display received emails */}
        <div className="email-received-space">
        {filteredEmails.length > 0 && filteredEmails[currentEmailIndex] ? (
            filteredEmails
              .filter(email => email?.threadId === filteredEmails[currentEmailIndex]?.threadId)  // Check for email existence
              .map((email, index) => email ? (
                <div key={email?.messageId || `email-${index}`} className="email-received-message">
                  {/* Email Header */}
                  <div className="email-header-details">
                    <CgProfile className="email-user-icon" />
                    <div className="email-header-info">
                      <p className="email-sender-name">{activeLead?.leadName || "Unknown Lead"}</p>
                      <p className="email-sender-email">{email?.sender || "Unknown Sender"}</p>
                    </div>
                    <p className="email-timestamp">
                      {email?.timestamp ? new Date(email.timestamp).toLocaleString() : "Unknown Time"}
                    </p>
                  </div>

                  {/* Show subject only for the first email in a thread */}
                  {index === 0 && <p className="email-subject-display">{email?.subject || "No Subject"}</p>}

                  {/* Email Body */}
                  <div className="email-body-container">
                    <p className="email-body-display">{email?.message ? stripHtmlTags(email.message) : "No Content"}</p>
                  </div>

                  {/* Attachments */}
                  {email?.attachments?.length > 0 && (
                    <div className="email-attachments-container">
                      <p className="attachments-header">Attachments:</p>
                      <div className="attachments-list">
                        {email.attachments.map((attachment, attIndex) => {
                          if (!attachment?.contentUrl) {
                            console.error(`Missing contentUrl for attachment: ${attachment?.fileName}`);
                            return null;
                          }

                          const fileUrl = `data:${attachment?.mimeType};base64,${attachment?.contentUrl}`;

                          return (
                            <div key={attIndex} className="attachment-item">
                              {getFileIcon(attachment?.mimeType)}
                              <div className="attachment-details">
                                <p className="attachment-name">{attachment?.fileName || "Unknown File"}</p>
                                <div className="attachment-actions">
                                  <button
                                    onClick={() => setSelectedFile({ fileUrl, mimeType: attachment?.mimeType })}
                                    className="view-link"
                                  >
                                    View
                                  </button>
                                  <span className="separator"> | </span>
                                  <a href={fileUrl} download={attachment?.fileName} className="download-link">
                                    Download
                                  </a>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ) : null)
          ) : <p></p>
          }

          {selectedFile && (
            <div className="attachment-modal">
              <div className="attachment-modal-content">
                <MdClose className="close-icon" onClick={() => setSelectedFile(null)} />
                {selectedFile.mimeType.includes("pdf") ? (
                  <embed src={selectedFile.fileUrl} type="application/pdf" width="100%" height="80%" />
                ) : selectedFile.mimeType.includes("image") ? (
                  <img src={selectedFile.fileUrl} alt="Attachment Preview" style={{ width: "100%", height: "auto", borderRadius: "5px" }} />
                ) : (
                  <div className="unsupported-file-container">
                    <p>Preview not available for this file type.</p>
                    <a href={selectedFile.fileUrl} download className="download-button">
                      Download File
                    </a>
                  </div>
                )}
              </div>
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
