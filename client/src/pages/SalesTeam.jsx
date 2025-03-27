import SalesTeamPage from "../components/SalesTeam/SalesTeamPage"
import TipTap from "../utils/TextEditor"
import { useState } from "react";

export default function SalesTeam() {
  const [emailContent, setEmailContent] = useState('');
  
  return (
    <>
      <SalesTeamPage/>
      <div style={{ marginLeft: "500px"}}>
        <TipTap 
          content={emailContent}
          onUpdate={(html) => setEmailContent(html)}
        />
      </div>
      
    </>
  )
}
