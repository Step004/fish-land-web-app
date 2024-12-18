import UserSettingsForm from "../UserSettingsForm/UserSettingsForm.jsx";
import css from "./ModalQuestion.module.css";
export default function ModalQuestion({ close }) {
  return (
    <>
      <div className={css.overlay} onClick={close}></div>
      <div className={css.window}>
        sdsd
      </div>
    </>
  );
}
