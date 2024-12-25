import { useNavigate } from "react-router-dom";
import { doSignOut } from "../../firebase/firebase/auth.js";
import css from "./UserMenu.module.css";
import { FaRegUserCircle } from "react-icons/fa";
import { useAuth } from "../../firebase/contexts/authContexts/index.jsx";
import { useEffect, useState } from "react";
import { getUserById } from "../../firebase/firebase/readData.js";
import { changeOnlineStatusForLogOut } from "../../firebase/firebase/writeData.js";
import { useMediaQuery } from "react-responsive";
import { GiHamburgerMenu } from "react-icons/gi";

export default function UserMenu({ handleBurgerMenuToggle }) {
  const { currentUser } = useAuth();
  const [user, setUser] = useState(currentUser);
  const navigate = useNavigate();
  const isTabletScreen = useMediaQuery({ query: "(min-width: 768px)" });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getUserById(currentUser.uid);
        setUser(userData);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUser();
  }, [currentUser]);

  const handleLogout = async () => {
    changeOnlineStatusForLogOut(currentUser.uid);
    await doSignOut();
    navigate("/login");
  };

  const userPhoto = currentUser.photoURL ? (
    <img src={currentUser.photoURL} alt="UserPhoto" className={css.userIcon} />
  ) : (
    <FaRegUserCircle className={css.userIcon} />
  );

  return (
    <div className={css.wrapper}>
      <div className={css.userNameContainer}>
        {userPhoto}
        <p className={css.username} onClick={() => navigate("/user")}>
          {user?.name || currentUser.displayName}
        </p>
      </div>
      {isTabletScreen && (
        <button className={css.logout} onClick={handleLogout}>
          Logout
        </button>
      )}
      <GiHamburgerMenu
        className={css.burgerSvg}
        onClick={handleBurgerMenuToggle}
      />
    </div>
  );
}
