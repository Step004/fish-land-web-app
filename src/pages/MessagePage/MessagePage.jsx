import { useEffect, useState } from "react";
import { useAuth } from "../../firebase/contexts/authContexts/index.jsx";
import css from "./MessagePage.module.css";
import Loader from "../../components/Loader/Loader.jsx";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { subscribeToChats } from "../../firebase/firebase/chats.js";
import defaultPhoto from "../../img/default-user.jpg";
import { useMediaQuery } from "react-responsive";
import { getUserById } from "../../firebase/firebase/readData.js";

const MessagePage = () => {
  const location = useLocation();
  const path = location.pathname;
  const isSmallScreen = useMediaQuery({ query: "(max-width: 570px)" });

  const navigate = useNavigate();
  const { currentUser, userFromDB } = useAuth();
  const [chats, setChats] = useState([]);
  const [anotherUsers, setAnotherUsers] = useState({}); // Стан для збереження даних про інших користувачів

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

  return (
    <div className={css.container}>
      {!isSmallScreen ? (
        <>
          <div className={css.listOfMess}>
            <h2>Chat Messages</h2>
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
                      onClick={() => {
                        navigate(`/message/${chat.chatId}`);
                      }}
                      className={css.chatItem}
                    >
                      <div className={css.nameAndStatus}>
                        <div className={css.photoAndName}>
                          <img
                            src={anotherUser?.photoURL || defaultPhoto}
                            alt="UserPhoto"
                            className={css.photo}
                          />
                          <div className={css.nameAndLastMsg}>
                            <span>{anotherUser?.name}</span>
                            <p className={css.lastMsg}>{chat.lastMessage}</p>
                          </div>
                        </div>
                        {chat.hasUnread && (
                          <div className={css.chatUnread}></div>
                        )}
                      </div>
                    </li>
                  );
                })
              ) : (
                <p>You don`t have chats yet!</p>
              )}
            </ul>
          </div>
          {path === "/message" ? (
            <div className={css.listChats}>Choose chat!</div>
          ) : (
            <Outlet />
          )}
        </>
      ) : (
        <>
          {path === "/message" ? (
            <div className={css.listOfMess}>
              <h2>Chat Messages</h2>
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
                        onClick={() => {
                          navigate(`/message/${chat.chatId}`);
                        }}
                        className={css.chatItem}
                      >
                        <div className={css.nameAndStatus}>
                          <div className={css.photoAndName}>
                            <img
                              src={anotherUser?.photoURL || defaultPhoto}
                              alt="UserPhoto"
                              className={css.photo}
                            />
                            <div className={css.nameAndLastMsg}>
                              <span>{anotherUser?.name}</span>

                              <span className={css.lastMsg}>
                                {chat.lastMessage}
                              </span>
                            </div>
                          </div>
                          {chat.hasUnread && (
                            <div className={css.chatUnread}></div>
                          )}
                        </div>
                      </li>
                    );
                  })
                ) : (
                  <p>You don`t have chats yet!</p>
                )}
              </ul>
            </div>
          ) : (
            <Outlet />
          )}
        </>
      )}
    </div>
  );
};

export default MessagePage;
