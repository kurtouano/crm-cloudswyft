import { useState, useEffect } from "react";
import { DragDropContext } from "@hello-pangea/dnd";
import axios from "axios";
import "./SalesFlow.css";
import Column from "./Column.jsx";

const COLUMN_ORDER = [
  "Lead",
  "Discovery Call",
  "Quote",
  "Provision",
  "Proposal",
  "Negotiation",
  "On-boarding",
  "Lost"
];

export default function Kanban() {
  const [data, setData] = useState({});
  const [items, setItems] = useState({});

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const response = await axios.get("http://localhost:4000/api/leads");
        const leads = response.data;

        // ✅ Map stage names to column IDs
        const stageMapping = {
          Lead: "Lead",
          "Discovery Call": "Discovery Call",
          Quote: "Quote",
          Provision: "Provision",
          Proposal: "Proposal",
          Negotiation: "Negotiation",
          "On-boarding": "On-boarding",
          Lost: "Lost",
        };        

        // ✅ Generate items dynamically
        const fetchedItems = {};
        leads.forEach((lead) => {
          fetchedItems[lead._id] = {
            id: lead._id, 
            title: lead.leadName, 
            description: "Description placeholder",
            employee: "John Doe",
            timeStarted: lead.importDate,
          };
        });

        setItems(fetchedItems);

        // ✅ Initialize columns dynamically
        const initialColumns = COLUMN_ORDER.reduce((acc, colId) => {
          acc[colId] = { id: colId, title: colId.toUpperCase(), itemsOrder: [] };
          return acc;
        }, {});

        // ✅ Assign leads to correct columns based on `stage`
        leads.forEach((lead) => {
          const stageKey = stageMapping[lead.stage] || "Lead";
          initialColumns[stageKey].itemsOrder.push(lead._id); // ✅ Use MongoDB ID
        });

        setData(initialColumns);
      } catch (error) {
        console.error("Error fetching leads:", error);
      }
    };

    fetchLeads();
  }, []);

  const handleDragDrop = async (results) => {
    const { source, destination, draggableId } = results;
    
    // Early return for invalid drops
    if (!destination) return;
    if (source.droppableId === destination.droppableId && 
        source.index === destination.index) return;
  
    // Determine new status based on destination stage
    let newStatus;
    if (destination.droppableId === "Negotiation" || destination.droppableId === "Proposal") {
      newStatus = "active";
    } else if (destination.droppableId === "On-boarding") {
      newStatus = "successful";
    } else if (destination.droppableId === "Lost") {
      newStatus = "lost";
    } else {
      newStatus = "active"; // Default for other stages
    }
  
    // Create a deep copy of the current data
    const newData = JSON.parse(JSON.stringify(data));
  
    // Remove from source
    const [removedItem] = newData[source.droppableId].itemsOrder.splice(source.index, 1);
    
    // Insert into destination
    newData[destination.droppableId].itemsOrder.splice(destination.index, 0, removedItem);
  
    // Optimistic UI update
    setData(newData);
  
    try {
      // Update backend
      await axios.put(`http://localhost:4000/api/leads/${draggableId}`, {
        stage: destination.droppableId,
        status: newStatus
      });
    } catch (error) {
      console.error("Error updating lead stage:", error);
      // Revert on error
      setData(prevData => ({ ...prevData }));
    }
  };

  return (
    <div className="kanban-container">
      <div className="kanban-header-text">Kanban Board</div>
      <DragDropContext onDragEnd={handleDragDrop}>
        <div className="kanban-container-inner">
          {COLUMN_ORDER.map((colId) => {
            const columnData = data[colId] || { id: colId, title: colId.toUpperCase(), itemsOrder: [] };
            return <Column key={colId} {...columnData} ITEMS={items} />;
          })}
        </div>
      </DragDropContext>
    </div>
  );
}
