import { useState } from "react";
import AppBar from "../AppBar/AppBar.jsx";
import { Toaster } from "react-hot-toast";
import { BurgerMenu } from "../BurgerMenu/BurgerMenu.jsx";


export default function Layout({ children }) {
  const [openBurgerMenu, setOpenBurgerMenu] = useState(false);
  const handleBurgerMenuToggle = () => {
    setOpenBurgerMenu(!openBurgerMenu);
  };

  return (
    <div className="container">
      <AppBar handleBurgerMenuToggle={handleBurgerMenuToggle} />
      {children}
      <Toaster position="top-center" reverseOrder={false} />
      {openBurgerMenu && (
        <BurgerMenu isOpen={openBurgerMenu} close={handleBurgerMenuToggle} />
      )}
    </div>
  );
}
