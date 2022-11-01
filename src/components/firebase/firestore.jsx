import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyA83sQ3l4IS2hE8Ru7HSKe6xIAEttXHIl4",
    authDomain: "morfi-splitter.firebaseapp.com",
    projectId: "morfi-splitter",
    storageBucket: "morfi-splitter.appspot.com",
    messagingSenderId: "1032220924261",
    appId: "1:1032220924261:web:1c482038a81a3d459ca98c"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);