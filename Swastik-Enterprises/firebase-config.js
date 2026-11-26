// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDejciCeubgjd-NUug4qe3mk0lME83qOeQ",
    authDomain: "swastik-enterprises-referrals.firebaseapp.com",
    projectId: "swastik-enterprises-referrals",
    storageBucket: "swastik-enterprises-referrals.firebasestorage.app",
    messagingSenderId: "481633893874",
    appId: "1:481633893874:web:7323108f4d6e20686dff6b",
    measurementId: "G-9W6D2ZBGPG"
};

// Replace with your exact Owner email (must match your Firestore Rules)
export const OWNER_EMAIL = "swastikenterprises5251@gmail.com";

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);