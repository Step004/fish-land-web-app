import { useState, useEffect } from "react";
import { ref, get, child } from "firebase/database";
import { database } from "./firebase.js";

export function useDatabase() {
  const [friendArray, setFriendArray] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const db = database;
      const dbRef = ref(db, "/");
      const snapshot = await get(dbRef);
      if (snapshot.exists()) {
        setFriendArray(Object.values(snapshot.val()));
      } else {
        console.error("Error: No data found");
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  return { friendArray, loading };
}

export const getAllUsers = async () => {
  const db = database;
  const dbRef = ref(db, "/");
  try {
    const snapshot = await get(child(dbRef, "users"));
    if (snapshot.exists()) {
      const users = snapshot.val();
      return users;
    } else {
      console.log("No users found");
      return null;
    }
  } catch (error) {
    console.error("Error fetching users:", error);
  }
};

export const getUserById = async (userId) => {
  const db = database;
  const dbRef = ref(db, "/");
  try {
    const snapshot = await get(child(dbRef, `users/${userId}`));
    if (snapshot.exists()) {
      const user = snapshot.val();
      return user;
    } else {
      console.log(`User with ID ${userId} not found`);
      return null;
    }
  } catch (error) {
    console.error(`Error fetching user with ID ${userId}:`, error);
    throw error; 
  }
};
