import { useNavigate, useParams } from "react-router-dom";
import css from "./Messages.module.css";
import defaultPhoto from "../../img/default-user.jpg";
import { useAuth } from "../../firebase/contexts/authContexts/index.jsx";
import { useEffect, useRef, useState } from "react";
import {
  deleteChat,
  getChatById,
  listenForMessages,
  markAllMessagesAsRead,
  sendMessage,
} from "../../firebase/firebase/chats.js";
import { deleteCallById, endCall } from "../../firebase/firebase/calls.js";
import { servers } from "../../utils/servers.js";
import { ModalVideoCall } from "../ModalVideoCall/ModalVideoCall.jsx";
import { IoArrowBackSharp } from "react-icons/io5";
import Loader from "../Loader/Loader.jsx";
import { IoMdMore } from "react-icons/io";
import toast from "react-hot-toast";
import { MdAddIcCall } from "react-icons/md";
import { FiPhoneCall } from "react-icons/fi";
import { useMediaQuery } from "react-responsive";
import { IoSendSharp } from "react-icons/io5";
import { doc, onSnapshot } from "firebase/firestore";
import { firestore } from "../../firebase/firebase/firebase.js";
import { getUserById } from "../../firebase/firebase/readData.js";
import { i18n } from "../../utils/i18n";

