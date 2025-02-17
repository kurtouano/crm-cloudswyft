import React from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";

const ActiveProjectIcon = () => (
  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="6" fill="#1BB9F4"/>
    <path d="M15.5 3H8.5C6.567 3 5 4.567 5 6.5V17.5C5 19.433 6.567 21 8.5 21H15.5C17.433 21 19 19.433 19 17.5V6.5C19 4.567 17.433 3 15.5 3Z" stroke="white" strokeWidth="2"/>
    <path d="M9 8H15" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    <path d="M9 12H15" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    <path d="M9 16H12" stroke="white" strokeWidth="2" strokeLinecap="round"/> 
  </svg>
);

const CompleteProjectIcon = () => (
  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="6" fill="#10387B"/>
    <path d="M12 3C7.59 3 4 6.59 4 11C4 15.41 7.59 19 12 19C16.41 19 20 15.41 20 11C20 6.59 16.41 3 12 3ZM12 17C8.69 17 6 14.31 6 11C6 7.69 8.69 5 12 5C15.31 5 18 7.69 18 11C18 14.31 15.31 17 12 17Z" fill="white"/>
    <path d="M10 9.5L12 11.5L15 8.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const NetPromoterScoreIcon = () => (
  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="6" fill="#1976D2"/>
    <path d="M6 18V6H9L12 9L15 6H18V18H6Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 14H15" stroke="white" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

// Sample data (Ready for backend integration)
const projectData = [
  {
    title: "Active Project",
    value: 245,
    total: 5378,
    percentage: 15,
    color: "#1BB9F4",
    icon: <ActiveProjectIcon />,
    growth: "3.45%",
  },
  {
    title: "Complete Project",
    value: 145,
    total: 3378,
    percentage: 75,
    color: "#10387B",
    icon: <CompleteProjectIcon />,
    growth: "1.3%",
  },
  {
    title: "Net Promoter Score",
    value: 745,
    total: 1000,
    percentage: 65,
    color: "#1976D2",
    icon: <NetPromoterScoreIcon />,
    growth: "1.3%",
  },
];

export default function ProjectSummaryCards() {
  return (
    <div className="project-summary-container">
      {projectData.map((project, index) => (
        <div key={index} className="project-summary-card">
          <div className="project-summary-header">{project.icon}<h4 className="project-summary-title">{project.title}</h4></div>

          <div className="project-summary-content">
            <div className="project-summary-info">
              <span className="project-summary-value">{project.value}</span>
              <span className="project-summary-total">/{project.total} All Over</span>
            </div>

            <div className="project-summary-chart">
            <CircularProgressbar
              value={project.percentage}
              text={`${project.percentage}%`}
              styles={buildStyles({
                pathColor: project.color, // Darker progress color
                trailColor: "#E0E0E0", // Lighter background
                textColor: "#333",
                textSize: "30px", // Increase text size
                strokeWidth: 14, // Make the progress bar thicker
                textAlign: "center", // Ensures text is centered
              })}
            />

            </div>
          </div>

          <div className="project-summary-footer">
            <img src="/src/assets/up-arrow.png" alt="Growth" className="growth-icon" />
            <span className="growth-text">{project.growth} Up from past weeks</span>
          </div>
        </div>
      ))}
    </div>
  );
}
