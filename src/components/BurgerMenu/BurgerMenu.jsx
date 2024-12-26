import { NavLink, useNavigate } from "react-router-dom";
import css from "./BurgerMenu.module.css";
import { IoClose } from "react-icons/io5";
import clsx from "clsx";
import { changeOnlineStatusForLogOut } from "../../firebase/firebase/writeData.js";
import { useAuth } from "../../firebase/contexts/authContexts/index.jsx";
import { doSignOut } from "../../firebase/firebase/auth.js";

export const BurgerMenu = ({ isOpen, close }) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const buildLinkClass = ({ isActive }) => {
    return clsx(css.link, isActive && css.active);
  };
  const handleLogout = async () => {
    changeOnlineStatusForLogOut(currentUser.uid);
    await doSignOut();
    navigate("/login");
  };
  return (
    isOpen && (
      <>
        <div className={css.overlay} onClick={close}></div>
        <div className={css.burgerMenu}>
          <IoClose className={css.closeBtn} onClick={close} />
          <p className={css.logotype}>Fish Land</p>
          <nav className={css.navigation}>
            <NavLink to="/" className={buildLinkClass} onClick={close}>
              News
            </NavLink>

            <NavLink
              to="/friends/friends"
              className={buildLinkClass}
              onClick={close}
            >
              Friends
            </NavLink>
            <NavLink to="/message" className={buildLinkClass} onClick={close}>
              Message
            </NavLink>
            <NavLink to="/user" className={buildLinkClass} onClick={close}>
              My profile
            </NavLink>
          </nav>
          <button
            className={css.logout}
            onClick={() => {
              handleLogout();
              close();
            }}
          >
            Logout
          </button>
        </div>
      </>
    )
  );
};
