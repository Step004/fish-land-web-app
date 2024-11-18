import { ref, set, getDatabase } from "firebase/database";


export async function saveUserToDatabase(userId, email, userName) {
    console.log("Saving user to database:", { userId, email, userName });
    if (!userName) {
      console.error("Name is missing!");
    }
  const db = getDatabase();
  const userRef = ref(db, `users/${userId}`);
  try {
    await set(userRef, {
      email,
      userName,
      createdAt: new Date().toISOString(),
    });
    console.log("User saved successfully");
  } catch (error) {
    console.error("Error saving user to database:", error);
  }
}
