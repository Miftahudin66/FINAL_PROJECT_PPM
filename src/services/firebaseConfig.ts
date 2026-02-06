import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// TODO: Replace with your actual Firebase project configuration
const firebaseConfig = {
    apiKey: "API_KEY_PLACEHOLDER",
    authDomain: "rentready-app.firebaseapp.com",
    projectId: "rentready-app",
    storageBucket: "rentready-app.appspot.com",
    messagingSenderId: "SENDER_ID_PLACEHOLDER",
    appId: "APP_ID_PLACEHOLDER"
};

const app = initializeApp(firebaseConfig);
export const firestore = getFirestore(app);
export const auth = getAuth(app);
