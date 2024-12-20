import VideoCall from "../VideoCall/VideoCall.jsx";
import css from "./ModalVideoCall.module.css";
import { IoClose } from "react-icons/io5";

export const ModalVideoCall = ({ chatId, link, close, join }) => {
  return (
    <>
      <div className={css.overlay}></div>
      <div className={css.window}>
        <IoClose className={css.closeBtn} onClick={close} />

        <VideoCall chatId={chatId} link={link} close={close} join={join} />
      </div>
    </>
  );
};
