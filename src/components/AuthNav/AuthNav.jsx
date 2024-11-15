import { useNavigate } from "react-router-dom";
import css from "./AuthNav.module.css";

export default function AuthNav() {
  const navigate = useNavigate();

  return (
    <div className={css.buttons}>
      <button className={css.logButton} onClick={() => navigate("/login")}>
        Login
      </button>
      <button className={css.regButton} onClick={() => navigate("/register")}>
        Registration
      </button>
    </div>
  );
}
