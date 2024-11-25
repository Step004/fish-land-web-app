import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
// import { getStorage } from "firebase/storage";
import env from "../../utils/env.js";
import { getFirestore } from "firebase/firestore"; // Імпортуємо Firestore

const firebaseConfig = {
  apiKey: env("VITE_APIKEY"),
  authDomain: env("VITE_AUTHDOMAIN"),
  databaseURL: env("VITE_DATABASEURL"),
  projectId: env("VITE_PROJECTID"),
  storageBucket: env("VITE_STORAGEBUCKET"),
  messagingSenderId: env("VITE_MESSAGINGSENDERID"),
  appId: env("VITE_APPID"),
  measurementId: env("VITE_MEASUREMENTID"),
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);

//  const storage = getStorage(app);
const database = getDatabase(app);

export { app, auth, firestore, database };
