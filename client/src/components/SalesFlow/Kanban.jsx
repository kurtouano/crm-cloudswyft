import { useState } from "react";
import { DragDropContext, Droppable } from "@hello-pangea/dnd";
import "./SalesFlow.css";
import Column from "./Column.jsx";

const INITIAL_COLUMN_ORDER = [
  "lead",
  "discovery-call",
  "quote",
  "provision",
  "proposal",
  "negotiation",
  "onboarding",
];

const INITIAL_COL_DATA = {
  "lead": { id: "lead", title: "LEAD", itemsOrder: ["item-1", "item-2"] },
  "discovery-call": { id: "discovery-call", title: "DISCOVERY CALL", itemsOrder: ["item-3"] },
  "quote": { id: "quote", title: "QUOTE", itemsOrder: [] },
  "provision": { id: "provision", title: "PROVISION", itemsOrder: [] },
  "proposal": { id: "proposal", title: "PROPOSAL", itemsOrder: [] },
  "negotiation": { id: "negotiation", title: "NEGOTIATION", itemsOrder: [] },
  "onboarding": { id: "onboarding", title: "ON-BOARDING", itemsOrder: [] },
};

const ITEMS = {
  "item-1": {
    id: "item-1",
    title: "Lead 1",
    description: "Interested in our product, requested more info.",
    employee: "John Doe",
    timeStarted: "April 1",
  },
  "item-2": {
    id: "item-2",
    title: "Lead 2",
    description: "Referred by an existing client.",
    employee: "Jane Smith",
    timeStarted: "January 25",
  },
  "item-3": {
    id: "item-3",
    title: "Lead 3",
    description: "Looking for a custom solution.",
    employee: "Alice Johnson",
    timeStarted: "February 15",
  },
};

export default function Kanban() {
  const [data, setData] = useState(INITIAL_COL_DATA);
  const handleDragDrop = (results) => {
    const { source, destination } = results;
  
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;
  
    const sourceColId = source.droppableId;
    const destColId = destination.droppableId;
  
    const newData = { ...data }; // Clone state correctly
  
    // Moving within the same column
    if (sourceColId === destColId) {
      const column = newData[sourceColId];
      const newItems = [...column.itemsOrder];
  
      const [movedItem] = newItems.splice(source.index, 1);
      newItems.splice(destination.index, 0, movedItem);
  
      newData[sourceColId] = { ...column, itemsOrder: newItems };
    } else {
      // Moving across different columns
      const sourceItems = [...newData[sourceColId].itemsOrder];
      const destItems = [...newData[destColId].itemsOrder];
  
      const [movedItem] = sourceItems.splice(source.index, 1);
      destItems.splice(destination.index, 0, movedItem);
  
      newData[sourceColId] = { ...newData[sourceColId], itemsOrder: sourceItems };
      newData[destColId] = { ...newData[destColId], itemsOrder: destItems };
    }
  
    setData(newData); // Update state
  };
  
  return (
    <>
        <div className="kanban-container">
        <div className="kanban-header-text">Kanban Board</div>
        <DragDropContext onDragEnd={handleDragDrop}>
            <div className="kanban-container-inner">
            {INITIAL_COLUMN_ORDER.map((colId) => {
                const columnData = data[colId];
                return <Column key={colId} {...columnData} ITEMS={ITEMS} />;
            })}
            </div>
        </DragDropContext>
        </div>
    </>

  );
}
