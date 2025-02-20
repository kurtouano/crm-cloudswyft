import { useState } from "react";
import ReactPaginate from "react-paginate";
import { useNavigate } from "react-router-dom";
import "./Accounts.css";

// Import icons
import usersIcon from "../../assets/users.png";
import clockIcon from "../../assets/clock.png";
import hourglassIcon from "../../assets/hourglass.png";
import highPriorityIcon from "../../assets/highpriority.png";
import searchIcon from "../../assets/search.png";
import arrowRightIcon from "../../assets/arrow-right.png";
import chatIcon from "../../assets/bubble-chat.png"; 
import userIcon from "../../assets/user-circle.png";

const cardData = [
  { title: "Total Number of Leads", value: "50", bgColor: "#2196F3", icon: usersIcon },
  { title: "Conversion Rate", value: "12.5%", bgColor: "#1BB9F4", icon: clockIcon },
  { title: "Recent Activity", value: "23 Interactions", bgColor: "#2196F3", icon: hourglassIcon },
  { title: "High Priority Leads", value: "8 Urgent", bgColor: "#307ADB", icon: highPriorityIcon },
];

const leads = [
  { name: "Ruben Korsgaard", company: "Cloudswyft", leadID: "FD-1467", joinDate: "2/4/2023", jobTitle: "Manager", industry: "Tech", location: "New York", email: "ruben@cloudswyft.com", phone: "123-456-7890", social: "@ruben" },
  { name: "Sarah Johnson", company: "InnovateX", leadID: "FD-1468", joinDate: "3/5/2023", jobTitle: "CEO", industry: "Finance", location: "San Francisco", email: "sarah@innovatex.com", phone: "987-654-3210", social: "@sarahjohnson" },
  { name: "David Lee", company: "TechWave", leadID: "FD-1469", joinDate: "4/6/2023", jobTitle: "CTO", industry: "Software", location: "Seattle", email: "david@techwave.com", phone: "111-222-3333", social: "@davidlee" },
  { name: "Emily Carter", company: "FinTech Global", leadID: "FD-1470", joinDate: "5/7/2023", jobTitle: "Financial Analyst", industry: "Finance", location: "Boston", email: "emily@fintechglobal.com", phone: "444-555-6666", social: "@emilycarter" },
  { name: "James Anderson", company: "HealthFirst", leadID: "FD-1471", joinDate: "6/8/2023", jobTitle: "Operations Manager", industry: "Healthcare", location: "Los Angeles", email: "james@healthfirst.com", phone: "777-888-9999", social: "@jamesanderson" },
  { name: "Sophia Martinez", company: "EduPrime", leadID: "FD-1472", joinDate: "7/9/2023", jobTitle: "Head of Marketing", industry: "Education", location: "Chicago", email: "sophia@eduprime.com", phone: "101-202-3030", social: "@sophiam" },
  { name: "Michael Brown", company: "BuildIt", leadID: "FD-1473", joinDate: "8/10/2023", jobTitle: "Engineer", industry: "Construction", location: "Houston", email: "michael@buildit.com", phone: "202-303-4040", social: "@michaelbrown" },
  { name: "Olivia Wilson", company: "RetailConnect", leadID: "FD-1474", joinDate: "9/11/2023", jobTitle: "Retail Manager", industry: "Retail", location: "Miami", email: "olivia@retailconnect.com", phone: "303-404-5050", social: "@oliviawilson" },
  { name: "Daniel Garcia", company: "GreenEnergy", leadID: "FD-1475", joinDate: "10/12/2023", jobTitle: "Project Lead", industry: "Renewable Energy", location: "San Diego", email: "daniel@greenenergy.com", phone: "404-505-6060", social: "@danielgarcia" },
  { name: "Emma Rodriguez", company: "AI Labs", leadID: "FD-1476", joinDate: "11/13/2023", jobTitle: "Research Scientist", industry: "AI & ML", location: "Austin", email: "emma@ailabs.com", phone: "505-606-7070", social: "@emmarodriguez" },
  { name: "William Thompson", company: "LogiTech Solutions", leadID: "FD-1477", joinDate: "12/14/2023", jobTitle: "Logistics Manager", industry: "Supply Chain", location: "Denver", email: "william@logitech.com", phone: "606-707-8080", social: "@williamt" },
  { name: "Isabella White", company: "DesignNest", leadID: "FD-1478", joinDate: "1/15/2024", jobTitle: "Creative Director", industry: "Design", location: "San Jose", email: "isabella@designnest.com", phone: "707-808-9090", social: "@isabellaw" },
  { name: "Benjamin Harris", company: "AutoMax", leadID: "FD-1479", joinDate: "2/16/2024", jobTitle: "Product Manager", industry: "Automotive", location: "Detroit", email: "benjamin@automax.com", phone: "808-909-1010", social: "@benharris" },
  { name: "Charlotte King", company: "Foodies Inc", leadID: "FD-1480", joinDate: "3/17/2024", jobTitle: "Culinary Consultant", industry: "Food & Beverage", location: "New Orleans", email: "charlotte@foodies.com", phone: "909-101-1111", social: "@charlottek" },
  { name: "Liam Scott", company: "RealtyPros", leadID: "FD-1481", joinDate: "4/18/2024", jobTitle: "Real Estate Agent", industry: "Real Estate", location: "Phoenix", email: "liam@realtypros.com", phone: "101-111-1212", social: "@liamscott" },
  { name: "Ava Nelson", company: "MediPlus", leadID: "FD-1482", joinDate: "5/19/2024", jobTitle: "Pharmaceutical Rep", industry: "Medical", location: "Philadelphia", email: "ava@mediplus.com", phone: "111-121-1313", social: "@avan" },
  { name: "Noah Wright", company: "CyberSecure", leadID: "FD-1483", joinDate: "6/20/2024", jobTitle: "Cybersecurity Analyst", industry: "IT Security", location: "Washington D.C.", email: "noah@cybersecure.com", phone: "121-131-1414", social: "@noahwright" },
  { name: "Mia Hall", company: "FitWell", leadID: "FD-1484", joinDate: "7/21/2024", jobTitle: "Fitness Coach", industry: "Health & Fitness", location: "Las Vegas", email: "mia@fitwell.com", phone: "131-141-1515", social: "@miahall" },
  { name: "Ethan Baker", company: "AgroTech", leadID: "FD-1485", joinDate: "8/22/2024", jobTitle: "Agricultural Specialist", industry: "Agriculture", location: "Portland", email: "ethan@agrotech.com", phone: "141-151-1616", social: "@ethanb" },
];

