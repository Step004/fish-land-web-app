import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import { getDatabase, ref as dbRef, update } from "firebase/database";
import { storage } from "./firebase.js";

export async function uploadImageToStorage(userId, imageFile) {
  try {
    const imageRef = storageRef(
      storage,
      `users/${userId}/images/${imageFile.name}`
    );

    const snapshot = await uploadBytes(imageRef, imageFile);

    const downloadURL = await getDownloadURL(snapshot.ref);

    const db = getDatabase();
    const userRef = dbRef(db, `users/${userId}`);

    await update(userRef, {
      [`gallery/${Date.now()}`]: {
        url: downloadURL,
        name: imageFile.name,
        uploadedAt: new Date().toISOString(),
      },
    });

    console.log("Зображення успішно завантажено");
    return downloadURL;
  } catch (error) {
    console.error("Помилка при завантаженні зображення:", error);
    throw error;
  }
}

export async function updateUserPhoto(userId, imageFile) {
  try {
    const imageRef = storageRef(
      storage,
      `users/${userId}/profile/${imageFile.name}`
    );

    // Завантажуємо файл у Storage
    const snapshot = await uploadBytes(imageRef, imageFile);

    // Отримуємо URL завантаженого зображення
    const downloadURL = await getDownloadURL(snapshot.ref);

    // Оновлюємо фото профілю користувача
    const db = getDatabase();
    const userRef = dbRef(db, `users/${userId}`);

    await update(userRef, {
      photoURL: downloadURL,
    });

    console.log("Фото профілю успішно оновлено");
    return downloadURL;
  } catch (error) {
    console.error("Помилка при оновленні фото профілю:", error);
    throw error;
  }
}
