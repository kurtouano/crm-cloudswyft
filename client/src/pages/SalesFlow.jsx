import Kanban from "../components/SalesFlow/Kanban.jsx";
import useMicrosoftAuthentication from "../utils/AuthMicrosoft.js";

export default function Salesflow() {
  useMicrosoftAuthentication();
  return (
    <>
        <Kanban />
    </>
  )
}
