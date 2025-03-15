import { useEffect, useState, useMemo, useRef} from "react";
import Fuse from "fuse.js"; // 🔍 Import Fuse.js
import { FiSearch, FiEdit } from "react-icons/fi";
import { FaStar,FaFilePdf, FaFileWord, FaFileExcel, FaFileImage, FaFileAlt } from "react-icons/fa";
import { CgProfile } from "react-icons/cg";
import { IoArrowBack, IoArrowForward, IoReturnUpBackOutline, IoChevronDownOutline, IoTrashOutline, IoExpandOutline, IoEllipsisVerticalOutline } from "react-icons/io5";
import { MdAttachFile, MdClose } from "react-icons/md";
import "./Communication.css";

export default function CommunicationPageNEW() {
  // Basic states
  const companyDisplayName = "Cloudswyft";
  const [leads, setLeads] = useState([]);
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [activeLead, setActiveLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [unreadCounts, setUnreadCounts] = useState({});

  // Auth & token
  const intervalRef = useRef(null);

  // Emails & attachments
  const [receiveloading, receiveSetLoading] = useState(false);
  const [emails, setEmails] = useState([]);
  const [sentEmails, setSentEmails] = useState([]); // Stores paginated sent emails
  const [fetchEmailError, setFetchEmailError] = useState(null);
  const [attachment, setAttachment] = useState(null);
  const [sortedLeads, setSortedLeads] = useState([]);

  // Email Form states
  const [formData, setFormData] = useState({ to: "", subject: "", text: "" });
  const [formDataReply, setFormDataReply] = useState({ text: "", messageId: "", threadId: "" });
  const [selectedAttachment, setSelectedAttachment] = useState(null);
  
   // Modal and Paginations
  const [modalOpen, setModalOpen] = useState(false); 
  const [totalSentEmails, setTotalSentEmails] = useState(0); // Total sent emails count
  const [currentSentPage, setCurrentSentPage] = useState(1); // Current page number
  const sentEmailsPerPage = 1; // Display one email at a time
  const [filteredEmails, setFilteredEmails] = useState([]);
  const [currentEmailIndex, setCurrentEmailIndex] = useState(0);

  // for email suggestion
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
    const expiryTime = params.get("expiry") ? Number(params.get("expiry")) : null;
  
    const redirectToLogin = () => {
      console.log("🔄 Access token is missing or expired. Redirecting to Microsoft login...");
      localStorage.removeItem("microsoftAccessToken");
      localStorage.removeItem("tokenExpiry");
  
      if (intervalRef.current) {
        clearInterval(intervalRef.current); // Clear the interval before redirecting
      }
  
      window.location.href = "http://localhost:4000/api/emails/microsoft-login"; // Redirect to your login page
    };
  
    const checkTokenValidity = () => {
      const storedToken = localStorage.getItem("microsoftAccessToken");
  
      // If token is missing, redirect to login
      if (!storedToken) {
        redirectToLogin();
      }
  
      const storedExpiry = localStorage.getItem("tokenExpiry");
  
      // If token has expired, redirect to login
      if (!storedExpiry || Date.now() > Number(storedExpiry)) {
        redirectToLogin();
      }
    };
  
    // If the access token and expiry are in the URL params (i.e., after logging in)
    if (accessToken && expiryTime) {
      console.log("✅ Access Token Retrieved:", accessToken);
      console.log("✅ Expires in:", Math.floor((expiryTime - Date.now()) / 60000), "minutes");
  
      localStorage.setItem("microsoftAccessToken", accessToken);
      localStorage.setItem("tokenExpiry", expiryTime);
  
      window.history.replaceState({}, document.title, "/communications");
    } else {
      // If no access token in URL, check token validity in localStorage
      checkTokenValidity();
    }
  
    // Start checking token validity every 60 seconds
    intervalRef.current = setInterval(checkTokenValidity, 60000);
  
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current); // Cleanup on component unmount
      }
    };
  }, []); // Empty dependency array ensures this runs once on component mount  

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
  }, [activeLead, currentSentPage]);

  useEffect(() => {
    const fetchEmails = async () => {
      try {
        const token = localStorage.getItem("microsoftAccessToken");
        if (!token) throw new Error("Access token is missing from localStorage.");

        const response = await fetch("http://localhost:4000/api/emails/received", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();
        console.log("Fetched Emails:", data.emails); // Debugging log

        if (response.ok) {
          setEmails(data.emails);

          // Calculate unread email count per lead
          const counts = data.emails.reduce((acc, email) => {
            if (!email.read) {
              acc[email.sender] = (acc[email.sender] || 0) + 1;
            }
            return acc;
          }, {});

          setUnreadCounts(counts);
        } else {
          throw new Error(data.error || "Failed to fetch emails.");
        }
      } catch (err) {
        console.error("Fetch Emails Error:", err.message);
        setFetchEmailError(err.message);
      }
    };

    fetchEmails();
    const interval = setInterval(fetchEmails, 12000); // Auto-fetch every 10 seconds
    return () => clearInterval(interval);
  }, []);
  
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
    const sortLeads = (leadsToSort) => {
      return [...leadsToSort].sort((a, b) => {
        const aLastEmail = emails.find(email => email.sender.toLowerCase() === a.bestEmail.toLowerCase());
        const bLastEmail = emails.find(email => email.sender.toLowerCase() === b.bestEmail.toLowerCase());
  
        return (bLastEmail ? new Date(bLastEmail.timestamp) : 0) - (aLastEmail ? new Date(aLastEmail.timestamp) : 0);
      });
    };
  
    if (leads.length > 0) {
      const sorted = sortLeads(leads);
      setSortedLeads(sorted);
      setFilteredLeads(sorted); // ✅ Initialize filteredLeads with sorted data
    }
  }, [leads, emails]); // ✅ Runs when leads or emails update

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

  useEffect(() => { // Automatically Update messageID & ThreadId based on the current lead email/page
    if (filteredEmails.length > 0) {
      setFormDataReply((prev) => ({
        ...prev,
        messageId: filteredEmails[currentEmailIndex].messageId, // Update messageId
        threadId: filteredEmails[currentEmailIndex]?.threadId || "",
      }));
    } else {
      console.log("No messageId found for current email");
    }
  }, [currentEmailIndex, filteredEmails]);
  
  // Memoized Fuse.js instance
  const fuse = useMemo(() => new Fuse(sortedLeads, { keys: ["leadName", "company"], threshold: 0.3 }), [sortedLeads]);

  const handleSearch = (event) => {
    const query = event.target.value;
    setSearchQuery(query);
  
    let updatedLeads = !query 
      ? sortedLeads // No search → use all sorted leads
      : fuse.search(query).map(({ item }) => item); // Search → filtered results
  
    // ✅ Re-sort search results to keep the latest activity on top
    updatedLeads.sort((a, b) => {
      const aLastEmail = emails.find(email => email.sender.toLowerCase() === a.bestEmail.toLowerCase());
      const bLastEmail = emails.find(email => email.sender.toLowerCase() === b.bestEmail.toLowerCase());
  
      return (bLastEmail ? new Date(bLastEmail.timestamp) : 0) - (aLastEmail ? new Date(aLastEmail.timestamp) : 0);
    });
  
    setFilteredLeads(updatedLeads);
  };
  

  // Handle lead selection
  const handleLeadClick = (lead) => {
    setActiveLead(lead);
    setFormData((prev) => ({ ...prev, to: lead.bestEmail || "" }));

    // Mark emails as read for this lead
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
          threadId: formDataReply.threadId,  // Include threadId
          attachments: attachment ? [attachment] : [], // Include attachment if available
        }),
      });
  
      const data = await res.json();
  
      if (res.ok) {
        alert("Reply sent successfully!");
        setFormDataReply({ messageId: "", text: "", threadId: "" }); // Reset reply form
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

  const handleViewAttachment = (attachment, type) => {
    try {
      const blobUrl = type === "received" && attachment.contentUrl
        ? attachment.contentUrl
        : URL.createObjectURL(new Blob(
            [Uint8Array.from(atob(attachment.contentBytes), c => c.charCodeAt(0))], 
            { type: attachment.mimeType }
          ));

      if (blobUrl) setSelectedAttachment({ ...attachment, blobUrl });
    } catch (error) {
      console.error("Error opening attachment:", error);
      alert("Error opening the attachment.");
    }
  };

  const handleDownloadAttachment = async (attachment) => {
    try {
      const blob = attachment.contentBytes
        ? new Blob([Uint8Array.from(atob(attachment.contentBytes), c => c.charCodeAt(0))], { type: attachment.mimeType })
        : await (await fetch(attachment.contentUrl)).blob();

      if (!blob?.size) throw new Error("Invalid blob received.");

      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = attachment.fileName;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error("Error downloading attachment:", error);
      alert("Error downloading the attachment.");
    }
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
                  <h2>Create New Email</h2>
                  <MdClose className="modal-close-icon" onClick={closeModal} />
                </div>

                <form className="email-form" onSubmit={handleSubmit}>
                  
                  {/* ✅ Updated Recipient Input with Suggestions */}
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
                <div key={lead._id} className={`inbox-body-list-container ${
                  activeLead?._id === lead._id ? "active" : ""
                  }`}
                  onClick={() => handleLeadClick(lead)}
                >
                  <div className="inbox-body-header">
                    <CgProfile className="inbox-body-header-icon" />
                    <p className="inbox-body-lead-type"> {lead.leadName || "Unknown Lead"}</p>
                    <p className="inbox-body-last-message-time">
                      {lastEmail ? formatRelativeTime(lastEmail.timestamp) : "No email"}
                    </p>
                  </div>
                  <p className="inbox-body-company-name">{lead.company}</p>
                  <div className="inbox-body-reply-preview-container">
                    <p className="inbox-body-reply-preview">
                      {lead.lastMessage ||
                        "No recent message Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ex tellus, maximus pharetra tellus ac, ultrices."}
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
                  disabled={currentSentPage === 1 || totalSentEmails === 0} // Disable if no emails
              >
                  <IoArrowBack />
              </button>

              <span className="email-pagination">
                  {totalSentEmails > 0 ? currentSentPage : 0} of {totalSentEmails > 0 ? Math.ceil(totalSentEmails / sentEmailsPerPage) : 0}
              </span>

              <button 
                  className="pagination-arrow" 
                  onClick={() => setCurrentSentPage((prev) => Math.min(prev + 1, Math.ceil(totalSentEmails / sentEmailsPerPage)))}
                  disabled={currentSentPage >= Math.ceil(totalSentEmails / sentEmailsPerPage) || totalSentEmails === 0} // Disable if no emails
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

        {/* Display Both Received & Sent Emails */}
        <div className="email-received-space">
            {emails.length > 0 || sentEmails.length > 0 ? (
                <>
                    {/* Display Received Emails */}
                    {emails.map((email, index) => (
                        <div key={index} className="email-received-message">
                            {/* Email Header */}
                            <div className="email-header-details">
                                {/* Profile Icon */}
                                <div 
                                    className="email-user-icon"
                                    style={{
                                        backgroundColor: "#007bff", 
                                        color: "#fff",
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
                                    {getInitials(email.sender)}
                                </div>

                                {/* Sender Name & Email */}
                                <div className="email-header-info">
                                    <p className="email-sender-name">{email.senderName || "Unknown Sender"}</p>
                                    <p className="email-sender-email">{email.sender}</p>
                                </div>

                                {/* Timestamp */}
                                <p className="email-timestamp">
                                    {email.timestamp
                                        ? new Date(email.timestamp).toLocaleDateString("en-US", {
                                            month: "long",
                                            day: "numeric",
                                            year: "numeric",
                                          }) +
                                          " - " +
                                          new Date(email.timestamp).toLocaleTimeString("en-US", {
                                            hour: "numeric",
                                            minute: "numeric",
                                            hour12: true,
                                          })
                                        : "No Timestamp Available"}
                                </p>
                            </div>

                            {/* Email Subject */}
                            <p className="email-subject-display">{email.subject || "No Subject"}</p>

                            {/* Email Body */}
                            <div className="email-body-container">
                                <p className="email-body-display">{email.message || "No Content"}</p>
                            </div>

                            {/* Attachments Section */}
                            {email.attachments && email.attachments.length > 0 && (
                                <div className="email-attachments-container">
                                    <p className="attachments-header">Attachments:</p>
                                    <div className="attachments-list">
                                        {email.attachments.map((attachment, index) => (
                                            <div key={index} className="attachment-item">
                                                {/* File Icon */}
                                                {getFileIcon(attachment.mimeType)}

                                                <div className="attachment-details">
                                                    <p className="attachment-name">{attachment.fileName}</p>

                                                    {/* View & Download Actions */}
                                                    <div className="attachment-actions">
                                                        <button className="view-link" onClick={() => handleViewAttachment(attachment, "received")}>
                                                            View
                                                        </button>

                                                        <span className="separator">|</span>

                                                        <button className="download-link" onClick={() => handleDownloadAttachment(attachment)}>
                                                            Download
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}

                    {/* Display Sent Emails */}
                    {sentEmails.map((email, index) => (
                        <div key={index} className="email-received-message">
                            {/* Email Header */}
                            <div className="email-header-details">
                                {/* Profile Icon */}
                                <div 
                                    className="email-user-icon"
                                    style={{
                                        backgroundColor: "#28a745", // Green for Sent Emails
                                        color: "#fff",
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
                                    {getInitials(companyDisplayName)}
                                </div>

                                {/* Recipient Name & Email */}
                                <div className="email-header-info">
                                    <p className="email-sender-name">{companyDisplayName}</p>
                                    <p className="email-sender-email">{email.recipient}</p>
                                </div>

                                {/* Timestamp */}
                                <p className="email-timestamp">
                                    {email.sentAt
                                        ? new Date(email.sentAt).toLocaleDateString("en-US", {
                                            month: "long",
                                            day: "numeric",
                                            year: "numeric",
                                          }) +
                                          " - " +
                                          new Date(email.sentAt).toLocaleTimeString("en-US", {
                                            hour: "numeric",
                                            minute: "numeric",
                                            hour12: true,
                                          })
                                        : "No Timestamp Available"}
                                </p>
                            </div>

                            {/* Email Subject */}
                            <p className="email-subject-display">{email.subject || "No Subject"}</p>

                            {/* Email Body */}
                            <div className="email-body-container">
                                <p className="email-body-display">{email.content || "No Content"}</p>
                            </div>

                            {/* Attachments Section */}
                            {email.attachments && email.attachments.length > 0 && (
                                <div className="email-attachments-container">
                                    <p className="attachments-header">Attachments:</p>
                                    <div className="attachments-list">
                                        {email.attachments.map((attachment, index) => (
                                            <div key={index} className="attachment-item">
                                                {/* File Icon */}
                                                {getFileIcon(attachment.mimeType)}

                                                <div className="attachment-details">
                                                    <p className="attachment-name">{attachment.fileName}</p>

                                                    {/* View & Download Actions */}
                                                    <div className="attachment-actions">
                                                        <button className="view-link" onClick={() => handleViewAttachment(attachment, email.messageId ? "received" : "sent")}>
                                                            View
                                                        </button>

                                                        <span className="separator">|</span>

                                                        <button className="download-link" onClick={() => handleDownloadAttachment(attachment)}>
                                                            Download
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {selectedAttachment && (
                                <div className="attachment-modal" onClick={handleCloseModal}>
                                    <div className="attachment-modal-content" onClick={(e) => e.stopPropagation()}>
                                        <div className="attachment-modal-header">
                                            <p className="attachment-filename">{selectedAttachment.fileName}</p>
                                            <span className="close-icon" onClick={handleCloseModal}>x</span>
                                        </div>

                                        {/* File Preview */}
                                        {selectedAttachment.mimeType.includes("image") ? (
                                            <img src={selectedAttachment.blobUrl} alt="Preview" className="attachment-preview" />
                                        ) : selectedAttachment.mimeType === "application/pdf" ? (
                                            <iframe
                                                src={selectedAttachment.blobUrl}
                                                title="Attachment Preview"
                                                className="attachment-preview"
                                            />
                                        ) : (
                                            <div className="no-preview">
                                                <p className="no-preview-text">No preview available</p>
                                                <a href={selectedAttachment.blobUrl} download={selectedAttachment.fileName}>
                                                    Download file
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                        </div>
                    ))}
                </>
            ) : (
                <p>No emails found</p>
            )}
        </div>


        <form className="email-compose-box" onSubmit={handleReplySubmit}>
          <div className="email-compose-header">
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
