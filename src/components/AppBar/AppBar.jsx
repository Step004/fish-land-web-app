import Navigation from "../Navigation/Navigation.jsx";
import UserMenu from "../UserMenu/UserMenu.jsx";
import AuthNav from "../AuthNav/AuthNav.jsx";
import css from "./AppBar.module.css";

import { useAuth } from "../../firebase/contexts/authContexts/index.jsx";
import { useNavigate } from "react-router-dom";
import { useMediaQuery } from "react-responsive";
import logo from "../../img/logo.svg";

export default function AppBar({ handleBurgerMenuToggle }) {
  const { userLoggedIn } = useAuth();
  const isLoggedIn = userLoggedIn;
  const navigate = useNavigate();
  const isTabletScreen = useMediaQuery({ query: "(min-width: 769px)" });

  return (
    <header className={css.header}>
      <p className={css.logotype} onClick={() => navigate("/")}>
        Fish Land
      </p>
      {/* <img className={css.logotype} src={logo} alt="" /> */}
      {isLoggedIn && isTabletScreen && <Navigation />}
      {isLoggedIn ? (
        <UserMenu handleBurgerMenuToggle={handleBurgerMenuToggle} />
      ) : (
        <AuthNav />
      )}
    </header>
  );
}
