import { useEffect, useState, useMemo} from "react";
import Fuse from "fuse.js"; // 🔍 Import Fuse.js
import { FiSearch, FiEdit } from "react-icons/fi";
import { FaStar } from "react-icons/fa";
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
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedAttachment, setSelectedAttachment] = useState(null);

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

            console.log("Fetched Email Token from localStorage:", token); // Debugging log

            if (!token) {
                throw new Error("Access token is missing from localStorage.");
            }

            const response = await fetch("http://localhost:4000/api/emails/received", {
              method: "GET",
              headers: {
                  "Authorization": `Bearer ${token}`,  // Ensure "Bearer " is added
                  "Content-Type": "application/json"
              }
          });

            console.log("Response Status:", response.status); // Debugging log

            const data = await response.json();
            console.log("Response Data:", data); // Debugging log

            if (response.ok) {
                setEmails(data.emails);
            } else {
                throw new Error(data.error || "Failed to fetch emails.");
            }
        } catch (err) {
            console.error("Fetch Emails Error:", err.message); // Debugging log
            setFetchEmailError(err.message);
        } finally {
            receiveSetLoading(false);
        }
    };

      fetchEmails();
      const interval = setInterval(fetchEmails, 10000);  // Set interval to fetch emails every 5 seconds (TO BE CHANGED INTO)
      return () => clearInterval(interval); // Cleanup when component unmounts
  }, []);

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

  const handleSubmit = async (e) => {
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
          <span className="email-pagination">1 of 200</span>

          {/* Right Side Icons */}
          <div className="email-header-right">
            <IoArrowForward className="email-nav-icon circle-icon" />
            <IoExpandOutline className="email-nav-icon" />
            <IoEllipsisVerticalOutline className="email-nav-icon" />
          </div>
        </div>

        {/* Display received emails */}
        <div className="email-received-space">
          {activeLead &&
            emails
              .filter(
                (email) =>
                  email.sender.toLowerCase() === activeLead.bestEmail.toLowerCase()
              )
              .map((email, index) => {
                return (
                  <div key={index} className="email-received-message">
                    <p>
                      <strong>From:</strong> {email.sender}
                    </p>
                    <p>
                      <strong>Subject:</strong> {email.subject}
                    </p>
                    <p>
                    <strong>Body:</strong> {email.message}
                    </p>

                    {/* Display attachments */}
                    {email.attachments && email.attachments.length > 0 && (
                      <div className="email-attachments">
                        <p>
                          <strong>Attachments:</strong>
                        </p>
                        {email.attachments.map((attachment, attIndex) => {
                          const isImage = attachment.mimeType.startsWith("image/");
                          const fileUrl = `data:${attachment.mimeType};base64,${attachment.contentUrl}`;
                          return (
                            <div key={attIndex} style={{ marginTop: "5px" }}>
                              {isImage ? (
                                <button
                                  onClick={() => setSelectedImage(fileUrl)}
                                  style={{
                                    display: "block",
                                    padding: "5px",
                                    border: "1px solid #ccc",
                                    background: "#f8f8f8",
                                    cursor: "pointer",
                                    textAlign: "left",
                                  }}
                                >
                                  {attachment.fileName}
                                </button>
                              ) : (
                                <button
                                  onClick={() =>
                                    setSelectedAttachment({
                                      fileUrl,
                                      attachment,
                                    })
                                  }
                                  style={{
                                    display: "block",
                                    padding: "5px",
                                    border: "1px solid #ccc",
                                    background: "#f8f8f8",
                                    cursor: "pointer",
                                    textAlign: "left",
                                  }}
                                >
                                  {attachment.fileName}
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}

          {/* Image Preview Modal */}
          {selectedImage && (
            <div className="email-img-modal" onClick={() => setSelectedImage(null)}>
              <img src={selectedImage} alt="Preview" style={{
                  maxWidth: "90%",
                  maxHeight: "90%",
                  borderRadius: "10px",
                }}
              />
            </div>
          )}

          {/* Attachment Preview Modal for non-image files */}
          {selectedAttachment && (
            <div className="email-attachment-modal" onClick={() => setSelectedAttachment(null)}>
              <div
                style={{
                  width: "90%",
                  height: "80%",
                  background: "#fff",
                }}
              >
                {selectedAttachment.attachment.mimeType === "application/pdf" ? (
                  <embed
                    src={selectedAttachment.fileUrl}
                    type="application/pdf"
                    width="100%"
                    height="100%"
                  />
                ) : (
                  <iframe
                    src={selectedAttachment.fileUrl}
                    style={{ width: "100%", height: "100%" }}
                    title="Attachment Preview"
                  />
                )}
              </div>
            </div>
          )}
        </div>

        <form className="email-compose-box" onSubmit={handleSubmit}>
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

          {/* Subject Input */}
          <input
            type="text"
            className="email-subject"
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            placeholder="Subject"
          />

          {/* Message Body */}
          <textarea
            name="text"
            className="email-body"
            value={formData.text}
              onChange={(e) => setFormData({ ...formData, text: e.target.value })}
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
