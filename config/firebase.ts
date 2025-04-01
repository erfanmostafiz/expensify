// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCLhiuOH7kgce37XpUrTmZaqSyAPKIMIbY",
    authDomain: "expense-tracker-202cf.firebaseapp.com",
    projectId: "expense-tracker-202cf",
    storageBucket: "expense-tracker-202cf.firebasestorage.app",
    messagingSenderId: "616621752291",
    appId: "1:616621752291:web:d87eeb24ea2c415a722ad6",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// auth
export const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
});

//db
export const firestore = getFirestore(app);
