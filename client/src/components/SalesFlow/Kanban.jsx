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
  "On-boarding"
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
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const newData = { ...data };
    const sourceCol = newData[source.droppableId];
    const destCol = newData[destination.droppableId];

    const sourceItems = [...sourceCol.itemsOrder];
    const destItems = [...destCol.itemsOrder];

    const [movedItem] = sourceItems.splice(source.index, 1);
    destItems.splice(destination.index, 0, movedItem);

    newData[source.droppableId] = { ...sourceCol, itemsOrder: sourceItems };
    newData[destination.droppableId] = { ...destCol, itemsOrder: destItems };

    setData(newData);

    // ✅ Send API request to update the lead's stage in the database
    try {
      await axios.put(`http://localhost:4000/api/leads/${draggableId}`, {
        stage: destination.droppableId,
      });
      console.log(`✅ Lead ${draggableId} moved to ${destination.droppableId}`);
    } catch (error) {
      console.error("❌ Error updating lead stage:", error);
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
