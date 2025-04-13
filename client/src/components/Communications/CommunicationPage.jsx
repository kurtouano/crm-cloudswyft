import useMicrosoftAuthentication from "../../utils/AuthMicrosoft.js";
import { useEffect, useState, useMemo, useCallback, useRef} from "react";
import { useLocation } from "react-router-dom";
import Fuse from "fuse.js"; // 🔍 Import Fuse.js
import { FiSearch, FiEdit, FiUser } from "react-icons/fi";
import { FaStar,FaFilePdf, FaFileWord, FaFileExcel, FaFileImage, FaFileAlt } from "react-icons/fa";
import { CgProfile } from "react-icons/cg";
import { IoArrowBack, IoArrowForward, IoEllipsisVerticalOutline } from "react-icons/io5";
import { MdAttachFile, MdClose} from "react-icons/md";
import TipTap from "../../utils/TextEditor.jsx";
import DOMPurify from 'dompurify';
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
  const [resetEditor, setResetEditor] = useState(false);

  // Email Form states
  const [formData, setFormData] = useState({ to: "",   cc: "", bcc: "", subject: "", text: "" });
  const [formDataReply, setFormDataReply] = useState({ text: "", messageId: "", threadId: "" });
  const [selectedAttachment, setSelectedAttachment] = useState(null);
  const [activeRecipientField, setActiveRecipientField] = useState('to');
  const [ccSuggestions, setCcSuggestions] = useState([]);
  const [bccSuggestions, setBccSuggestions] = useState([]);
  const [showCcSuggestions, setShowCcSuggestions] = useState(false);
  const [showBccSuggestions, setShowBccSuggestions] = useState(false);

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
  const temperatureUpdates = useRef(new Set());

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
        const response = await fetch("http://localhost:4000/api/leads/revenue-leads");
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
                `http://localhost:4000/api/emails/sent?to=${activeLead.bestEmail}&page=${page}&limit=${sentEmailsPerPage}&emailType=revenue`
            );
            const data = await response.json();
  
            if (response.ok && data.emails.length > 0) {
                // Filter emails where the lead is in to, cc, or bcc
                const relevantEmails = data.emails.filter(email => {
                    return (
                        email.to.includes(activeLead.bestEmail) ||
                        (email.cc && email.cc.includes(activeLead.bestEmail)) ||
                        (email.bcc && email.bcc.includes(activeLead.bestEmail))
                    );
                });
  
                allSentEmails = [...allSentEmails, ...relevantEmails];
                totalEmailsFetched += data.emails.length;
                totalEmailsToFetch = data.totalEmails;
                page++;
            } else {
                break;
            }
        }
  
        setSentEmails(allSentEmails);
    } catch (error) {
        console.error("Error fetching sent emails:", error);
        setSentEmails([]);
    }
  }, [activeLead]);

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

                      // Check if attachments are already in cache
                      const cachedAttachments = await getAttachments(email._id);

                      if (cachedAttachments) {
                           attachmentsData[email._id] = cachedAttachments;
                      } else {
                          try {
                              const response = await fetch(
                                  `http://localhost:4000/api/emails/attachments/${email._id}`
                              );
                              const data = await response.json();

                              if (response.ok) {
                                  attachmentsData[email._id] = data.attachments;
                                  // Store attachments in cache
                                  await storeAttachments(email._id, data.attachments);
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

              setAttachments((prev) => ({ ...prev, ...attachmentsData }));
              setAttachmentsLoading((prev) => 
                Object.keys(prev).reduce((acc, key) => ({ ...acc, [key]: false }), {})
              );
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
        const repliesWithAttachments = await Promise.all(
          data.replies.map(async (reply) => {
            // Check IndexedDB first
            const cachedAttachments = await getAttachments(reply._id);
            
            if (cachedAttachments) {
              return {
                ...reply,
                attachments: cachedAttachments
              };
            }
  
            // Fetch from backend if not cached
            const attachmentsResponse = await fetch(
              `http://localhost:4000/api/emails/attachments/reply/${reply._id}`
            );
  
            if (!attachmentsResponse.ok) {
              console.error(`Attachments fetch failed for reply ${reply._id}`);
              return {
                ...reply,
                attachments: []
              };
            }
  
            const attachmentsData = await attachmentsResponse.json();
            const attachments = attachmentsData.attachments || [];
  
            // Store in IndexedDB
            await storeAttachments(reply._id, attachments);
  
            return {
              ...reply,
              attachments
            };
          })
        );
  
        setReplies((prevReplies) => ({
          ...prevReplies,
          [threadId]: repliesWithAttachments,
        }));
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

          const emailsWithAttachments = data.emails.map(email => {
            if (email.attachments && email.attachments.length > 0) {
              setAttachments(prev => ({
                ...prev,
                [email._id]: email.attachments
              }));
            }
            return email;
          });

          setEmails(emailsWithAttachments);
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
        // Starred leads always come first
        if (a.starred && !b.starred) return -1;
        if (!a.starred && b.starred) return 1;
        
        // For leads with same star status, sort by last interaction
        const aLastEmail = emails.find(email => email.sender.toLowerCase() === a.bestEmail.toLowerCase());
        const bLastEmail = emails.find(email => email.sender.toLowerCase() === b.bestEmail.toLowerCase());
        
        return (bLastEmail ? new Date(bLastEmail.timestamp) : 0) - (aLastEmail ? new Date(aLastEmail.timestamp) : 0);
      });
    };
  
    if (leads.length > 0) {
      const sorted = sortLeads(leads);
      setSortedLeads(sorted);
      setFilteredLeads(sorted);
    }
  }, [leads, emails]);

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
      reader.onload = (event) => {
        const contentBytes = event.target.result.split(',')[1]; // Get base64 part
        setAttachment({
          fileName: file.name,
          mimeType: file.type,
          contentBytes: contentBytes,
        });
      };
      reader.readAsDataURL(file);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const microsoftAccessToken = localStorage.getItem("microsoftAccessToken");
    
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
          cc: formData.cc,  // Add this line
          bcc: formData.bcc,  // Add this line
          subject: formData.subject,
          content: formData.text,
          token: microsoftAccessToken,
          attachments: attachment ? [attachment] : [],
        }),
      });
  
      const data = await res.json();
  
      if (res.ok) {
        alert("Email sent successfully!");
        setFormData({ to: "", cc: "", bcc: "", subject: "", text: "" });
        setAttachment(null);
        setResetEditor(prev => !prev);
        closeModal();
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
      // Ensure attachments is always an array
      const attachments = attachment ? [attachment] : [];
      
      const res = await fetch("http://localhost:4000/api/emails/reply-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: formDataReply.text,
          token: microsoftAccessToken,
          messageId: formDataReply.messageId,
          threadId: formDataReply.threadId,
          attachments: attachments,
        }),
      });
  
      const data = await res.json();
  
      if (!res.ok) {
        throw new Error(data.error || "Failed to send reply");
      }
  
      alert("Reply sent successfully!");
      setFormDataReply({ messageId: "", text: "", threadId: "" });
      setAttachment(null);
      setResetEditor(prev => !prev);
  
      setReplies((prevReplies) => ({
        ...prevReplies,
        [formDataReply.messageId]: [
          ...(prevReplies[formDataReply.messageId] || []),
          { 
            content: formDataReply.text, 
            timestamp: new Date().toISOString() 
          },
        ],
      }));
    } catch (error) {
      console.error("Error sending reply:", error);
      alert(`Error sending reply: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to format timestamp
  const formatRelativeTime = (timestamp, leadId, leadCreatedAt, currentTemperature, isLoading) => {
    // Don't make any temperature changes while still loading
    if (isLoading) {
      return currentTemperature === 'cold' ? "Needs follow-up" : "Loading...";
    }
  
    // Handle null/undefined timestamp
    if (!timestamp) {
      const now = new Date();
      const createdDate = new Date(leadCreatedAt);
      const diffTime = now - createdDate;
      const daysSinceCreation = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
      if (daysSinceCreation >= 7) {
        if (currentTemperature !== 'cold') {
          updateLeadTemperature(leadId, "cold");
        }
        return `No response - ${daysSinceCreation} days`;
      }
      return `No response - ${daysSinceCreation} day${daysSinceCreation !== 1 ? 's' : ''}`;
    }
  
    const now = new Date();
    const messageDate = new Date(timestamp);
    const daysSinceLastMessage = Math.floor((now - messageDate) / (1000 * 60 * 60 * 24));
  
    if (daysSinceLastMessage < 7 && currentTemperature === 'cold') {
      updateLeadTemperature(leadId, "warm");
    }
    // Set to cold if no message in 7 days
    else if (daysSinceLastMessage >= 7) {
      if (currentTemperature !== 'cold') {
        updateLeadTemperature(leadId, "cold");
      }
      return `Needs follow-up`;
    }
    
    // Format relative time for recent messages
    const minutes = Math.floor((now - messageDate) / (1000 * 60));
    const hours = Math.floor((now - messageDate) / (1000 * 60 * 60));
  
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes} min${minutes > 1 ? "s" : ""} ago`;
    if (hours < 24) return `${hours} hr${hours > 1 ? "s" : ""} ago`;
    return `${daysSinceLastMessage} day${daysSinceLastMessage > 1 ? "s" : ""} ago`;
  };

  
  // Helper function to get last interaction timestamp
  const getLastInteractionTimestamp = (lead, emails) => {
    // Safeguard against undefined lead or missing bestEmail
    if (!lead || !lead.bestEmail) return null;
  
    // Get all received emails from this lead - ONLY THESE SHOULD COUNT FOR THE TIMESTAMP
    const receivedFromLead = emails.filter(
      email => email?.sender?.toLowerCase() === lead.bestEmail.toLowerCase()
    );
  
    // Sort just the received emails
    const sortedReceived = receivedFromLead.sort((a, b) => 
      new Date(b?.timestamp || 0) - new Date(a?.timestamp || 0)
    );
  
    // Return timestamp from most recent email from lead
    return sortedReceived[0]?.timestamp || null;
  };

  // Update the lead temperature in database
  const updateLeadTemperature = useCallback(async (leadId, temperature) => {
    // Skip if already updated or updating
    if (temperatureUpdates.current.has(leadId)) return;
  
    try {
      temperatureUpdates.current.add(leadId); // Mark as in-progress
      
      // Double check we have all data before updating
      if (!leads.length || !emails.length) {
        console.log('Waiting for data to load before updating temperature');
        return;
      }
  
      const response = await fetch(`http://localhost:4000/api/leads/updateLeadTemp/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ temperature })
      });
  
      if (!response.ok) {
        temperatureUpdates.current.delete(leadId); // Allow retry on failure
        const errorData = await response.json();
        throw new Error(errorData.error || 'Update failed');
      }
  
      return await response.json();
    } catch (error) {
      console.error('Update error:', error.message);
      throw error;
    }
  }, [leads, emails]); // Add dependencies

  const getLastMessagePreview = (lead, emails) => {
    // Filter emails for this lead
    const leadEmails = emails.filter(
      email => email.sender.toLowerCase() === lead.bestEmail.toLowerCase()
    );
  
    // Get the most recent email
    const lastEmail = leadEmails.reduce((latest, current) => {
      return (!latest || new Date(current.timestamp) > new Date(latest.timestamp))
        ? current
        : latest;
    }, null);
  
    // If no emails exist, return the default message or lead.lastMessage
    if (!lastEmail) {
      return lead.lastMessage || "No recent messages";
    }
  
    // Clean and truncate the message
    const cleanMessage = lastEmail.message
      .replace(/<[^>]+>/g, '') // Remove HTML tags
      .replace(/\n/g, ' ')      // Replace newlines with spaces
      .trim();
  
    // Truncate to 100 characters with ellipsis if needed
    return cleanMessage.length > 100 
      ? cleanMessage.substring(0, 100) + '...' 
      : cleanMessage;
  };

  const toggleStarLead = async (leadId, e) => {
    e.stopPropagation();
    
    // Get current starred status before toggling
    const currentLead = leads.find(lead => lead._id === leadId);
    const newStarredStatus = !currentLead?.starred;
  
    // Optimistically update all lead states
    const updateLeadStates = (newStatus) => {
      setLeads(prev => prev.map(lead => 
        lead._id === leadId ? { ...lead, starred: newStatus } : lead
      ));
      setFilteredLeads(prev => prev.map(lead =>
        lead._id === leadId ? { ...lead, starred: newStatus } : lead
      ));
      setSortedLeads(prev => prev.map(lead =>
        lead._id === leadId ? { ...lead, starred: newStatus } : lead
      ));
    };
  
    // Immediately update UI
    updateLeadStates(newStarredStatus);
  
    try {
      const response = await fetch(`http://localhost:4000/api/leads/toggleStar/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        // Revert if API fails
        updateLeadStates(!newStarredStatus);
        throw new Error('Failed to toggle star');
      }
  
      // After successful API call, trigger a re-sort
      setLeads(prev => [...prev]); // This will trigger the sorting useEffect
      setFilteredLeads(prev => [...prev]);
      
    } catch (error) {
      console.error("Error toggling star:", error);
    }
  };

  const initDB = () => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('EmailAttachmentsDB', 1);
  
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('attachments')) {
          const store = db.createObjectStore('attachments', { keyPath: 'emailId' });
          store.createIndex('cachedAt', 'cachedAt', { unique: false });
        }
      };
  
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  };
  
  const storeAttachments = async (emailId, attachments) => {
    const db = await initDB();
    const tx = db.transaction('attachments', 'readwrite');
    tx.objectStore('attachments').put({ 
      emailId, 
      attachments,
      cachedAt: Date.now() 
    });
    return tx.complete;
  };
  
  const getAttachments = async (emailId) => {
    const db = await initDB();
    return new Promise((resolve) => {
      const tx = db.transaction('attachments');
      const request = tx.objectStore('attachments').get(emailId);
      request.onsuccess = () => resolve(request.result?.attachments || null);
      request.onerror = () => resolve(null);
    });
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
  const { name, value } = e.target;
  setFormData(prev => ({ ...prev, [name]: value }));
  
  // Get the last email part being typed (after last comma)
  const lastEmailPart = value.split(',').pop().trim();
  
  if (lastEmailPart.length > 0) {
    const matches = bestEmails.filter(email =>
      email.toLowerCase().includes(lastEmailPart.toLowerCase()) &&
      !value.toLowerCase().includes(email.toLowerCase()) // Don't show already added emails
    );
    
    if (name === 'to') {
      setFilteredEmails(matches);
      setShowSuggestions(matches.length > 0);
    } else if (name === 'cc') {
      setCcSuggestions(matches);
      setShowCcSuggestions(matches.length > 0);
    } else if (name === 'bcc') {
      setBccSuggestions(matches);
      setShowBccSuggestions(matches.length > 0);
    }
  } else {
    // Hide suggestions if no text is being typed
    if (name === 'to') {
      setShowSuggestions(false);
    } else if (name === 'cc') {
      setShowCcSuggestions(false);
    } else if (name === 'bcc') {
      setShowBccSuggestions(false);
    }
  }
};

