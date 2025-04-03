import { NavLink } from "react-router-dom";
import css from "./Navigation.module.css";
import { i18n } from "../../utils/i18n";

export default function Navigation() {
  const buildLinkClass = ({ isActive }) =>
    isActive ? `${css.link} ${css.active}` : css.link;

  return (
    <>
      <nav className={css.navigation}>
        <NavLink to="/" className={buildLinkClass}>
          {i18n.t("navigation.links.news")}
        </NavLink>

        <NavLink to="/friends/friends" className={buildLinkClass}>
          {i18n.t("navigation.links.friends")}
        </NavLink>

        <NavLink to="/message" className={buildLinkClass}>
          {i18n.t("navigation.links.messages")}
        </NavLink>

        {/* <NavLink to="/map" className={buildLinkClass}>
          {i18n.t("navigation.links.map")}
        </NavLink> */}
      </nav>
    </>
  );
}
