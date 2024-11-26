import { useParams } from "react-router-dom";
import css from "./Messages.module.css";
import defaultPhoto from "../../img/default-user.jpg";
import { useAuth } from "../../firebase/contexts/authContexts/index.jsx";
import { useEffect, useRef, useState } from "react";
import {
  listenForMessages,
  sendMessage,
} from "../../firebase/firebase/chats.js";

export default function Messages() {
  const { chatId } = useParams(); // Отримуємо chatId з маршруту
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

    return () => unsubscribe(); // Відписка при демонтованому компоненті
  }, [chatId]);

  const handleSendMessage = async () => {
    if (!value.trim()) return;

    try {
      await sendMessage(chatId, currentUser.uid, value);
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
                <p>{msg.displayName || "Anonymous"}</p>
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
      </div>
    </div>
  );
}
