// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB8ubed1ynMOgPDQnfGmY9y0hVg9tuaUKk",
  authDomain: "tekmiz-5e01f.firebaseapp.com",
  projectId: "tekmiz-5e01f",
  storageBucket: "tekmiz-5e01f.appspot.com",
  messagingSenderId: "632570377499",
  appId: "1:632570377499:web:e9094a5ed5dbc518d0cfbe",
  measurementId: "G-NKTXB35L9Y"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const analytics = getAnalytics(firebaseApp);
const db = getFirestore(firebaseApp);
const storage = getStorage(firebaseApp);

export {firebaseApp, analytics,db,storage}