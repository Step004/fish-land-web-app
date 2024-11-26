import Navigation from "../Navigation/Navigation.jsx";
import UserMenu from "../UserMenu/UserMenu.jsx";
import AuthNav from "../AuthNav/AuthNav.jsx";
import css from "./AppBar.module.css";

import { useAuth } from "../../firebase/contexts/authContexts/index.jsx";
import { useNavigate } from "react-router-dom";

export default function AppBar() {
  const { userLoggedIn } = useAuth();
  const isLoggedIn = userLoggedIn;
  const navigate = useNavigate();

  return (
    <header className={css.header}>
      <p className={css.logotype} onClick={()=>navigate('/')}>Fish Land</p>
      {isLoggedIn && <Navigation />}
      {isLoggedIn ? <UserMenu /> : <AuthNav />}
    </header>
  );
}
