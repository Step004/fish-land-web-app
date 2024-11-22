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

    await updateProfile(user, {
      displayName: name,
    });

    await user.reload();

    return user;
  } catch (error) {
    console.error("Error during registration:", error);
    throw new Error("This email is already in use.");
  }
};

export const doSignInWithEmailAndPassword = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    return userCredential; // Успішний результат
  } catch (error) {
    console.error(error);
    throw new Error("Incorrect login or password.Try again.");
  }
};
export const doSignOut = () => {
  return auth.signOut();
};