export default function Messages() {
  const { chatId } = useParams();
  const { currentUser, userFromDB } = useAuth();
  const [messages, setMessages] = useState([]);
  const [callModal, setCallModal] = useState(false);
  const [link, setLink] = useState("");
  const [value, setValue] = useState("");
  const [statusCall, setStatusCall] = useState(null);
  const [currentChat, setCurrentChat] = useState("");
  const listMessRef = useRef(null);
  const [isOpenMore, setIsOpenMore] = useState(false);
  const [anotherUser, setAnotherUser] = useState(null);
  const navigate = useNavigate();

  const isTabletScreen = useMediaQuery({ query: "(max-width: 768px)" });

  useEffect(() => {
    markAllMessagesAsRead(chatId, currentUser.uid);
  }, [chatId, currentUser]);
  useEffect(() => {
    const fetchAnotherUser = async () => {
      const keys = Object.keys(currentChat.participants);
      if (currentUser.uid === keys[0]) {
        const data = await getUserById(keys[1]);
        setAnotherUser(data);
      } else {
        const data = await getUserById(keys[0]);
        setAnotherUser(data);
      }
    };
    if (currentChat) {
      fetchAnotherUser();
    }
  }, [currentUser, currentChat]);

  useEffect(() => {
    if (!link) return;

    const callDocRef = doc(firestore, "calls", link);

    const unsubscribe = onSnapshot(callDocRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const data = docSnapshot.data();
        setStatusCall(data.status);
      } else {
        console.log("Call document does not exist.");
        setStatusCall(null);
      }
    });

    return () => unsubscribe();
  }, [link]);

  useEffect(() => {
    const fetchChat = async (chatId) => {
      try {
        const chat = await getChatById(chatId);
        if (chat) {
          setCurrentChat(chat);
        } else {
          console.log("Chat not found.");
        }
      } catch (error) {
        console.error("Error fetching chat:", error);
      }
    };
    fetchChat(chatId);
  }, [chatId]);

  const handleOpenMore = () => {
    setIsOpenMore(!isOpenMore);
  };
  if (currentChat) {
    <Loader />;
  }
  useEffect(() => {
    if (listMessRef.current) {
      listMessRef.current.scrollTop = listMessRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    const unsubscribe = listenForMessages(chatId, (newMessage) => {
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    });

    return () => {
      unsubscribe();
      setMessages([]);
    };
  }, [chatId]);

  const handleSendMessage = async () => {
    if (!value.trim()) return;

    try {
      await sendMessage(
        chatId,
        currentUser.displayName,
        currentUser.photoURL,
        currentUser.uid,
        value
      );
      setValue("");
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };
  const pc = useRef(null);
  useEffect(() => {
    if (typeof window !== "undefined") {
      pc.current = new RTCPeerConnection(servers);
    }
    return () => {
      if (pc.current) {
        pc.current.close();
      }
    };
  }, []);
  const handleCall = () => {
    setCallModal(!callModal);
  };
  const handlePhone = async () => {
    if (!pc.current) {
      console.error("PeerConnection is not initialized");
      return;
    }
    handleCall();
  };
  const isLastLink = (msg) => {
    const linkMessages = messages.filter((message) =>
      message.content.startsWith("Link:")
    );
    return (
      linkMessages.length > 0 && linkMessages[linkMessages.length - 1] === msg
    );
  };
  const callForm = (msg) => {
    const parts = msg.content.split(":");
    if (currentUser.uid === msg.senderId) {
      return link ? (
        <button
          onClick={async () => {
            await deleteCallById(parts[1]);
            endCall(link);
            setLink("");
          }}
        >
          {i18n.t("messagePage.buttons.endCall")}
        </button>
      ) : (
        <p>{i18n.t("messagePage.calls.ended")}</p>
      );
    }
    return (
      <div className={css.answersOnCall}>
        {statusCall === "active" || statusCall == null ? (
          <>
            <button
              className={css.rejectCall}
              onClick={async () => {
                deleteCallById(parts[1]);
                endCall(link);
                setLink("");
              }}
            >
              <MdAddIcCall className={css.rejectCallIcon} />
            </button>
            <button
              className={css.joinToCall}
              onClick={() => {
                handleCall();
                setLink(parts[1]);
              }}
            >
              <FiPhoneCall className={css.joinToCallIcon} />
            </button>
          </>
        ) : (
          <p>{i18n.t("messagePage.calls.ended")}</p>
        )}
      </div>
    );
  };

  return (
    <div className={css.containerMsg}>
      <div className={css.listMess} ref={listMessRef}>
        <div className={css.settings}>
          <button
            className={css.buttonBack}
            onClick={() => navigate("/message")}
            aria-label={i18n.t("messagePage.buttons.back")}
          >
            <IoArrowBackSharp className={css.iconBack} />
          </button>
          <div className={css.nameAndPhotoCont}>
            <div
              className={css.nameAndPhoto}
              onClick={() => {
                const keys = Object.keys(currentChat.participants);
                if (currentUser.uid === keys[0]) {
                  navigate(`/friends/${keys[1]}`);
                } else navigate(`/friends/${keys[0]}`);
              }}
            >
              <p>{anotherUser?.name}</p>
              <img
                src={anotherUser?.photoURL || defaultPhoto}
                alt={i18n.t("messagePage.aria.userPhoto")}
                className={css.photo}
              />
            </div>
            <IoMdMore className={css.iconMore} onClick={handleOpenMore} />
            {isOpenMore && (
              <div className={css.menu}>
                <ul>
                  <li
                    onClick={() => {
                      handleOpenMore();
                      deleteChat(currentChat.chatId);
                      toast(i18n.t("messagePage.messages.deleteChat"));
                    }}
                  >
                    {i18n.t("messagePage.buttons.deleteChat")}
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
        <ul>
          {messages.map((msg) => {
            const parts = msg.content.split(":");

            if (parts[0] === "Link") {
              return (
                <li
                  key={msg.id}
                  className={css.message}
                  style={{
                    margin: 10,
                    backgroundColor:
                      currentUser.uid === msg.senderId
                        ? "rgb(65, 64, 148)"
                        : "rgb(23, 22, 126)",
                    marginLeft:
                      currentUser.uid === msg.senderId ? "auto" : "10px",
                    width: "fit-content",
                    padding: 5,
                    color: "white",
                  }}
                >
                  <div className={css.photoAndName}>
                    <img
                      src={
                        msg.senderId === currentUser?.uid
                          ? userFromDB?.photoURL || defaultPhoto
                          : anotherUser?.photoURL || defaultPhoto
                      }
                      alt={i18n.t("messagePage.aria.userPhoto")}
                      className={css.photo}
                    />
                    <p>{msg.name}</p>
                  </div>
                  {isLastLink(msg)
                    ? callForm(msg)
                    : i18n.t("messagePage.calls.ended")}
                </li>
              );
            }
            return (
              <li
                key={msg.id}
                className={css.message}
                style={{
                  margin: 10,
                  backgroundColor:
                    currentUser.uid === msg.senderId
                      ? "rgb(65, 64, 148)"
                      : "rgb(23, 22, 126)",
                  marginLeft:
                    currentUser.uid === msg.senderId ? "auto" : "10px",
                  width: "fit-content",
                  padding: 5,
                  color: "white",
                  borderRadius: "10px",
                }}
              >
                <div className={css.photoAndName}>
                  <img
                    src={
                      msg.senderId === currentUser?.uid
                        ? userFromDB?.photoURL || defaultPhoto
                        : anotherUser?.photoURL || defaultPhoto
                    }
                    alt={i18n.t("messagePage.aria.userPhoto")}
                    className={css.photo}
                  />
                  <p>{msg.name}</p>
                </div>
                <p className={css.msgContent}>{msg.content}</p>
              </li>
            );
          })}
        </ul>
      </div>
      <div className={css.inputButton}>
        <input
          className={css.inputMsg}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={i18n.t("messagePage.placeholders.messageInput")}
        />
        <button className={css.sendButton} onClick={handleSendMessage}>
          {isTabletScreen ? (
            <IoSendSharp />
          ) : (
            i18n.t("messagePage.buttons.send")
          )}
        </button>
        <button
          className={css.joinToCall}
          onClick={() => {
            handlePhone();
          }}
        >
          <FiPhoneCall className={css.joinToCallIcon} />
        </button>
      </div>
      {callModal && (
        <ModalVideoCall chatId={chatId} link={link} close={handleCall} />
      )}
    </div>
  );
}
