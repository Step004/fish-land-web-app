import { useLocation, useNavigate } from "react-router-dom";
import css from "./AuthNav.module.css";

export default function AuthNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;
  

  return (
    <div className={css.buttons}>
      {path === "/login" ? (
        <button className={css.regButton} onClick={() => navigate("/register")}>
          Registration
        </button>
      ) : (
        <button className={css.logButton} onClick={() => navigate("/login")}>
          Login
        </button>
      )}
    </div>
  );
}
