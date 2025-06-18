import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC7aogyrkyv_BRhVxfB0LAoUH8nXoPWUS4",
  authDomain: "checkweather-38ca5.firebaseapp.com",
  projectId: "checkweather-38ca5",
  storageBucket: "checkweather-38ca5.firebasestorage.app",
  messagingSenderId: "792578106579",
  appId: "1:792578106579:web:38333b9ffe860ed692e026",
  measurementId: "G-75D2Q5R7EZ"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
