import axios from "axios"; // ✅ Make sure this is imported
import { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import io from "socket.io-client";
import "./styles.css";
import { FiGrid, FiCheckSquare, FiUsers, FiBookOpen, FiLogOut } from "react-icons/fi";  // Sidenav Icons
import { LuMailQuestion, LuMailSearch } from "react-icons/lu";
import notifSound from '../../assets/Sounds/notif-sound.mp3' 

const socket = io("http://localhost:4000"); // ✅ Connect to backend WebSocket server

const navItems = [
    { path: "/dashboard", name: "Dashboard", icon: <FiGrid className="nav-react-icons"/>},
    { path: "/sales-flow", name: "Sales Flow", icon: <FiCheckSquare className="nav-react-icons"/> },
    { path: "/sales-team", name: "Sales Team", icon: <FiUsers className="nav-react-icons"/> },
    { path: "/accounts", name: "Accounts", icon: <FiBookOpen className="nav-react-icons"/> },
    { path: "/communications", name: "Revenue Comms", icon: <LuMailSearch className="nav-react-icons"/> },
    { path: "/customer-support", name: "Customer Support", icon: <LuMailQuestion className="nav-react-icons"/> },
];

const Sidenav = () => {
    const navigate = useNavigate();
    const [showDropdown, setShowDropdown] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const unreadCount = notifications.filter((notif) => !notif.viewed).length;
    const [optionsVisible, setOptionsVisible] = useState({});

    const audioRef = useRef(null);

    useEffect(() => {
        audioRef.current = new Audio(notifSound);
        audioRef.current.volume = 0.7; // Set volume to 30%
    }, []);

    const formatTimeAgo = (timestamp) => {
        const date = new Date(timestamp);
        if (isNaN(date)) return "Just now"; // fallback
    
        const now = new Date();
        const diff = now - date;
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const weeks = Math.floor(diff / (1000 * 60 * 60 * 24 * 7));
        const months = Math.floor(diff / (1000 * 60 * 60 * 24 * 30));
        const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365));
    
        if (seconds < 60) return `${seconds}s ago`;   // 👈 show seconds!
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        if (weeks < 4) return `${weeks}w ago`;
        if (months < 12) return `${months}mo ago`;
        return `${years}y ago`;
    };
    
    useEffect(() => {
        const fetchStoredNotifications = async () => {
            try {
                const { data } = await axios.get("http://localhost:4000/api/emails/notifications");
    
                if (data.success && data.notifications.length > 0) {
                    console.log(`✅ Loaded ${data.notifications.length} stored notifications.`);
                    
                    // ✅ Sort before setting state (latest first)
                    const sortedNotifications = data.notifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
                    setNotifications(sortedNotifications);
                } else {
                    console.warn("⚠️ No notifications found.");
                }
            } catch (error) {
                console.error("❌ Error fetching stored notifications:", error);
            }
        };
    
        fetchStoredNotifications();
    }, []);
    

    // ✅ WebSocket - Add new notifications in real-time
    useEffect(() => {
        socket.on("newReplyNotification", (data) => {
            console.log("🔔 New real-time notification received:", data);

            if (audioRef.current) {
                audioRef.current.currentTime = 0; // Rewind to start
                audioRef.current.play().catch(e => console.log("Audio play failed:", e));
            }
            
            setNotifications((prev) => {
                const updatedNotifications = [data, ...prev];
    
                // ✅ Ensure sorting in real-time updates
                return updatedNotifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            });
        });
    
        return () => {
            socket.off("newReplyNotification");
        };
    }, []);
    

    const toggleDropdown = () => setShowDropdown(!showDropdown);

    const handleNotificationClick = async (notifIndex, leadEmail, threadId, emailType) => {
        try {
            await axios.post("http://localhost:4000/api/emails/notifications/viewed", { threadId });
    
            // Update local state so that color changes immediately
            setNotifications((prev) =>
                prev.map((notif, idx) =>
                    idx === notifIndex ? { ...notif, viewed: true } : notif
                )
            );

            console.log(emailType);
    
            // Navigate to different routes based on emailType
            if (emailType === 'revenue') {
                navigate(`/communications?leadEmail=${leadEmail}&threadId=${threadId}`);
            } else if (emailType === 'after-sales') {
                navigate(`/customer-support?leadEmail=${leadEmail}&threadId=${threadId}`);
            }
        } catch (error) {
            console.error("❌ Failed to mark notification as viewed:", error);
        }
    };
    
    const toggleOptions = (index) => {
        setOptionsVisible((prev) => ({
          ...prev,
          [index]: !prev[index]
        }));
      };

      const handleDeleteNotification = async (notifIndex, threadId) => {
        try {
          await axios.post("http://localhost:4000/api/emails/notifications/delete", { threadId });
      
          setNotifications((prev) => prev.filter((_, idx) => idx !== notifIndex));
      
          // Optional: Add toast/snackbar alert: "Notification deleted. Undo"
          // You can use Material UI Snackbar, or react-toastify here if you’d like.
        } catch (error) {
          console.error("❌ Error deleting notification on backend:", error);
        }
      };
      
      

    const handleLogout = () => {
        localStorage.removeItem("token"); // Remove CRM JWT Token
        localStorage.removeItem("role");  // Remove User Role
        localStorage.removeItem("microsoftAccessToken"); // Remove Microsoft Token
        localStorage.removeItem("tokenExpiry"); // Remove Token Expiry Time
        localStorage.removeItem("microsoftAccessTokenAfterSales"); // Remove Microsoft Token
        localStorage.removeItem("tokenExpiryAfterSales"); // Remove Token Expiry Time
    
        window.location.href = "/"; // ✅ Force page reload to remove sidebar
    };
    

    return (
        <>
              <div className="notification-container">
                <div className="notification-icon" onClick={toggleDropdown}>
                    <svg className="bell-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
                        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                    </svg>
                    {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
                </div>

                {showDropdown && (
                    <div className="notif-dropdown">
                        {notifications.length > 0 ? (
                            notifications.map((notif, index) => (
                                <div 
                                  key={index} 
                                  className={`notif-item ${notif.viewed ? "read" : "unread"}`}
                                >
                                  <div
                                    onClick={() => handleNotificationClick(index, notif.leadEmail, notif.threadId, notif.emailType)}
                                    style={{ cursor: 'pointer' }}
                                  >
                                    <div>{notif.message}</div>
                                    <div className="notif-time">{formatTimeAgo(notif.timestamp)}</div>
                                  </div>
                              
                                  <div
                                    className="notif-options-icon"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleOptions(index);
                                    }}
                                    style={{ color: notif.viewed ? '#555' : '#fff' }}
                                  >
                                    &#x22EE;
                                  </div>
                              
                                  {optionsVisible[index] && (
                                    <div className="notif-option-menu">
                                        <div 
                                            className="notif-option-item" 
                                            onClick={() => handleDeleteNotification(index, notif.threadId)}
                                            >
                                            Delete this notification
                                        </div>
                                    </div>
                                  )}
                                </div>
                              ))
                                                            
                        ) : (
                            <div className="notif-empty">No new notifications</div>
                        )}
                    </div>
                )}
            </div>

            <div className="sidenav">
                <div className="logo-container">
                    <img src="/src/assets/Cloudswyft.png" alt="Cloudswyft Logo" className="logo" />
                    <span className="logo-text">Cloudswyft</span>
                </div>
                <div className="nav-links">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                        >
                            {typeof item.icon === "string" ? (
                                <img src={item.icon} alt={item.name} className="nav-react-icons" />
                            ) : (
                                <div className="nav-icon">{item.icon}</div>
                            )}
                            {item.name}
                        </NavLink>
                    ))}
                    <div className="nav-link logout-link" onClick={handleLogout}>
                      <FiLogOut className="nav-react-icons logout-icon" />
                      Logout
                    </div>

                </div>
            </div>
        </>
    );
};

export default Sidenav;
