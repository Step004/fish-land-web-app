import { ref, set, getDatabase, update, get, remove } from "firebase/database";
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import { firestore } from "../firebase/firebase.js";
import { collection, addDoc } from "firebase/firestore";

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
  const postRef = ref(db, `users/${userId}/posts/${post.id}`);

  try {
    await set(postRef, post);
    console.log("Post added successfully");
  } catch (error) {
    console.error("Error adding post:", error);
    throw error;
  }
}

export async function addCommentToPost(userId, postId, comment) {
  const db = getDatabase();
  const postRef = ref(db, `users/${userId}/posts/${postId}/comments`);

  try {
    // Отримати поточний список коментарів
    const snapshot = await get(postRef);
    const existingComments = snapshot.val() || [];

    // Додати новий коментар
    const updatedComments = [...existingComments, comment];

    // Оновити список коментарів у базі даних
    await update(ref(db, `users/${userId}/posts/${postId}`), {
      comments: updatedComments,
    });

    console.log("Comment added successfully");
  } catch (error) {
    console.error("Error adding comment:", error);
  }
}

// Функція для додавання або видалення лайка до конкретного посту
export async function toggleLikeOnPost(userId, postId, likerId) {
  const db = getDatabase();
  const likesRef = ref(db, `users/${userId}/posts/${postId}/likes`);

  try {
    // Отримати поточний список лайків
    const snapshot = await get(likesRef);
    const existingLikes = snapshot.exists() ? snapshot.val() : [];

    // Перевірити, чи користувач вже поставив лайк
    const hasLiked = existingLikes.includes(likerId);
    const updatedLikes = hasLiked
      ? existingLikes.filter((id) => id !== likerId) // Видалити лайк
      : [...existingLikes, likerId]; // Додати лайк

    // Оновити тільки `likes`, не зачіпаючи інші дані поста
    await set(likesRef, updatedLikes);

    console.log(
      hasLiked ? "Like removed successfully" : "Like added successfully"
    );
  } catch (error) {
    console.error("Error toggling like:", error);
  }
}

export async function deleteUserPost(userId, postId) {
  const db = getDatabase();
  const postRef = ref(db, `users/${userId}/posts/${postId}`);

  try {
    await remove(postRef);
    console.log("Post and all its related data deleted successfully");
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
    const updatedFriends = { ...friends };
    delete updatedFriends[friendId];

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

    await set(userAnswersRef, {
      ...answers,
      completedAt: new Date().toISOString(),
    });

    console.log("Answers successfully saved to Realtime Database.");
  } catch (error) {
    console.error("Error saving answers to Realtime Database:", error);
    throw error;
  }
};

export const uploadPostImage = async (file, userId, postId) => {
  try {
    const storage = getStorage();
    const imageRef = storageRef(storage, `posts/${userId}/${postId}`);
    const snapshot = await uploadBytes(imageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
};

export const uploadGalleryImage = async (file, userId) => {
  try {
    if (!userId) {
      throw new Error("User ID is required");
    }

    const storage = getStorage();
    const imageRef = storageRef(storage, `gallery/${userId}/${Date.now()}`);
    const snapshot = await uploadBytes(imageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);

    // Отримуємо поточну галерею користувача
    const db = getDatabase();
    const userRef = ref(db, `users/${userId}`);
    const userSnapshot = await get(userRef);
    const userData = userSnapshot.val();
    const currentGallery = userData.gallery || [];

    // Додаємо нове зображення до галереї
    const updatedGallery = [
      ...currentGallery,
      {
        url: downloadURL,
        createdAt: new Date().toISOString(),
        id: Date.now().toString(),
      },
    ];

    // Оновлюємо галерею в базі даних
    await update(userRef, { gallery: updatedGallery });

    return downloadURL;
  } catch (error) {
    console.error("Error uploading gallery image:", error);
    throw error;
  }
};

const questions = [
  {
    id: 1,
    question: "Який вид риби ви найбільше любите ловити?",
    type: "single_choice",
    options: ["Щука", "Судак", "Окунь", "Короп", "Сом", "Інше"],
  },
  {
    id: 2,
    question: "Чи ви віддаєте перевагу ловлі з берега чи з човна?",
    type: "single_choice",
    options: ["З берега", "З човна", "Без різниці"],
  },
  {
    id: 3,
    question: "Який стиль риболовлі вам подобається?",
    type: "multiple_choice",
    options: ["Спінінг", "Поплавкова вудка", "Фідер", "Тролінг", "Інше"],
  },
  {
    id: 4,
    question: "Чи любите ви риболовлю вночі?",
    type: "single_choice",
    options: ["Так", "Ні"],
  },
  {
    id: 5,
    question: "Які умови водойми для вас є прийнятними?",
    type: "multiple_choice",
    options: ["Озеро", "Річка", "Водосховище", "Ставок"],
  },
  {
    id: 6,
    question:
      "Який максимальний радіус відстані від вашого місцезнаходження для риболовлі?",
    type: "number",
    unit: "км",
  },
  {
    id: 7,
    question: "Які зручності для вас важливі?",
    type: "multiple_choice",
    options: [
      "Парковка",
      "Місця для кемпінгу",
      "Магазин поруч",
      "Човновий причал",
      "Чистота місцевості",
    ],
  },
  {
    id: 8,
    question: "Чи потрібна вам інформація про місця з платною риболовлею?",
    type: "single_choice",
    options: ["Так", "Ні"],
  },
  {
    id: 9,
    question: "Вкажіть ваш досвід у риболовлі.",
    type: "single_choice",
    options: ["Початківець", "Любитель", "Професіонал"],
  },
  {
    id: 10,
    question: "Чи є у вас переваги щодо погоди для риболовлі?",
    type: "single_choice",
    options: ["Сонячно", "Похмуро", "Дощ", "Без різниці"],
  },
];

// Функція для додавання місця
export const addPlaceToFirestore = async (name, location, type, answers) => {
  try {
    // Отримуємо посилання на колекцію "places"
    const placesCollectionRef = collection(firestore, "places");

    // Створюємо об'єкт місця
    const placeData = {
      name: name,
      location: location,
      type: type,
      answers: {}, // Відповіді будуть зберігатися тут
    };

    // Перебираємо питання і додаємо відповідь у поле "answers"
    questions.forEach((question) => {
      placeData.answers[question.id] = answers[question.id] || null; // Зберігаємо відповідь на конкретне питання
    });

    // Додаємо нове місце в Firestore з автоматичним створенням id
    const docRef = await addDoc(placesCollectionRef, placeData);
    console.log(`Місце успішно додано в Firestore з id: ${docRef.id}`);
  } catch (error) {
    console.error("Помилка при додаванні місця:", error);
  }
};
