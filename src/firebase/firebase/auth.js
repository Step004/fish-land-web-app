import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { auth } from "./firebase.js";

export const doCreateUserWithEmailAndPassword = async (
  email,
  password,
  name
) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;    

    // Оновлюємо профіль користувача, додаючи ім'я
    await updateProfile(user, {
      displayName: name,
    });

    // Оновлюємо користувача після зміни профілю
    await user.reload();
    
    return user;
  } catch (error) {
    console.error("Error during registration:", error);
  }
};

export const doSignInWithEmailAndPassword = (email, password) => {
  return signInWithEmailAndPassword(auth, email, password);
};
export const doSignOut = () => {
  return auth.signOut();
};
