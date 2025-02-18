import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyAkRCwtSUyTZoJG-uJB4cl7vKZJBzkcMII",
    authDomain: "crm-cloudswyft.firebaseapp.com",
    projectId: "crm-cloudswyft",
    storageBucket: "crm-cloudswyft.firebasestorage.app",
    messagingSenderId: "116495896733",
    appId: "1:116495896733:web:6a07f61e1065a86df44474"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
