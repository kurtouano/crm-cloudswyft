import useMicrosoftAuthentication from "../../utils/AuthMicrosoft.js";
import { useEffect, useState, useMemo, useCallback} from "react";
import { useLocation } from "react-router-dom";
import Fuse from "fuse.js"; // 🔍 Import Fuse.js
import { FiSearch, FiEdit } from "react-icons/fi";
import { FaStar,FaFilePdf, FaFileWord, FaFileExcel, FaFileImage, FaFileAlt } from "react-icons/fa";
import { CgProfile } from "react-icons/cg";
import { IoArrowBack, IoArrowForward, IoReturnUpBackOutline, IoChevronDownOutline, IoEllipsisVerticalOutline } from "react-icons/io5";
import { MdAttachFile, MdClose } from "react-icons/md";
import "./Communication.css";

export default function CommunicationPageNEW () {
  useMicrosoftAuthentication();
  localStorage.setItem("currentPage", "communications");
  // Basic states
  const location = useLocation();
  const companyDisplayName = "Cloudswyft";
  const companyEmail = "cloudswyft-test@outlook.com";
  const [leads, setLeads] = useState([]);
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [activeLead, setActiveLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [unreadCounts, setUnreadCounts] = useState({});

  // Auth & token

  // Emails & attachments
  const [emails, setEmails] = useState([]);
  const [sentEmails, setSentEmails] = useState([]); // Stores paginated sent emails
  const [fetchEmailError, setFetchEmailError] = useState(null);
  const [attachment, setAttachment] = useState(null);
  const [sortedLeads, setSortedLeads] = useState([]);
  const [attachmentsLoading, setAttachmentsLoading] = useState({});

  // Email Form states
  const [formData, setFormData] = useState({ to: "", subject: "", text: "" });
  const [formDataReply, setFormDataReply] = useState({ text: "", messageId: "", threadId: "" });
  const [selectedAttachment, setSelectedAttachment] = useState(null);

   // Modal
  const [modalOpen, setModalOpen] = useState(false); 

  // Emails & Paginations
  const [filteredEmails, setFilteredEmails] = useState([]);
  
  const sentEmailsPerPage = 10; // Display one email at a time
  const [bestEmails, setBestEmails] = useState([]); // Store all bestEmail values
  const [showSuggestions, setShowSuggestions] = useState(false);
  const emailsPerPage = 1; // Show one email per page
  const [currentPage, setCurrentPage] = useState(1);
  const [attachments, setAttachments] = useState({}); 
  const [replies, setReplies] = useState({});

  const allEmails = [ // Merge Received and Sent Emails
    ...filteredEmails.map(email => ({ ...email, type: "received" })), 
    ...sentEmails.map(email => ({ 
        ...email, 
        type: "sent", 
        timestamp: email.sentAt 
    }))
  ];

  // Sort Merged Emails by Timestamp
  allEmails.sort((a, b) => 
    new Date(b.timestamp || 0) - new Date(a.timestamp || 0) 
  );

  // Group Emails by Thread for Displaying in Pagination
  const groupEmailsByThread = (emails) => {
    const groupedThreads = new Map();
    const standaloneEmails = []; 

    emails.forEach(email => {
        if (email.threadId) {
            if (!groupedThreads.has(email.threadId)) {
                groupedThreads.set(email.threadId, []);
            }
            groupedThreads.get(email.threadId).push(email);
        } else {
            standaloneEmails.push(email); // Place Sent Emails into Separate Pages
        }
    });

  // Sort each thread by timestamp (oldest to newest)
  groupedThreads.forEach((thread, key) => {
      groupedThreads.set(key, thread.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)));
  });

    return { groupedThreads, standaloneEmails };
  };

  // Sort grouped threads by the newest mail in each thread
  const sortThreadsByLatestEmail = (groupedThreads) => { 
    return Array.from(groupedThreads.values()).sort((a, b) => {
        return new Date(b[0].timestamp) - new Date(a[0].timestamp); // Sort threads by newest email
    });
  };

  // Merge sorted threads and standalone emails for pagination
  const getPaginatedEmails = (sortedThreads, standaloneEmails, currentPage, emailsPerPage) => {
    const allThreads = [...sortedThreads, ...standaloneEmails.map(email => [email])]; // Treat standalone emails as mini-threads

    allThreads.sort((a, b) => new Date(b[0].timestamp) - new Date(a[0].timestamp));

    const totalPages = Math.ceil(allThreads.length / emailsPerPage);
    const startIndex = (currentPage - 1) * emailsPerPage;
    const displayedThreads = allThreads.slice(startIndex, startIndex + emailsPerPage);

    // Flatten for UI display
    const displayedEmails = displayedThreads.flat();

    return { displayedEmails, totalPages };
  };

  const { groupedThreads, standaloneEmails } = groupEmailsByThread(allEmails);
  const sortedThreads = sortThreadsByLatestEmail(groupedThreads);
  const { displayedEmails, totalPages } = getPaginatedEmails(sortedThreads, standaloneEmails, currentPage, emailsPerPage);

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const response = await fetch("http://localhost:4000/api/leads");
        if (!response.ok) throw new Error("Failed to fetch leads");
  
        const data = await response.json();
        setLeads(data);
        setFilteredLeads(data);

          // ✅ Extract lead email from URL
          const params = new URLSearchParams(location.search);
          const leadEmail = params.get("leadEmail");

           // ✅ Find and set active lead
          const matchedLead = data.find((lead) => lead.bestEmail === leadEmail);
          if (matchedLead) {
            setActiveLead(matchedLead);
          }
  
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
  }, [location.search]); 

  const fetchSentEmails = useCallback(async () => {
    if (!activeLead?.bestEmail) return;
  
    setSentEmails([]); 
    let allSentEmails = [];
    let page = 1;
    let totalEmailsFetched = 0;
    let totalEmailsToFetch = Infinity;
  
    try {
        while (totalEmailsFetched < totalEmailsToFetch) {
            const response = await fetch(
                `http://localhost:4000/api/emails/sent?to=${activeLead.bestEmail}&page=${page}&limit=${sentEmailsPerPage}`
            );
            const data = await response.json();
  
            if (response.ok && data.emails.length > 0) {
                allSentEmails = [...allSentEmails, ...data.emails];
                totalEmailsFetched += data.emails.length;
                totalEmailsToFetch = data.totalEmails;
                page++;
            } else {
                break;
            }
        }
  
        // ✅ Update UI with latest sent emails
        setSentEmails(allSentEmails);
  
    } catch (error) {
        console.error("Error fetching sent emails:", error);
        setSentEmails([]);
    }
  }, [activeLead]); // ✅ Only re-run when `activeLead` changes

  useEffect(() => {
    fetchSentEmails();
  }, [fetchSentEmails]);

  useEffect(() => {
      const fetchAttachments = async () => {
          if (!sentEmails.length) return;

          const attachmentsData = {};
          const loadingState = {};

          try {
              await Promise.all(
                  sentEmails.map(async (email) => {
                      loadingState[email._id] = true; // ✅ Mark email as loading
                      setAttachmentsLoading((prev) => ({ ...prev, ...loadingState }));

                      // Check if attachments are already in localStorage
                      const storedAttachments = localStorage.getItem(`attachments_${email._id}`);
                      if (storedAttachments) {
                          attachmentsData[email._id] = JSON.parse(storedAttachments);
                      } else {
                          try {
                              const response = await fetch(
                                  `http://localhost:4000/api/emails/attachments/${email._id}`
                              );
                              const data = await response.json();

                              if (response.ok) {
                                  attachmentsData[email._id] = data.attachments;
                                  // Store attachments in localStorage
                                  localStorage.setItem(`attachments_${email._id}`, JSON.stringify(data.attachments));
                              } else {
                                  attachmentsData[email._id] = [];
                              }
                          } catch (err) {
                              console.error(`Failed to fetch attachments for email ID ${email._id}`, err);
                              attachmentsData[email._id] = [];
                          }
                      }
                  })
              );

              setAttachments((prevAttachments) => ({
                  ...prevAttachments,
                  ...attachmentsData,
              }));
          } catch (error) {
              console.error("Error fetching email attachments:", error);
          } finally {
              setAttachmentsLoading((prev) =>
                  Object.keys(prev).reduce((acc, key) => ({ ...acc, [key]: false }), {})
              );
          }
      };

      fetchAttachments();
  }, [sentEmails]);

  const fetchReplyEmails = async (threadId) => {
      try {
          const response = await fetch(`http://localhost:4000/api/emails/fetch-reply-emails?threadId=${threadId}`);
          const data = await response.json();

          if (response.ok) {
              // Fetch attachments for each reply
              const repliesWithAttachments = await Promise.all(
                  data.replies.map(async (reply) => {
                      // Check if attachments are already in localStorage
                      const storedAttachments = localStorage.getItem(`attachments_${reply._id}`);
                      if (storedAttachments) {
                          return {
                              ...reply,
                              attachments: JSON.parse(storedAttachments), // Use stored attachments
                          };
                      }

                      // Fetch attachments from the backend
                      const attachmentsResponse = await fetch(
                          `http://localhost:4000/api/emails/attachments/reply/${reply._id}`
                      );

                      if (!attachmentsResponse.ok) {
                          console.error(`📎 Attachments for reply ${reply._id}:`, attachmentsResponse.statusText);
                          return {
                              ...reply,
                              attachments: [], // Return an empty array if attachments fail to fetch
                          };
                      }

                      const attachmentsData = await attachmentsResponse.json();
                      const attachments = attachmentsData.attachments || [];

                      // Save attachments to localStorage
                      localStorage.setItem(`attachments_${reply._id}`, JSON.stringify(attachments));

                      return {
                          ...reply,
                          attachments, // Add attachments to the reply
                      };
                  })
              );

              // Update the replies state with attachments
              setReplies((prevReplies) => ({
                  ...prevReplies,
                  [threadId]: repliesWithAttachments,
              }));
          } else {
              console.error("Failed to fetch replies:", data.error);
          }
      } catch (error) {
          console.error("Error fetching replies:", error);
      }
  };

  useEffect(() => {
    if (formDataReply.threadId) {
      fetchReplyEmails(formDataReply.threadId);
    }
  }, [formDataReply.threadId]);

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

        const threadIds = [...new Set(data.emails.map(email => email.threadId).filter(Boolean))];
        threadIds.forEach(threadId => fetchReplyEmails(threadId));

          // Calculate unread email count per lead
          const counts = data.emails.reduce((acc, email) => {
            if (!email.read) {
              acc[email.sender] = (acc[email.sender] || 0) + 1;
            }
            return acc;
          }, {});

          setUnreadCounts(counts);
        } else {
          setEmails([]);
          throw new Error(data.error || "Failed to fetch emails.");
        }
      } catch (err) {
        console.error("Fetch Emails Error:", err.message);
        setFetchEmailError(err.message);
      }
    };

    fetchEmails();
    const interval = setInterval(fetchEmails, 12000); // Auto-fetch every 15 seconds
    return () => clearInterval(interval);
  }, []);

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

  useEffect(() => {  
    // Automatically gets the messageId and threadID of the latest email 
    if (displayedEmails.length > 0) {
        setFormDataReply((prev) => {
            const lastIndex = displayedEmails.length - 1;
            const newMessageId = displayedEmails[lastIndex].messageId; // Get last email on current page
            const newThreadId = displayedEmails[lastIndex]?.threadId || "";
            if (prev.messageId !== newMessageId || prev.threadId !== newThreadId) {
                return {
                    ...prev,
                    messageId: newMessageId, // Set latest email on current page
                    threadId: newThreadId,
                };
            }
            return prev;
        });
    } else {
        console.log("No messageId found for current email");
    }
  }, [displayedEmails, currentPage]); // Depend on displayedEmails and currentPage
  
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
  
  const handleLeadClick = (lead) => {
      // ✅ If clicking the same lead, force refetch
      if (activeLead?._id === lead._id) {
          setActiveLead(null); // Temporarily reset activeLead
          setTimeout(() => setActiveLead(lead), 0); // Reassign after a short delay
      } else {
          setActiveLead(lead);
      }

      setSentEmails([]); // ✅ Clear sent emails immediately
      setFilteredEmails([]); // ✅ Clear received emails immediately
      setCurrentPage(1); // ✅ Reset pagination
      setAttachments({}); // ✅ Clear attachments when switching leads
      setFormData((prev) => ({ ...prev, to: lead.bestEmail}));
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

        closeModal(); // Close modal after sending
        fetchSentEmails();
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

        // Append the reply to the specific email's replies
        setReplies((prevReplies) => ({
          ...prevReplies,
          [formDataReply.messageId]: [
            ...(prevReplies[formDataReply.messageId] || []),
            { content: formDataReply.text, timestamp: new Date().toISOString() },
          ],
        }));
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
          </div>

          {/* Pagination Controls */}
          <div className="email-pagination-container">
              <button 
                  className="pagination-arrow" 
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1 || allEmails.length === 0 || totalPages === 0}
              >
                  <IoArrowBack />
              </button>

              <span className="email-pagination">
                  {allEmails.length > 0 ? currentPage : 0} of {allEmails.length > 0 ? totalPages : 0}
              </span>

              <button 
                  className="pagination-arrow" 
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage >= totalPages || allEmails.length === 0 || totalPages === 0} 
              >
                  <IoArrowForward />
              </button>
          </div>

          {/* Right Side Icons */}
          <div className="email-header-right">
              <IoEllipsisVerticalOutline className="email-nav-icon" />
          </div>
        </div>

          {/* Display Both Received & Sent Emails */}
          <div className="email-received-space">
              {displayedEmails.map((email, emailIndex) => (
              <div key={emailIndex} className={`email-message ${email.type}`}>
                  {/* Email Header */}
                  <div className="email-header-details">
                      {/* Profile Icon */}
                      <div className={`email-user-icon ${email.type === "received" ? "received" : "sent"}`}>
                          {email.type === "received" ? getInitials(email.sender) : getInitials(companyDisplayName)}
                      </div>
      
                      {/* Sender/Recipient Details */}
                      <div className="email-header-info">
                          <p className="email-sender-name">
                              {email.type === "received" ? email.senderName || "Unknown Sender" : companyDisplayName}
                          </p>
                          <p className="email-sender-email">
                              {email.type === "received" ? email.sender : email.recipient}
                          </p>
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
                      <p className="email-body-display">{email.message || email.content || "No Content"}</p>
                  </div>
      
                  {/* Attachments Section */}
                  {attachments[email._id] && attachments[email._id].length > 0 && (
                      <div className="email-attachments-container">
                          <p className="attachments-header">Attachments:</p>
                          <div className="attachments-list">
                              {attachments[email._id].map((attachment, index) => (
                                  <div key={index} className="attachment-item">
                                      {/* File Icon */}
                                      {getFileIcon(attachment.mimeType)}
      
                                      <div className="attachment-details">
                                          <p className="attachment-name">{attachment.fileName}</p>
      
                                          {/* View & Download Actions */}
                                          <div className="attachment-actions">
                                              <button className="view-link" onClick={() => handleViewAttachment(attachment, email.type)}>
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
      
                  <div className="email-divider-line"></div>
      
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

                  {email.messageId && replies[email.threadId]?.length > 0 && (
                  replies[email.threadId]
                    .filter((reply) => reply.originalMessageId === email.messageId) // Ensure reply belongs to this email
                    .sort((a, b) => new Date(a.repliedAt) - new Date(b.repliedAt))
                    .map((reply, index) => (
                      <div key={index} className="email-replies-container">
                        {/* Reply Header */}
                        <div className="email-header-details">
                          <div className="email-user-icon sent">
                            {getInitials(companyDisplayName)}
                          </div>

                          <div className="email-header-info">
                            <p className="email-sender-name">{companyDisplayName}</p>
                            <p className="email-sender-email">{companyEmail}</p>
                          </div>

                          {/* Timestamp */}
                          <p className="email-timestamp">
                            {reply.repliedAt
                              ? new Date(reply.repliedAt).toLocaleDateString("en-US", {
                                  month: "long",
                                  day: "numeric",
                                  year: "numeric",
                                }) +
                                " - " +
                                new Date(reply.repliedAt).toLocaleTimeString("en-US", {
                                  hour: "numeric",
                                  minute: "numeric",
                                  hour12: true,
                                })
                              : "No Timestamp Available"}
                          </p>
                        </div>

                        {/* Reply Content */}
                        <div className="email-body-container">
                          <p className="email-body-display">{reply.replyContent || "No Content"}</p>
                        </div>

                        {/* Attachments Section for Replies */}
                        {reply.attachments && reply.attachments.length > 0 && (
                          <div className="email-attachments-container">
                            <p className="attachments-header">Attachments:</p>
                            <div className="attachments-list">
                              {reply.attachments.map((attachment, index) => (
                                <div key={index} className="attachment-item">
                                  {/* File Icon */}
                                  {getFileIcon(attachment.mimeType)}

                                  <div className="attachment-details">
                                    <p className="attachment-name">{attachment.fileName}</p>

                                    {/* View & Download Actions */}
                                    <div className="attachment-actions">
                                      <button
                                        className="view-link"
                                        onClick={() => handleViewAttachment(attachment, "reply")}
                                      >
                                        View
                                      </button>

                                      <span className="separator">|</span>

                                      <button
                                        className="download-link"
                                        onClick={() => handleDownloadAttachment(attachment)}
                                      >
                                        Download
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="email-divider-line"></div>
                      </div>
                    ))
                )}
              </div>
          ))}
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


