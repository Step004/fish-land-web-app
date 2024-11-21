import AddPostForm from "../AddPostForm/AddPostForm.jsx";
import css from "./AddPostModal.module.css";
export default function AddPostModal({ close }) {
  return (
    <>
      <div className={css.overlay} onClick={close}></div>
      <div className={css.window}>
        <AddPostForm close={close} />
      </div>
    </>
  );
}
