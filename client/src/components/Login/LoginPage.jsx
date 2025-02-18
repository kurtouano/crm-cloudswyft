import { useState } from "react";
import "./LoginPage.css";
import logo from "../../assets/Cloudswyft.png";
import waveImage from "../../assets/Wave.png";
import ellipseImage from "../../assets/Ellipse.png";
import ellipseWhiteImage from "../../assets/Ellipse white.png";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="login-page-container">
      {/* Background Decorations */}
      <img src={waveImage} alt="Wave" className="login-background-wave" />
      
      {/* Layered Ellipses */}
      <img src={ellipseImage} alt="Large Blue Ellipse" className="login-background-ellipse-large" />
      <img src={ellipseWhiteImage} alt="White Ellipse" className="login-background-ellipse-white" />
      <img src={ellipseImage} alt="Small Blue Ellipse" className="login-background-ellipse-small" />

      {/* Login Box */}
      <div className="login-card">
        <div className="login-logo-container">
          <img src={logo} alt="Cloudswyft" className="login-logo" />
          <span className="login-brand">Cloudswyft</span>
        </div>

        {/* Greeting */}
        <h2 className="login-greeting">[GREETING PLACEHOLDER]</h2>

        {/* Login Form */}
        <form className="login-form">
          {/* Employee ID */}
          <div className="input-group">
            <svg className="input-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="7" r="5" stroke="#555" strokeWidth="3"/>
              <path d="M4 20C4 16.6863 7.13401 14 11 14H13C16.866 14 20 16.6863 20 20" stroke="#555" strokeWidth="3"/>
            </svg>
            <input type="text" placeholder="Employee ID" className="login-input" />
          </div>

          {/* Password Field with Eye Icon */}
          <div className="input-group">
            <svg className="input-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="5" y="10" width="14" height="10" rx="2" stroke="#555" strokeWidth="3"/>
              <path d="M7 10V7C7 4.23858 9.23858 2 12 2C14.7614 2 17 4.23858 17 7V10" stroke="#555" strokeWidth="3"/>
            </svg>
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder="Password" 
              className="login-input" 
            />
            <button 
              type="button" 
              className="toggle-password" 
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <svg className="eye-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 4C7 4 2.8 7.8 1.5 12C2.8 16.2 7 20 12 20C17 20 21.2 16.2 22.5 12C21.2 7.8 17 4 12 4ZM12 17C9.2 17 7 14.8 7 12C7 9.2 9.2 7 12 7C14.8 7 17 9.2 17 12C17 14.8 14.8 17 12 17ZM12 9C10.3 9 9 10.3 9 12C9 13.7 10.3 15 12 15C13.7 15 15 13.7 15 12C15 10.3 13.7 9 12 9Z" fill="#555"/>
                </svg>
              ) : (
                <svg className="eye-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 4C7 4 2.8 7.8 1.5 12C2.8 16.2 7 20 12 20C17 20 21.2 16.2 22.5 12C21.2 7.8 17 4 12 4ZM12 17C9.2 17 7 14.8 7 12C7 9.2 9.2 7 12 7C14.8 7 17 9.2 17 12C17 14.8 14.8 17 12 17Z" fill="#555"/>
                </svg>
              )}
            </button>
          </div>

          {/* Login Button */}
          <button type="submit" className="login-button">Login</button>
        </form>
      </div>
    </div>
  );
}
