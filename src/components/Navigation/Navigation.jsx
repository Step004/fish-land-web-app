import { NavLink} from "react-router-dom";
import clsx from "clsx";
import css from "./Navigation.module.css";

const buildLinkClass = ({ isActive }) => {
  return clsx(css.link, isActive && css.active);
};

export default function Navigation() {
  return (
    <>
      <nav className={css.navigation}>
        <NavLink to="/" className={buildLinkClass}>
          News
        </NavLink>

        <NavLink to="/friends/friends" className={buildLinkClass}>
          Friends
        </NavLink>
        <NavLink to="/message" className={buildLinkClass}>
          Message
        </NavLink>
        <NavLink to="/map" className={buildLinkClass}>
          Map
        </NavLink>
      </nav>
    </>
  );
}
