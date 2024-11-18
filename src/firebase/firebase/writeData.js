import { ref, set, getDatabase } from "firebase/database";


export async function saveUserToDatabase(userId, email, name) {
  const db = getDatabase();
  const userRef = ref(db, `users/${userId}`);
  try {
    await set(userRef, {
      email,
      name,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error saving user to database:", error);
  }
}
