import VideoCall from "../VideoCall/VideoCall.tsx";
import css from "./ModalVideoCall.module.css";
import { IoClose } from "react-icons/io5";

export const ModalVideoCall = ({ close, link }) => {
  return (
    <>
      <div className={css.overlay}></div>
      <div className={css.window}>
        <IoClose className={css.closeBtn} onClick={close} />

        <VideoCall link={link} close={close} />
      </div>
    </>
  );
};
