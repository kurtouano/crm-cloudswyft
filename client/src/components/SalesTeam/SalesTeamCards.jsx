import "./SalesTeam.css";

const cards = [
  { title: "Average Lead Finds", value: 40, color: "#4A4A4A", bg: "#F6F6F6" },
  { title: "Sending Proposals", value: 25, color: "#1E91FF", bg: "#FFFFFF" },
  { title: "Updating Client Base", value: 13, color: "#1E91FF", bg: "#FFFFFF" },
  { title: "Setting Appointment", value: 26, color: "#4A4A4A", bg: "#F6F6F6" },
];

export default function SalesTeamCard() {
  return (
    <div className="salescard-container">
      {cards.map((card, index) => (
        <div
          key={index}
          className="salescard-box"
          style={{ backgroundColor: card.bg }}
        >
          <div className="salescard-title" style={{ color: card.color }}>
            {card.title}
          </div>
          <div
            className="salescard-value"
            style={{ color: card.color === "#1E91FF" ? "#1E91FF" : "#333" }}
          >
            {card.value}
          </div>
        </div>
      ))}
    </div>
  );
}
