import css from "./UserSettingsModal.module.css";
import UserSettingsForm from "../UserSettingsForm/UserSettingsForm.jsx";

export default function UserSettingsModal({ close, user }) {

  return (
    <>
      <div className={css.overlay} onClick={close}></div>
      <div className={css.window}>
        <UserSettingsForm close={close} user={user} />
      </div>
    </>
  );
}
