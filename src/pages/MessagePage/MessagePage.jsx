import { useEffect, useState } from "react";
import { useAuth } from "../../firebase/contexts/authContexts/index.jsx";
import css from "./MessagePage.module.css";
import Loader from "../../components/Loader/Loader.jsx";
import { Outlet, useNavigate } from "react-router-dom";
import { getAllChats } from "../../firebase/firebase/chats.js";
import defaultPhoto from "../../img/default-user.jpg";

const MessagePage = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [chats, setChats] = useState([]);
  useEffect(() => {
    const fetchChats = async () => {
      const chats = await getAllChats(currentUser.uid);
      setChats(chats);
    };
    fetchChats();
  }, [currentUser]);
  // console.log("currentUser", currentUser.uid);

  // console.log(Object.keys.chats[0].participants);
  if (!currentUser) return <Loader />;

  return (
    <div className={css.container}>
      <div className={css.listOfMess}>
        <h2>Chat Messages</h2>
        <ul>
          {chats ? (
            chats.map((chat) => (
              <li
                key={chat.chatId}
                onClick={() => {
                  navigate(`/message/${chat.chatId}`);
                }}
                style={{ cursor: "pointer" }}
              >
                <div className={css.photoAndName}>
                  <img
                    src={chat.photoURL || defaultPhoto}
                    alt="UserPhoto"
                    className={css.photo}
                  />
                  <div className={css.nameAndLastMsg}>
                    <span>{chat.name || "ann"}</span>
                    <span className={css.lastMsg}>{chat.lastMessage}</span>
                  </div>
                </div>
              </li>
            ))
          ) : (
            <p>You don`t have chats yet!</p>
          )}
        </ul>
      </div>

      <Outlet />
    </div>
  );
};

export default MessagePage;
