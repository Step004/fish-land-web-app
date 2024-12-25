import Navigation from "../Navigation/Navigation.jsx";
import UserMenu from "../UserMenu/UserMenu.jsx";
import AuthNav from "../AuthNav/AuthNav.jsx";
import css from "./AppBar.module.css";

import { useAuth } from "../../firebase/contexts/authContexts/index.jsx";
import { useNavigate } from "react-router-dom";
import { useMediaQuery } from "react-responsive";

export default function AppBar() {
  const { userLoggedIn } = useAuth();
  const isLoggedIn = userLoggedIn;
  const navigate = useNavigate();
  const isTabletScreen = useMediaQuery({ query: "(min-width: 769px)" });

  return (
    <header className={css.header}>
      <p className={css.logotype} onClick={() => navigate("/")}>
        Fish Land
      </p>

      {isLoggedIn && isTabletScreen && <Navigation />}
      {isLoggedIn ? <UserMenu /> : <AuthNav />}
    </header>
  );
}
