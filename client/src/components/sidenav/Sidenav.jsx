import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./styles.css";

const navItems = [
    { path: "/dashboard", name: "Dashboard", icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"  fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="dash-icon">
        <rect x="3" y="3" width="5" height="5" />
        <rect x="13" y="3" width="5" height="5" />
        <rect x="3" y="13" width="5" height="5" />
        <rect x="13" y="13" width="5" height="5" />
      </svg>
    )},
    { path: "/sales-flow", name: "Sales Flow", icon: "/src/assets/kanban.png" },
    { path: "/employees", name: "Sales Team", icon: "/src/assets/employee.png" },
    { path: "/accounts", name: "Accounts", icon: "/src/assets/accounts.png" },
    { path: "/communications", name: "Communications", icon: "/src/assets/communications.png" },
];

const Sidenav = () => {
    const [showDropdown, setShowDropdown] = useState(false);
    const [notifications, setNotifications] = useState([
        "New message from HR",
        "Your task is due tomorrow",
        "Meeting scheduled at 3 PM",
    ]);

    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token"); // Remove JWT Token
        localStorage.removeItem("role");  // Remove User Role
        navigate("/"); // Redirect to Login Page
    };

    const toggleDropdown = () => {
        setShowDropdown(!showDropdown);
    };

    return (
        <>
            <div className="notification-container">
                <div className="notification-icon" onClick={toggleDropdown}>
                    <svg
                        className="bell-icon"
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
                        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                    </svg>
                    {notifications.length > 0 && <span className="notif-badge">{notifications.length}</span>}
                </div>

                {showDropdown && (
                    <div className="notif-dropdown">
                        {notifications.length > 0 ? (
                            notifications.map((notif, index) => (
                                <div key={index} className="notif-item">
                                    {notif}
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
                                <img src={item.icon} alt={item.name} className="nav-icon" />
                            ) : (
                                <div className="nav-icon">{item.icon}</div>
                            )}
                            {item.name}
                        </NavLink>
                    ))}
                    <div className="nav-link logout-link" onClick={handleLogout}>
                      <img src="/src/assets/logout-icon.png" alt="Logout" className="nav-icon" />
                      Logout
                    </div>

                </div>
            </div>
        </>
    );
};

export default Sidenav;
