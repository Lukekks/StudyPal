// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-analytics.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAlNrUBWw5szCdUW6FdvBPeoXjr0xVKYXI",
  authDomain: "studypal-dd642.firebaseapp.com",
  projectId: "studypal-dd642",
  storageBucket: "studypal-dd642.appspot.com",
  messagingSenderId: "335106462423",
  appId: "1:335106462423:web:7f902e7636490c2a49d692",
  measurementId: "G-MPMBDRTBJF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
