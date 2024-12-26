import { useEffect, useState } from "react";
import AppBar from "../AppBar/AppBar.jsx";
import { Toaster } from "react-hot-toast";
import { BurgerMenu } from "../BurgerMenu/BurgerMenu.jsx";
import UserStatus from "../UserStatus/UserStatus.jsx";
import { useAuth } from "../../firebase/contexts/authContexts/index.jsx";
import { subscribeToChatsAndMessages } from "../../firebase/firebase/chats.js";

export default function Layout({ children }) {
  const [openBurgerMenu, setOpenBurgerMenu] = useState(false);
  const handleBurgerMenuToggle = () => {
    setOpenBurgerMenu(!openBurgerMenu);
  };
  const { currentUser } = useAuth();
  useEffect(() => {
    if (currentUser) {
      const unsubscribe = subscribeToChatsAndMessages(currentUser.uid);
      return () => unsubscribe();
    }
  }, [currentUser]);

  return (
    <div className="container">
      <AppBar handleBurgerMenuToggle={handleBurgerMenuToggle} />
      <UserStatus />
      {children}
      <Toaster position="top-center" reverseOrder={false} />
      {openBurgerMenu && (
        <BurgerMenu isOpen={openBurgerMenu} close={handleBurgerMenuToggle} />
      )}
    </div>
  );
}
