import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const apiKey = process.env.REACT_APP_FIREBASE_API_KEY;
export let firebaseApp = null;
export let auth = null;
export let firebaseConfigurationError = null;
if (!apiKey) {
    firebaseConfigurationError =
        "Firebase is not configured. Set REACT_APP_FIREBASE_API_KEY and rebuild the app.";
} else {
    try {
        firebaseApp = initializeApp({
            apiKey,
            authDomain: "morfi-splitter.firebaseapp.com",
            projectId: "morfi-splitter",
            storageBucket: "morfi-splitter.appspot.com",
            messagingSenderId: "1032220924261",
            appId: "1:1032220924261:web:1c482038a81a3d459ca98c",
        });
        auth = getAuth(firebaseApp);
    } catch {
        firebaseConfigurationError =
            "Firebase could not start. Check REACT_APP_FIREBASE_API_KEY and rebuild the app.";
    }
}
