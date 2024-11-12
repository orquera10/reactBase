import { getFirestore } from 'firebase/firestore';
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCv9epGaA8rlBX5gSmW89X8-R8LyE1yHWk",
  authDomain: "appdoctor-5f06e.firebaseapp.com",
  projectId: "appdoctor-5f06e",
  storageBucket: "appdoctor-5f06e.firebasestorage.app",
  messagingSenderId: "181065818512",
  appId: "1:181065818512:web:118a35baa30ff6681ad315"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);