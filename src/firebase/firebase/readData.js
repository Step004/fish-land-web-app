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


export const getFriendsContacts = async (userId) => {
  const db = database;
  const dbRef = ref(db, "/");

  try {
    // Отримати список друзів користувача
    const friendsSnapshot = await get(child(dbRef, `users/${userId}/friends`));
    if (!friendsSnapshot.exists()) {
      return [];
    }

    const friends = friendsSnapshot.val();

    // Отримати деталі кожного друга (з об'єкта, а не масиву)
    const friendDetailsPromises = Object.keys(friends).map(async (friendId) => {
      const friendSnapshot = await get(child(dbRef, `users/${friendId}`));
      if (friendSnapshot.exists()) {
        return friendSnapshot.val();
      } else {
        console.log(`Friend with ID ${friendId} not found`);
        return null;
      }
    });

    const friendDetails = await Promise.all(friendDetailsPromises);

    // Фільтруємо `null`, якщо є друзі, які не знайдені
    return friendDetails.filter((friend) => friend !== null);
  } catch (error) {
    console.error(
      `Error fetching friends' contacts for user with ID ${userId}:`,
      error
    );
    throw error;
  }
};