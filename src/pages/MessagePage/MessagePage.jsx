import { useEffect, useState } from "react";
import { useAuth } from "../../firebase/contexts/authContexts/index.jsx";
import css from "./MessagePage.module.css";
import Loader from "../../components/Loader/Loader.jsx";
import { Outlet, useNavigate } from "react-router-dom";
import { getAllChats } from "../../firebase/firebase/chats.js";

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
          {chats.map((chat) => (
            <li
              key={chat.chatId}
              onClick={() => navigate(`/message/${chat.chatId}`)}
            >
              <div className={css.photoAndName}>
                <div>
                  {/* <span>{chat.name}</span> */}
                  <span>{chat.lastMessage}</span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <Outlet />
    </div>
  );
};

export default MessagePage;
