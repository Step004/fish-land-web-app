import { useParams } from "react-router-dom";
import css from "./Messages.module.css";
import defaultPhoto from "../../img/default-user.jpg";
import { useAuth } from "../../firebase/contexts/authContexts/index.jsx";
import { useEffect, useRef, useState } from "react";
import {
  listenForMessages,
  sendMessage,
} from "../../firebase/firebase/chats.js";
import { FaPhone } from "react-icons/fa";
import {
  createCallWithLink,
  deleteCallById,
} from "../../firebase/firebase/calls.js";
import { servers } from "../../utils/servers.js";
import { ModalVideoCall } from "../ModalVideoCall/ModalVideoCall.jsx";

export default function Messages() {
  const { chatId } = useParams();
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState([]);
  const [callModal, setCallModal] = useState(false);
  const [link, setLink] = useState("");
  const [value, setValue] = useState("");
  const [join, setJoin] = useState(false);
  const listMessRef = useRef(null);
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

    // const link = await createCallWithLink(pc.current);
    // console.log(link);
    // setLink(link);

    // const callMessage = `Link:${link}`;
    // console.log(callMessage);

    // try {
    //   await sendMessage(
    //     chatId,
    //     currentUser.displayName,
    //     currentUser.photoURL,
    //     currentUser.uid,
    //     callMessage
    //   );
    //   setValue("");
    // } catch (error) {
    //   console.error("Failed to send message:", error);
    // }

    // if (link) {
    //   console.log("Call created, link:", link);
    // } else {
    //   console.error("Failed to create call");
    // }
  };
  const callForm = (msg) => {
    const parts = msg.content.split(":");
    if (currentUser.uid === msg.senderId) {
      return (
        <button
          onClick={async () => {
            deleteCallById(parts[1]);
          }}
        >
          Закінчити
        </button>
      );
    }
    return (
      <div>
        <button
          onClick={async () => {
            deleteCallById(parts[1]);
          }}
        >
          Відхилити
        </button>
        <button
          onClick={() => {
            handleCall();
            setJoin(true);
          }}
        >
          Приєлнатись за поссиланням
        </button>
      </div>
    );
  };

  return (
    <div className={css.containerMsg}>
      <div className={css.listMess} ref={listMessRef}>
        <ul>
          {messages.map((msg) => {
            // const parts = msg.content.split(":");

            // if (parts[0] === "Link") {
            //   return (
            //     <li
            //       key={msg.id}
            //       className={css.message}
            //       style={{
            //         margin: 10,
            //         border:
            //           currentUser.uid === msg.senderId
            //             ? "2px solid green"
            //             : "1px dashed red",
            //         marginLeft:
            //           currentUser.uid === msg.senderId ? "auto" : "10px",
            //         width: "fit-content",
            //         padding: 5,
            //         color: "white",
            //       }}
            //     >
            //       <div className={css.photoAndName}>
            //         <img
            //           src={msg.photo || defaultPhoto}
            //           alt="UserPhoto"
            //           className={css.photo}
            //         />
            //         <p>{msg.name}</p>
            //       </div>
            //       {callForm(msg)}
            //     </li>
            //   );
            // }
            return (
              <li
                key={msg.id}
                className={css.message}
                style={{
                  margin: 10,
                  border:
                    currentUser.uid === msg.senderId
                      ? "2px solid green"
                      : "1px dashed red",
                  marginLeft:
                    currentUser.uid === msg.senderId ? "auto" : "10px",
                  width: "fit-content",
                  padding: 5,
                  color: "white",
                }}
              >
                <div className={css.photoAndName}>
                  <img
                    src={msg.photo || defaultPhoto}
                    alt="UserPhoto"
                    className={css.photo}
                  />
                  <p>{msg.name}</p>
                </div>
                <p>{msg.content}</p>
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
          placeholder="Your text..."
        />
        <button className={css.sendButton} onClick={handleSendMessage}>
          Send
        </button>
        <button className={css.phoneButton} onClick={handlePhone}>
          <FaPhone />
        </button>
      </div>
      {callModal && (
        <ModalVideoCall close={handleCall} link={link} join={join} />
      )}
    </div>
  );
}
