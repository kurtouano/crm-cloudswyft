import "./SalesTeam.css";

const cards = [
  { title: "Average Lead Finds", value: 10, color: "#4A4A4A", bg: "#F6F6F6" },
  { title: "Provisioning For a Client", value: 11, color: "#1E91FF", bg: "#FFFFFF" },
  { title: "Confirming a Deal", value: 10, color: "#1E91FF", bg: "#FFFFFF" },
  { title: "On-boarding A Client", value: 22, color: "#4A4A4A", bg: "#F6F6F6" },
];

export default function SpecialistStatsCards() {
  return (
    <div className="specialist-salescard-container">
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
