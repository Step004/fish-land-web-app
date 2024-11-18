import { useState, useEffect } from "react";
import { ref, get, getDatabase, child } from "firebase/database";
import { database } from "./firebase.js";



export const getAllUsers = async () =>{
  const dbRef = ref(getDatabase());
  try {
    const snapshot = await get(child(dbRef, "users"));
    if (snapshot.exists()) {
      const users = snapshot.val();
      console.log("Users:", users);
      return users;
    } else {
      console.log("No users found");
      return null;
    }
  } catch (error) {
    console.error("Error fetching users:", error);
  }
}

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
