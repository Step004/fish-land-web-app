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
import { createCallWithLink } from "../../firebase/firebase/calls.js";
import { servers } from "../../utils/servers.js";

export default function Messages() {
  const { chatId } = useParams();
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState([]);
  const [value, setValue] = useState("");
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
  const handlePhone = async () => {
    if (!pc.current) {
      console.error("PeerConnection is not initialized");
      return;
    }

    const link = await createCallWithLink(pc.current);
    console.log(link);

    try {
      await sendMessage(chatId, currentUser.displayName, currentUser.uid, link);
      setValue("");
    } catch (error) {
      console.error("Failed to send message:", error);
    }

    if (link) {
      console.log("Call created, link:", link);
    } else {
      console.error("Failed to create call");
    }
  };
  return (
    <div className={css.containerMsg}>
      <div className={css.listMess} ref={listMessRef}>
        <ul>
          {messages.map((msg) => (
            <li
              key={msg.id}
              className={css.message}
              style={{
                margin: 10,
                border:
                  currentUser.uid === msg.senderId
                    ? "2px solid green"
                    : "1px dashed red",
                marginLeft: currentUser.uid === msg.senderId ? "auto" : "10px",
                width: "fit-content",
                padding: 5,
                color: "white",
              }}
            >
              <div className={css.photoAndName}>
                <img
                  src={msg.photoURL || defaultPhoto}
                  alt="UserPhoto"
                  className={css.photo}
                />
                <p>{msg.name || "Anonymous"}</p>
              </div>
              <p>{msg.content}</p>
            </li>
          ))}
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
    </div>
  );
}
