import { useNavigate, useLocation } from "react-router-dom";
import css from "./AuthNav.module.css";
import { i18n } from "../../utils/i18n";

export default function AuthNav() {
  const navigate = useNavigate();
  const { pathname: path } = useLocation();

  return (
    <div className={css.buttons}>
      {path === "/login" ? (
        <button className={css.regButton} onClick={() => navigate("/register")}>
          {i18n.t("auth.buttons.registration")}
        </button>
      ) : (
        <button className={css.logButton} onClick={() => navigate("/login")}>
          {i18n.t("auth.buttons.login")}
        </button>
      )}
    </div>
  );
}
