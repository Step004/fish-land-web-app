import { useEffect, useState } from "react";
import { useAuth } from "../../firebase/contexts/authContexts/index.jsx";
import css from "./MessagePage.module.css";
import Loader from "../../components/Loader/Loader.jsx";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { subscribeToChats } from "../../firebase/firebase/chats.js";
import defaultPhoto from "../../img/default-user.jpg";
import { useMediaQuery } from "react-responsive";
import { getUserById } from "../../firebase/firebase/readData.js";
import { i18n } from "../../utils/i18n";

const MessagePage = () => {
  const location = useLocation();
  const path = location.pathname;
  const isSmallScreen = useMediaQuery({ query: "(max-width: 570px)" });

  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [chats, setChats] = useState([]);
  const [anotherUsers, setAnotherUsers] = useState({});

  useEffect(() => {
    const fetchUsers = async () => {
      const usersData = {};

      for (const chat of chats) {
        const keys = Object.keys(chat.participants);
        const anotherUserId = currentUser.uid === keys[0] ? keys[1] : keys[0];

        if (!usersData[anotherUserId]) {
          usersData[anotherUserId] = await getUserById(anotherUserId);
        }
      }

      setAnotherUsers(usersData);
    };

    if (chats.length > 0) {
      fetchUsers();
    }
  }, [chats, currentUser.uid]);

  useEffect(() => {
    if (!currentUser) return;

    const unsubscribe = subscribeToChats(currentUser.uid, setChats);

    return () => unsubscribe();
  }, [currentUser]);

  if (!currentUser) return <Loader />;

  const renderChatList = () => (
    <div className={css.listOfMess}>
      <h2>{i18n.t("messagePage.titles.chatMessages")}</h2>
      <ul>
        {chats ? (
          chats.map((chat) => {
            const keys = Object.keys(chat.participants);
            const anotherUserId =
              currentUser.uid === keys[0] ? keys[1] : keys[0];
            const anotherUser = anotherUsers[anotherUserId];

            return (
              <li
                key={chat.chatId}
                onClick={() => navigate(`/message/${chat.chatId}`)}
                className={css.chatItem}
                role="button"
                tabIndex={0}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    navigate(`/message/${chat.chatId}`);
                  }
                }}
              >
                <div className={css.nameAndStatus}>
                  <div className={css.photoAndName}>
                    <img
                      src={anotherUser?.photoURL || defaultPhoto}
                      alt={i18n.t("messagePage.aria.userPhoto")}
                      className={css.photo}
                    />
                    <div className={css.nameAndLastMsg}>
                      <span>{anotherUser?.name}</span>
                      <p className={css.lastMsg}>{chat.lastMessage}</p>
                    </div>
                  </div>
                  {chat.hasUnread && (
                    <div
                      className={css.chatUnread}
                      aria-label={i18n.t("messagePage.messages.unreadMessage")}
                    ></div>
                  )}
                </div>
              </li>
            );
          })
        ) : (
          <p>{i18n.t("messagePage.messages.noChats")}</p>
        )}
      </ul>
    </div>
  );

  return (
    <div className={css.container}>
      {!isSmallScreen ? (
        <>
          {renderChatList()}
          {path === "/message" ? (
            <div className={css.listChats}>
              {i18n.t("messagePage.titles.chooseChat")}
            </div>
          ) : (
            <Outlet />
          )}
        </>
      ) : (
        <>{path === "/message" ? renderChatList() : <Outlet />}</>
      )}
    </div>
  );
};

export default MessagePage;
