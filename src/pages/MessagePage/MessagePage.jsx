import { useEffect, useState } from "react";
import { useAuth } from "../../firebase/contexts/authContexts/index.jsx";
import css from "./MessagePage.module.css";
import Loader from "../../components/Loader/Loader.jsx";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { getAllChats, subscribeToChats } from "../../firebase/firebase/chats.js";
import defaultPhoto from "../../img/default-user.jpg";
import { useMediaQuery } from "react-responsive";

const MessagePage = () => {
  const location = useLocation();
  const path = location.pathname;
  const isSmallScreen = useMediaQuery({ query: "(max-width: 570px)" });

  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [chats, setChats] = useState([]);
  console.log(currentUser);

  // useEffect(() => {
  //   const fetchChats = async () => {
  //     const chats = await getAllChats(currentUser.uid);
  //     setChats(chats);
  //   };
  //   fetchChats();
  // }, [currentUser]);
    useEffect(() => {
      if (!currentUser) return;

      // Підписка на зміни у чатах
      const unsubscribe = subscribeToChats(currentUser.uid, setChats);

      // Скасування підписки при розмонтуванні
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
                chats.map((chat) => (
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
                          src={chat.photo || defaultPhoto}
                          alt="UserPhoto"
                          className={css.photo}
                        />
                        <div className={css.nameAndLastMsg}>
                          <span>
                            {currentUser.displayName === chat.name1
                              ? chat.name2
                              : chat.name1}
                          </span>
                          <p className={css.lastMsg}>{chat.lastMessage}</p>
                        </div>
                      </div>
                      {chat.hasUnread && <div className={css.chatUnread}></div>}
                    </div>
                  </li>
                ))
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
                  chats.map((chat) => (
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
                            src={
                              (currentUser.displayName === chat.name1
                                ? chat.photo
                                : chat.photoUrl) || defaultPhoto
                            }
                            alt="UserPhoto"
                            className={css.photo}
                          />
                          <div className={css.nameAndLastMsg}>
                            <span>
                              {currentUser.displayName === chat.name1
                                ? chat.name2
                                : chat.name1}
                            </span>

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
                  ))
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
