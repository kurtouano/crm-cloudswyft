import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import { FiFileText } from "react-icons/fi";
import { FiAward } from "react-icons/fi";
import { AiOutlineCheckCircle } from "react-icons/ai";

// Sample data (Ready for backend integration)
const projectData = [
  {
    title: "Active Project",
    value: 245,
    total: 5378,
    percentage: 15,
    color: "#1BB9F4",
    icon: <FiFileText className="summary-cards-react-icon card-icon-1"/>,
    growth: "3.45%",
    image: "/src/assets/proj-summary-up-icon-1.svg",
  },
  {
    title: "Complete Project",
    value: 145,
    total: 3378,
    percentage: 75,
    color: "#10387B",
    icon: <AiOutlineCheckCircle className="summary-cards-react-icon card-icon-2"/>,
    growth: "1.3%",
    image: "/src/assets/proj-summary-up-icon-2.svg",
  },
  {
    title: "Net Promoter Score",
    value: 745,
    total: 1000,
    percentage: 65,
    color: "#1976D2",
    icon: <FiAward className="summary-cards-react-icon card-icon-3"/>,
    growth: "1.3%",
    image: "/src/assets/proj-summary-up-icon-3.svg",
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
              <span className="project-summary-total">/ {project.total} All Over</span>
            </div>

            <div className="project-summary-chart">
            <CircularProgressbar
              value={project.percentage}
              text={`${project.percentage}%`}
              strokeWidth={14} // Increase stroke width
              styles={buildStyles({
                pathColor: project.color, // Darker progress color
                trailColor: "#E0E0E0", // Lighter background
                textColor: "#333",
                textSize: "24px", // Increase text size
                textAlign: "center", // Ensures text is centered
              })}
            />

            </div>
          </div>

          <div className="project-summary-footer">
            <img src={project.image} alt="Growth" className="growth-icon" />
            <span className="growth-text">{project.growth} Up from past weeks</span>
          </div>
        </div>
      ))}
    </div>
  );
}
