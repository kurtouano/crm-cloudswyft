import axios from "axios"; // ✅ Make sure this is imported
import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import io from "socket.io-client";
import "./styles.css";
import { FiGrid, FiCheckSquare, FiUsers, FiBookOpen, FiMail, FiLogOut } from "react-icons/fi";  // Sidenav Icons

const socket = io("http://localhost:4000"); // ✅ Connect to backend WebSocket server

const navItems = [
    { path: "/dashboard", name: "Dashboard", icon: <FiGrid className="nav-react-icons"/>},
    { path: "/sales-flow", name: "Sales Flow", icon: <FiCheckSquare className="nav-react-icons"/> },
    { path: "/employees", name: "Sales Team", icon: <FiUsers className="nav-react-icons"/> },
    { path: "/accounts", name: "Accounts", icon: <FiBookOpen className="nav-react-icons"/> },
    { path: "/communications", name: "Communications", icon: <FiMail className="nav-react-icons"/> },
];

const Sidenav = () => {
    const navigate = useNavigate();
    const [showDropdown, setShowDropdown] = useState(false);
    const [notifications, setNotifications] = useState([]);

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

    const handleNotificationClick = (notifIndex, leadEmail, threadId) => {
        setNotifications((prev) =>
            prev.map((notif, idx) => idx === notifIndex ? { ...notif, read: true } : notif)
        );

        navigate(`/communications?leadEmail=${leadEmail}&threadId=${threadId}`);
    };


    const handleLogout = () => {
        localStorage.removeItem("token"); // Remove CRM JWT Token
        localStorage.removeItem("role");  // Remove User Role
        //localStorage.removeItem("microsoftAccessToken"); // Remove Microsoft Token
        //localStorage.removeItem("tokenExpiry"); // Remove Token Expiry Time
    
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
                    {notifications.length > 0 && <span className="notif-badge">{notifications.length}</span>}
                </div>

                {showDropdown && (
                    <div className="notif-dropdown">
                        {notifications.length > 0 ? (
                            notifications.map((notif, index) => (
                                <div 
                                    key={index} 
                                    className={`notif-item ${notif.read ? "read" : "unread"}`} 
                                    onClick={() => handleNotificationClick(index, notif.leadEmail, notif.threadId)}
                                >
                                    {notif.message}
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
