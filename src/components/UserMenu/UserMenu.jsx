import { useNavigate } from "react-router-dom";
import { doSignOut } from "../../firebase/firebase/auth.js";
import css from "./UserMenu.module.css";
import { FaRegUserCircle } from "react-icons/fa";
import { useAuth } from "../../firebase/contexts/authContexts/index.jsx";
import { IoIosLogOut } from "react-icons/io";
import { useEffect, useState } from "react";
import { getUserById } from "../../firebase/firebase/readData.js";
import { changeOnlineStatusForLogOut } from "../../firebase/firebase/writeData.js";

export default function UserMenu() {
  const { currentUser } = useAuth();
  const [user, setUser] = useState(currentUser);
  const navigate = useNavigate();
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
  return (
    <div className={css.wrapper}>
      <div className={css.userNameContainer}>
        <FaRegUserCircle className={css.userIcon} />
        <p className={css.username} onClick={() => navigate("/user")}>
          {user?.name || currentUser.displayName}
        </p>
      </div>

      <button className={css.logout} onClick={handleLogout}>
        Logout
      </button>
      <IoIosLogOut className={css.logoutSVG} onClick={handleLogout} />
    </div>
  );
}