const rowsPerPage = 10;

export default function AccountPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);

  const handlePageClick = (event) => {
    setPage(event.selected);
  };

  const displayedLeads = leads.slice(page * rowsPerPage, (page + 1) * rowsPerPage);

  return (
    <div className="accounts-container">
      {/* Cards Section */}
      <div className="cards-wrapper">
        {cardData.map((card, index) => (
          <div key={index} className="account-card" style={{ backgroundColor: card.bgColor }}>
            <div className="icon-container">
              <img src={card.icon} alt={card.title} className="account-icon" />
            </div>
            <div className="account-text">
              <p className="account-title">{card.title}</p>
              <p className="account-value">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search Filter Section */}
      <div className="search-container">
        <input type="text" placeholder="Lead Name" className="search-input" />

        <div className="dropdown-container">
          <select className="search-dropdown">
            <option value="">Select Status</option>
            <option value="new">New</option>
            <option value="in-progress">In Progress</option>
            <option value="closed">Closed</option>
          </select>
          <img src={arrowRightIcon} alt="Dropdown Icon" className="dropdown-icon" />
        </div>

        <button className="search-button">
          <img src={searchIcon} alt="Search" className="search-icon" />
        </button>
      </div>

      {/* Lead Cards Section */}
      <div className="lead-cards-container">
        {displayedLeads.map((lead, index) => (
          <div key={index} className="lead-card">
            <div className="options-icon">⋮</div>

            <div className="lead-info">
              <h3 className="lead-name">{lead.name}</h3>
              <span className="company-badge">{lead.company}</span>

              <div className="lead-details">
                <p>Lead ID</p>
                <p className="lead-value">{lead.leadID}</p>
              </div>
              <div className="lead-details">
                <p>Join Date</p>
                <p className="lead-value">{lead.joinDate}</p>
              </div>
            </div>

            {/* Action Icons */}
            <div className="lead-actions">
              <div 
                className="chat-icon clickable"
                onClick={(e) => { e.stopPropagation(); console.log("Chat Clicked"); }}
              >
                <img src={chatIcon} alt="Chat" />
              </div>
              <div 
                className="user-icon clickable"
                onClick={(e) => { 
                  e.stopPropagation(); 
                  navigate("/lead-profile", { state: { lead } });
                }} 
              >
                <img src={userIcon} alt="Profile" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="pagination-container">
        <ReactPaginate
          breakLabel="..."
          nextLabel=">"
          onPageChange={handlePageClick}
          pageRangeDisplayed={4}
          marginPagesDisplayed={1}
          pageCount={Math.ceil(leads.length / rowsPerPage)}
          previousLabel="<"
          containerClassName="pagination"
          activeClassName="active"
        />
      </div>
    </div>
  );
}
