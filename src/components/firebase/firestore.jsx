import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: "morfi-splitter.firebaseapp.com",
    projectId: "morfi-splitter",
    storageBucket: "morfi-splitter.appspot.com",
    messagingSenderId: "1032220924261",
    appId: "1:1032220924261:web:1c482038a81a3d459ca98c"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app)