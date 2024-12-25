import { NavLink } from "react-router-dom";
import css from "./BurgerMenu.module.css";
import { IoClose } from "react-icons/io5";
import clsx from "clsx";

export const BurgerMenu = ({ isOpen, close }) => {
  const buildLinkClass = ({ isActive }) => {
    return clsx(css.link, isActive && css.active);
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
        </div>
      </>
    )
  );
};
