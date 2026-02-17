import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializeApp } from "firebase/app";
import { getReactNativePersistence, initializeAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDa4LRdhME6gYo9wqgfRs_yKbfBo9nx88k",
  authDomain: "beforeigo-3bb31.firebaseapp.com",
  projectId: "beforeigo-3bb31",
  storageBucket: "beforeigo-3bb31.firebasestorage.app",
  messagingSenderId: "861454563971",
  appId: "1:861454563971:web:5c44200ee3c56ef5dab9b6",
  measurementId: "G-F9D2GY696T",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with persistence (this saves the login session)
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export default app;