const handleSelectEmail = (email, fieldName) => {
  setFormData(prev => {
    const currentValue = prev[fieldName];
    
    // If the field is empty or we're just starting to type
    if (!currentValue || currentValue.endsWith(',')) {
      return { ...prev, [fieldName]: email };
    }
    
    // If we have existing emails, replace the last partial email
    const emails = currentValue.split(/[,;]\s*/).filter(e => e.trim());
    if (emails.length > 0) {
      // Replace the last (partial) email with the selected one
      emails[emails.length - 1] = email;
      return { 
        ...prev, 
        [fieldName]: emails.join(', ') 
      };
    }
    
    // Default case (shouldn't normally reach here)
    return { ...prev, [fieldName]: email };
  });

  // Hide suggestions
  if (fieldName === 'to') setShowSuggestions(false);
  if (fieldName === 'cc') setShowCcSuggestions(false);
  if (fieldName === 'bcc') setShowBccSuggestions(false);
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
                  <div className="recipient-field-container">
                      <input
                        type="email"
                        name="to"
                        className="email-input"
                        placeholder="To"
                        value={formData.to}
                        onChange={handleRecipientChange}
                        onFocus={() => {
                          setActiveRecipientField('to');
                          setFilteredEmails(bestEmails);
                          setShowSuggestions(true);
                        }}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                        required
                        autoComplete="off"
                        multiple
                      />
                      {showSuggestions && filteredEmails.length > 0 && (
                        <ul className="suggestions-dropdown">
                          {filteredEmails.map((email, index) => (
                            <li key={index} onClick={() => handleSelectEmail(email, 'to')}>
                              {email}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {/* CC Field */}
                    <div className="recipient-field-container">
                      <input
                        type="email"
                        name="cc"
                        className="email-input"
                        placeholder="CC"
                        value={formData.cc}
                        onChange={handleRecipientChange}
                        onFocus={() => {
                          setActiveRecipientField('cc');
                          setCcSuggestions(bestEmails);
                          setShowCcSuggestions(true);
                        }}
                        onBlur={() => setTimeout(() => setShowCcSuggestions(false), 200)}
                        autoComplete="off"
                        multiple
                      />
                      {showCcSuggestions && ccSuggestions.length > 0 && (
                        <ul className="suggestions-dropdown">
                          {ccSuggestions.map((email, index) => (
                            <li key={index} onClick={() => handleSelectEmail(email, 'cc')}>
                              {email}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {/* BCC Field */}
                    <div className="recipient-field-container">
                      <input
                        type="email"
                        name="bcc"
                        className="email-input"
                        placeholder="BCC"
                        value={formData.bcc}
                        onChange={handleRecipientChange}
                        onFocus={() => {
                          setActiveRecipientField('bcc');
                          setBccSuggestions(bestEmails);
                          setShowBccSuggestions(true);
                        }}
                        onBlur={() => setTimeout(() => setShowBccSuggestions(false), 200)}
                        autoComplete="off"
                        multiple
                      />
                      {showBccSuggestions && bccSuggestions.length > 0 && (
                        <ul className="suggestions-dropdown">
                          {bccSuggestions.map((email, index) => (
                            <li key={index} onClick={() => handleSelectEmail(email, 'bcc')}>
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

                    {/* Replace textarea with TipTap editor */}
                      <TipTap 
                        content={formData.text || ""}
                        onUpdate={(html) => setFormData(prev => ({ ...prev, text: html }))}
                        resetTrigger={resetEditor}
                        handleFileChange={handleFileChange}
                        editorId="create-email"
                        commsType="createEmail"
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
                            <p className="email-attach-preview-icon"> {getFileIcon(attachment.mimeType)} </p>
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
              const lastInteraction = getLastInteractionTimestamp(lead, emails, sentEmails);
              
              return (
                <div key={lead._id} className={`inbox-body-list-container ${activeLead?._id === lead._id ? "active" : ""}`}
                    onClick={() => handleLeadClick(lead)}
                >
                  <div className="inbox-body-header">
                    <CgProfile className="inbox-body-header-icon" />
                    <p className="inbox-body-lead-type"> {lead.leadName || "Unknown Lead"}</p>
                    <p className="inbox-body-last-message-time">
                        {formatRelativeTime(
                          lastInteraction, 
                          lead._id, 
                          lead.createdAt, 
                          lead.temperature,
                          loading // Pass the loading state
                        )}
                    </p>
                  </div>
                  <p className="inbox-body-company-name">{lead.company}</p>
                  <div className="inbox-body-reply-preview-container">
                    <p className="inbox-body-reply-preview">
                      {getLastMessagePreview(lead, emails) || "No recent message"}
                    </p>
                    <FaStar 
                      className={`inbox-body-reply-type-star ${lead.starred ? "starred-active" : ""}`}
                      onClick={(e) => toggleStarLead(lead._id, e)}
                    />
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
                              {email.type === "received" ? email.sender : companyEmail}
                          </p>

                            {email.cc && (<p className="email-cc-bcc-display">CC: {typeof email.cc === 'string' ? email.cc : JSON.stringify(email.cc)}</p>)}
                            {email.bcc && (<p className="email-cc-bcc-display">BCC: {typeof email.bcc === 'string' ? email.bcc : JSON.stringify(email.bcc)}</p>)}
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
                    <p className="email-body-display" dangerouslySetInnerHTML=
                        {{__html: DOMPurify.sanitize(email.message || email.content || "No Content") }}>
                    </p>
                  </div>
      
                  {/* Attachments Section */}
                  {(email.attachments || attachments[email._id] || []).length > 0 && (
                      <div className="email-attachments-container">
                        <p className="attachments-header">Attachments:</p>
                        <div className="attachments-list">
                          {(email.attachments || attachments[email._id]).map((attachment, index) => (
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
                          <p className="email-body-display" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(reply.replyContentHtml) }}></p>
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
            <span className="email-recipient-span"><FiUser /> </span>
              <input 
                className={`email-recipient ${formData.to ? "" : "empty"}`}
                type="email"
                name="to"
                value={formData.to}
                readOnly
              />
            </div>
            <div className="email-actions-icons">
            </div>
          </div>

          {/* Replace textarea with TipTap editor */}
          <TipTap 
            content={formDataReply.text || ""}
            onUpdate={(html) => setFormDataReply(prev => ({ ...prev, text: html }))}
            resetTrigger={resetEditor}
            handleFileChange={handleFileChange}
            editorId="reply-email"
            commsType="revenue"
          />

          {/* Send Button & Attachments */}
          <div className="email-actions">
            <button 
              className="send-button" 
              type="submit" 
              disabled={loading}
            >
              {loading ? "Sending..." : "Send"}
            </button>
            
            {attachment && (
              <div className="email-attach-preview">
              <p className="email-attach-preview-icon"> {getFileIcon(attachment.mimeType)} </p>
              <span className="attachment-name-send">{attachment.fileName} </span>
                <MdClose 
                  className="email-attach-remove-icon" 
                  onClick={() => setAttachment(null)} 
                />
              </div>
            )}
          </div>
        </form>
        
      </div>
    </div>
  );
}
