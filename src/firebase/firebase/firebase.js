import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import env from "../../utils/env.js";

const firebaseConfig = {
  apiKey: env("VITE_APIKEY"),
  authDomain: env("VITE_AUTHDOMAIN"),
  projectId: env("VITE_PROJECTID"),
  storageBucket: env("VITE_STORAGEBUCKET"),
  messagingSenderId: env("VITE_MESSAGINGSENDERID"),
  appId: env("VITE_APPID"),
  measurementId: env("VITE_MEASUREMENTID"),
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

export { app, auth, database };
