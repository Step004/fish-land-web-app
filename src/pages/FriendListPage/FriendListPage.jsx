import css from "./FriendListPage.module.css";
import { NavLink, Outlet } from "react-router-dom";
import clsx from "clsx";
import { i18n } from "../../utils/i18n";

export default function FriendListPage() {
  const buildLinkClass = ({ isActive }) => {
    return clsx(css.link, isActive && css.active);
  };
  return (
    <section className={css.container}>
      <ul className={css.listNav}>
        <li>
          <NavLink to="friends" className={buildLinkClass}>
            {i18n.t("navigation.links.friends")}
          </NavLink>
        </li>
        <li>
          <NavLink to="users" className={buildLinkClass}>
            {i18n.t("friendListPage.links.users")}
          </NavLink>
        </li>
      </ul>
      <div className={css.outletCont}>
        <Outlet />
      </div>
    </section>
  );
}
