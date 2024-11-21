import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { auth } from "./firebase.js";
import toast from "react-hot-toast";


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
    toast.error(error);
  }
};

export const doSignInWithEmailAndPassword = (email, password) => {
  return signInWithEmailAndPassword(auth, email, password);
};
export const doSignOut = () => {
  return auth.signOut();
};
