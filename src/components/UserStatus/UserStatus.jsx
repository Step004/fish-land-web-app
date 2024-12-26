import { useEffect } from "react";
import { useAuth } from "../../firebase/contexts/authContexts/index.jsx";
import {
  changeOnlineStatusForLogin,
  changeOnlineStatusForLogOut,
} from "../../firebase/firebase/writeData.js";

export default function UserStatus() {
  const { currentUser } = useAuth();
  const timeoutDuration = 10 * 60 * 1000;
  let timeoutId;

  const setOffline = () => {
    changeOnlineStatusForLogOut(currentUser.uid);
  };

  const resetTimer = () => {
    changeOnlineStatusForLogin(currentUser.uid);
    clearTimeout(timeoutId);
    timeoutId = setTimeout(setOffline, timeoutDuration);
  };

  useEffect(() => {
    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keydown", resetTimer);
    window.addEventListener("click", resetTimer);

    timeoutId = setTimeout(setOffline, timeoutDuration);

    return () => {
      // Очистити слухачі подій і таймер під час демонтовання компонента
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keydown", resetTimer);
      window.removeEventListener("click", resetTimer);
      clearTimeout(timeoutId);
    };
  }, []);

  return <></>;
}
