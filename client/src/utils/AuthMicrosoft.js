import {useEffect, useRef} from "react";

export default function useMicrosoftAuthentication() {
    const intervalRef = useRef(null);
  
    useEffect(() => {
      const currentPage = window.location.pathname.replace("/", "") || "dashboard"; 
  
      const params = new URLSearchParams(window.location.search);
      const accessToken = params.get("accessToken");
      const expiryTime = params.get("expiry") ? Number(params.get("expiry")) : null;
    
      const redirectToLogin = () => {
        console.log("🔄 Access token is missing or expired. Redirecting to Microsoft login...");
        localStorage.removeItem("microsoftAccessToken");
        localStorage.removeItem("tokenExpiry");
    
        if (intervalRef.current) {
          clearInterval(intervalRef.current); // Clear the interval before redirecting
        }
    
        window.location.href = `http://localhost:4000/api/emails/microsoft-login?currentPage=${currentPage}`; // Redirect to your login page
      };
    
    const checkTokenValidity = () => {
        const storedToken = localStorage.getItem("microsoftAccessToken");
    
        // If token is missing, redirect to login
        if (!storedToken) {
          redirectToLogin();
        }
    
        const storedExpiry = localStorage.getItem("tokenExpiry");
    
        // If token has expired, redirect to login
        if (!storedExpiry || Date.now() > Number(storedExpiry)) {
          redirectToLogin();
        }
      };
    
      // If the access token and expiry are in the URL params (i.e., after logging in)
      if (accessToken && expiryTime) {
        console.log("✅ Access Token Retrieved:", accessToken);
        console.log("✅ Expires in:", Math.floor((expiryTime - Date.now()) / 60000), "minutes");
    
        localStorage.setItem("microsoftAccessToken", accessToken);
        localStorage.setItem("tokenExpiry", expiryTime);
    
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
