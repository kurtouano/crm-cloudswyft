import { Droppable, Draggable } from "@hello-pangea/dnd";
import CalendarIcon from "../../assets/kanban-item-calendar-icon.svg";
import "./SalesFlow.css";
import PropTypes from 'prop-types';

// Import employee images
import DefaultAvatar from "../../assets/employees/Default-Avatar.svg";
import JohnDoeImg from "../../assets/employees/John-Doe.svg";
import JaneSmithImg from "../../assets/employees/Jane-Smith.svg";
import AliceJohnsonImg from "../../assets/employees/Alice-Johnson.svg";

// Employee image mapping
const employeeImages = {
  "John Doe": JohnDoeImg,
  "Jane Smith": JaneSmithImg,
  "Alice Johnson": AliceJohnsonImg,
};

const Column = ({ itemsOrder, id, title, ITEMS }) => {
  return (
    <div className="kanban-column-container">
      <div className="kanban-column-title-container">
        <p className="kanban-column-title">{title}</p>
        <p className="kanban-column-item-counter">{itemsOrder.length}</p>
      </div>

      <Droppable droppableId={id}>
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="kanban-column-body-container"
          >
            {itemsOrder.length === 0 && (
              <div className="kanban-column-body-no-item">No items</div>
            )}

            {itemsOrder.map((item_id, index) => {
              const item = ITEMS[item_id];

              // ✅ Ensure item exists before rendering
              if (!item) {
                console.warn(`Item not found: ${item_id}`);
                return null;
              }

              const employeeName = item.employee || "Unknown";
              const employeeImg = employeeImages[employeeName] || DefaultAvatar;

              return (
                <Draggable draggableId={item.id} index={index} key={item.id}>
                  {(provided) => (
                    <div
                      className="kanban-draggable-items"
                      {...provided.dragHandleProps}
                      {...provided.draggableProps}
                      ref={provided.innerRef}
                    >
                      <p className="kanban-item-title">{item.title}</p>
                      <p className="kanban-item-description">{item.description}</p>

                      <div className="kanban-item-employee-container">
                        <span className="kanban-item-employee-name">{employeeName}</span>
                        <img className="kanban-item-employee-avatar" src={employeeImg} alt={employeeName} />
                      </div>

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
