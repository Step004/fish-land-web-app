import { useState, useEffect } from "react";
import { ref, get } from "firebase/database";
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
