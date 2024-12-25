import css from "./FriendListPage.module.css";
import { NavLink, Outlet } from "react-router-dom";
import clsx from "clsx";

export default function FriendListPage() {
  const buildLinkClass = ({ isActive }) => {
    return clsx(css.link, isActive && css.active);
  };
  return (
    <section className={css.container}>
      <ul className={css.listNav}>
        <li>
          <NavLink to="friends" className={buildLinkClass}>
            Friends
          </NavLink>
        </li>
        <li>
          <NavLink to="users" className={buildLinkClass}>
            All users
          </NavLink>
        </li>
      </ul>
      <div className={css.outletCont}>
        <Outlet />
      </div>
    </section>
  );
}
