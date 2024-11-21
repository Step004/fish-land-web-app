import { ref, set, getDatabase, update } from "firebase/database";

export async function saveUserToDatabase(userId, email, name) {
  const db = getDatabase();
  const userRef = ref(db, `users/${userId}`);
  try {
    await set(userRef, {
      uid: userId,
      email,
      name,
      origin: null,
      photo: null,
      age: null,
      number: null,
      preference: null,
      friends: [],
      gallery: [],
      posts: [],
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error saving user to database:", error);
  }
}

export async function updateUserPhoto(userId, photoUrl) {
  const db = getDatabase();
  const userRef = ref(db, `users/${userId}`);
  try {
    await update(userRef, {
      photo: photoUrl,
    });
    console.log("User photo updated successfully");
  } catch (error) {
    console.error("Error updating user photo:", error);
  }
}

export async function updateUserFields(userId, updates) {
  const db = getDatabase();
  const userRef = ref(db, `users/${userId}`);
  try {
    await update(userRef, updates);
    console.log("User fields updated successfully");
  } catch (error) {
    console.error("Error updating user fields:", error);
  }
}
