const API_URL = import.meta.env.VITE_BACKEND_URL; 

import {useEffect, useRef} from "react";

export default function useMicrosoftAuthenticationSupport() {
    const intervalRef = useRef(null);
  
    useEffect(() => {
      const currentPage = window.location.pathname.replace("/", "") || "dashboard"; 
  
      const params = new URLSearchParams(window.location.search);
      const accessToken = params.get("accessToken");
      const expiryTime = params.get("expiry") ? Number(params.get("expiry")) : null;
    
      const redirectToLogin = () => {
        console.log("🔄 Access token is missing or expired. Redirecting to Microsoft login...");
        localStorage.removeItem("microsoftAccessTokenAfterSales");
        localStorage.removeItem("tokenExpiryAfterSales");
    
        if (intervalRef.current) {
          clearInterval(intervalRef.current); // Clear the interval before redirecting
        }
    
        window.location.href = `${API_URL}/api/emails/support/microsoft-login?currentPage=${currentPage}`; // Redirect to your login page
      };
    
    const checkTokenValidity = () => {
        const storedToken = localStorage.getItem("microsoftAccessTokenAfterSales");
    
        // If token is missing, redirect to login
        if (!storedToken) {
          redirectToLogin();
        }
    
        const storedExpiry = localStorage.getItem("tokenExpiryAfterSales");
    
        // If token has expired, redirect to login
        if (!storedExpiry || Date.now() > Number(storedExpiry)) {
          redirectToLogin();
        }
      };
    
      // If the access token and expiry are in the URL params (i.e., after logging in)
      if (accessToken && expiryTime) {
        console.log("✅ Access Token Retrieved:", accessToken);
        console.log("✅ Expires in:", Math.floor((expiryTime - Date.now()) / 60000), "minutes");
    
        localStorage.setItem("microsoftAccessTokenAfterSales", accessToken);
        localStorage.setItem("tokenExpiryAfterSales", expiryTime);
    
        window.history.replaceState({}, document.title, `/${currentPage}`);
      } else {
        // If no access token in URL, check token validity in localStorage
        checkTokenValidity();
      }
    
      // Start checking token validity every 60 seconds
      intervalRef.current = setInterval(checkTokenValidity, 60000);
    
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current); // Cleanup on component unmount
        }
      };
    }, []); // Empty dependency array ensures this runs once on component mount 
  
    return null;
  }
