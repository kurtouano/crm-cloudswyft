import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import SpecificAccount from "../components/Accounts/LeadProfilePage";
import "../components/Accounts/Accounts.css";
import BackButtonIcon from "../assets/back-button-icon.svg";

export default function LeadProfile() {
  const navigate = useNavigate();

  return (
    <>
      <div className="dashboard-page-container">
        <div className="lead-profile-header">
          <div className="lead-profile-header-text">
            <img
              src={BackButtonIcon}
              className="lead-profile-back-button"
              onClick={() => navigate("/accounts")}
              alt="Back"
            />
            Lead Profile
          </div>
        </div>

        <div className="dashboard-horizontal-alignment">
          <SpecificAccount />
        </div>
      </div>
    </>
  );
}
