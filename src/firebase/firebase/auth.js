import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { auth } from "./firebase.js";
import { updateUserPhoto } from "./writeData.js";

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
    return userCredential;
  } catch (error) {
    console.error(error);
    throw new Error("Incorrect login or password.Try again.");
  }
};
export const doSignOut = () => {
  return auth.signOut();
};

export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();

  try {
    const result = await signInWithPopup(auth, provider);

    const user = result.user;

    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential.accessToken;

    console.log("Користувач авторизований:", user);
    console.log("Google Token:", token);
    await updateUserPhoto(user.uid, user.photoURL);
    return { user, token };
  } catch (error) {
    console.error("Помилка авторизації:", error);

    const errorCode = error.code;
    const errorMessage = error.message;

    throw new Error(`Авторизація не вдалася: ${errorCode} - ${errorMessage}`);
  }
};

export const updateUserDisplayName = async (newDisplayName) => {
  const user = auth.currentUser;

  if (user) {
    try {
      await updateProfile(user, {
        displayName: newDisplayName,
      });
    } catch (error) {
      console.error("Failed to update display name:", error);
      throw new Error(`Помилка: ${error.message}`);
    }
  } else {
    console.error("No user is signed in.");
    throw new Error("Користувач не авторизований.");
  }
};
export const updateUserPhotoURL = async (newPhotoURL) => {
  const user = auth.currentUser;

  if (user) {
    try {
      await updateProfile(user, {
        photoURL: newPhotoURL,
      });
    } catch (error) {
      console.error("Failed to update display name:", error);
      throw new Error(`Помилка: ${error.message}`);
    }
  } else {
    console.error("No user is signed in.");
    throw new Error("Користувач не авторизований.");
  }
};
