import React, { useContext, useEffect, useState } from "react";
import { auth } from "../../firebase/firebase.js";
import { onAuthStateChanged } from "firebase/auth";
import { getUserById } from "../../firebase/readData.js";

const AuthContext = React.createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userFromDB, setUserFromDB] = useState(null);
  const [userLoggedIn, setUserLoggedIn] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, initializeUser);
    return unsubscribe;
  }, []);

  async function initializeUser(user) {
    if (user) {
      setCurrentUser({
        ...user,
        name: user.displayName,
        origin: "",
        photo: user.photoURL || null,
        age: null,
        number: null,
        preference: null,
        friends: [],
        gallery: [],
        posts: [],
        createdAt: new Date().toISOString(),
      });
      setUserLoggedIn(true);
    } else {
      setUserLoggedIn(false);
      setCurrentUser(null);
    }
    // await user.reload();

    setLoading(false);
  }
  function updateCurrentUser(updates) {
    setCurrentUser((prev) => ({
      ...prev,
      ...updates,
    }));
  }
  useEffect(() => {
    const fetchUser = async () => {
      const data = await getUserById(currentUser.uid);
      setUserFromDB(data);
    };
    if (currentUser) fetchUser();
  }, [currentUser]);
  const value = { currentUser,userFromDB, userLoggedIn, loading, updateCurrentUser };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
