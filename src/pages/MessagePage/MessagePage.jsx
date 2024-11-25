import { useState } from "react";
import { useAuth } from "../../firebase/contexts/authContexts/index.jsx";
import { firestore } from "../../firebase/firebase/firebase.js";
import css from "./MessagePage.module.css";
import Loader from "../../components/Loader/Loader.jsx";
import { useCollectionData } from "react-firebase-hooks/firestore";
import {
  addDoc,
  collection,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { query } from "firebase/database";
import defaultPhoto from "../../img/default-user.jpg";

const MessagePage = () => {
  const { currentUser } = useAuth();
  const [value, setValue] = useState("");

  // Запит Firestore для отримання повідомлень
  const messagesQuery = query(
    collection(firestore, "messages"),
    orderBy("createdAt")
  );

  const [messages, loading] = useCollectionData(messagesQuery);

  const sendMessage = async () => {
    if (!value.trim()) return;

    await addDoc(collection(firestore, "messages"), {
      uid: currentUser.uid,
      displayName: currentUser.displayName,
      photoURL: currentUser.photoURL,
      text: value,
      createdAt: serverTimestamp(),
    });
    setValue("");
  };

  if (loading) return <Loader />;
  return (
    <div className={css.container}>
      <div className={css.containerMsg}>
        {messages?.map((msg, index) => (
          <div
            key={index}
            className={css.message}
            style={{
              margin: 10,
              border:
                currentUser.uid === msg.uid
                  ? "2px solid green"
                  : "1px dashed red",
              marginLeft: currentUser.uid === msg.uid ? "auto" : "10px",
              width: "fit-content",
              padding: 5,
              color: "white",
            }}
          >
            <div className={css.photoAndName}>
              {msg.photoURL ? (
                <img src={msg.photoURL} alt="UserPhoto" className={css.photo} />
              ) : (
                <img src={defaultPhoto} alt="UserPhoto" className={css.photo} />
              )}
              <p>{msg.displayName}</p>
            </div>
            <p>{msg.text}</p>
          </div>
        ))}
      </div>
      <div className={css.inputButton}>
        <input
          className={css.inputMsg}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <button className={css.sendButton} onClick={sendMessage}>
          Send
        </button>
      </div>
    </div>
  );
};

export default MessagePage;
