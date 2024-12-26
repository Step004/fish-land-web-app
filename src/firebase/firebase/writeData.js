import { ref, set, getDatabase, update, get, push } from "firebase/database";

export async function saveUserToDatabase(userId, email, name, photoURL) {
  const db = getDatabase();
  const userRef = ref(db, `users/${userId}`);
  try {
    await set(userRef, {
      uid: userId,
      email,
      name,
      online: true,
      origin: null,
      photo: photoURL || null,
      age: null,
      number: null,
      preference: null,
      friends: [],
      gallery: [],
      posts: [],
      messages: [],
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

export async function addUserPost(userId, post) {
  const db = getDatabase();
  const userRef = ref(db, `users/${userId}/posts`);
  try {
    // Отримати поточний список постів
    const snapshot = await get(userRef);
    const existingPosts = snapshot.val() || [];

    // Додати новий пост
    const updatedPosts = [post, ...existingPosts];

    // Оновити список постів у базі даних
    await update(ref(db, `users/${userId}`), { posts: updatedPosts });

    console.log("Post added successfully");
  } catch (error) {
    console.error("Error adding user post:", error);
  }
}

export async function deleteUserPost(userId, postId) {
  const db = getDatabase();
  const userRef = ref(db, `users/${userId}/posts`);

  try {
    const snapshot = await get(userRef);
    const existingPosts = snapshot.val() || [];

    const updatedPosts = existingPosts.filter((post) => post.id !== postId);

    await update(ref(db, `users/${userId}`), { posts: updatedPosts });
  } catch (error) {
    console.error("Error deleting user post:", error);
  }
}

export async function changeOnlineStatusForLogin(userId) {
  const db = getDatabase();
  const userRef = ref(db, `users/${userId}`);

  try {
    await update(userRef, { online: true });
  } catch (error) {
    console.error("Error updating online status:", error);
  }
}
export async function changeOnlineStatusForLogOut(userId) {
  const db = getDatabase();
  const userRef = ref(db, `users/${userId}`);

  try {
    await update(userRef, { online: false });
  } catch (error) {
    console.error("Error updating online status:", error);
  }
}
export async function addFriend(userId, friendId) {
  const db = getDatabase();
  const userRef = ref(db, `users/${userId}/friends`);

  try {
    const snapshot = await get(userRef);
    const friends = snapshot.val() || {};

    // Перевірити, чи друг уже доданий
    if (friends[friendId]) {
      console.log("Friend is already in the list.");
      return;
    }

    // Додати нового друга до об'єкта
    const updatedFriends = { ...friends, [friendId]: friendId };

    // Оновити список друзів у базі даних
    await update(ref(db, `users/${userId}`), { friends: updatedFriends });

    console.log("Friend added successfully.");
  } catch (error) {
    console.error("Error adding friend:", error);
  }
}
export async function removeFriend(userId, friendId) {
  const db = getDatabase();
  const userRef = ref(db, `users/${userId}/friends`);

  try {
    const snapshot = await get(userRef);
    const friends = snapshot.val() || {};

    // Перевірити, чи друг є у списку
    if (!friends[friendId]) {
      console.log("Friend not found in the list.");
      return;
    }

    // Видалити друга з об'єкта
    const { [friendId]: _, ...updatedFriends } = friends;

    // Оновити список друзів у базі даних
    await update(ref(db, `users/${userId}`), { friends: updatedFriends });

    console.log("Friend removed successfully.");
  } catch (error) {
    console.error("Error removing friend:", error);
  }
}

export const saveAnswersToDatabase = async (userId, answers) => {
  try {
    const db = getDatabase();
    const userAnswersRef = ref(db, `users/${userId}/answers`);

    await push(userAnswersRef, {
      answers,
      completedAt: new Date().toISOString(),
    });

    console.log("Answers successfully saved to Realtime Database.");
  } catch (error) {
    console.error("Error saving answers to Realtime Database:", error);
    throw error;
  }
};
