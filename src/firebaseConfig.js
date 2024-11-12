import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCv9epGaA8rlBX5gSmW89X8-R8LyE1yHWk",
  authDomain: "appdoctor-5f06e.firebaseapp.com",
  projectId: "appdoctor-5f06e",
  storageBucket: "appdoctor-5f06e.appspot.com",
  messagingSenderId: "181065818512",
  appId: "1:181065818512:web:118a35baa30ff6681ad315"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar servicios específicos
export const db = getFirestore(app);
export const auth = getAuth(app);      // Para autenticación
export const storage = getStorage(app); // Para almacenamiento de archivos
