import { Droppable, Draggable } from "@hello-pangea/dnd";
import CalendarIcon from "@/assets/kanban-item-calendar-icon.svg";
import "./SalesFlow.css";
import { useMemo } from "react";
import PropTypes from 'prop-types';

const Column = ({ itemsOrder, id, title, ITEMS }) => {
  // Use useMemo to prevent unnecessary re-renders
  const memoizedItems = useMemo(() => {
    return itemsOrder.map(item_id => {
      const item = ITEMS[item_id];
      if (!item) {
        console.warn(`Item not found: ${item_id}`);
        return null;
      }
      return item;
    }).filter(Boolean);
  }, [itemsOrder, ITEMS]);

  return (
    <div className="kanban-column-container">
      <div className="kanban-column-title-container">
        <p className="kanban-column-title">{title}</p>
        <p className="kanban-column-item-counter">{memoizedItems.length}</p>
      </div>

      <Droppable droppableId={id}>
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="kanban-column-body-container"
          >
            {memoizedItems.length === 0 && (
              <div className="kanban-column-body-no-item">No items</div>
            )}

            {memoizedItems.map((item, index) => {
              {/* const employeeName = item.employee || "Unknown"; */}
              {/* const employeeImg = employeeImages[employeeName] || DefaultAvatar; */}

              return (
                <Draggable 
                  key={item.id} 
                  draggableId={item.id} 
                  index={index}
                >
                  {(provided) => (
                    <div
                      className="kanban-draggable-items"
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      <p className="kanban-item-title">{item.title}</p>
                      <p className="kanban-item-description">{item.email}</p>
                      {/* <div className="kanban-item-employee-container"> */}
                        {/* <span className="kanban-item-employee-name">{employeeName}</span>
                        <img className="kanban-item-employee-avatar" src={employeeImg} alt={employeeName} /> */}
                      {/* </div> */}
                      <div className="kanban-item-divider">
                        <img src={CalendarIcon} alt="Calendar Icon" />
                        <p className="kanban-item-start-time">{item.timeStarted}</p>
                      </div>
                    </div>
                  )}
                </Draggable>
              );
            })}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};

Column.propTypes = {
  itemsOrder: PropTypes.arrayOf(PropTypes.string).isRequired,
  id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  ITEMS: PropTypes.objectOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      description: PropTypes.string,
      employee: PropTypes.string,
      timeStarted: PropTypes.string,
    })
  ).isRequired,
};

export default Column;
