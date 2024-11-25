import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getDatabase, ref, onValue } from "firebase/database";
// import { listenForMessages } from "../../firebase/firebase/chats.js";

export default function Messages() {
  const { chatId } = useParams(); // Отримуємо chatId з маршруту
  const [chatData, setChatData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChatData = () => {
      const db = getDatabase();
      const chatRef = ref(db, `chats/${chatId}`);

      onValue(chatRef, (snapshot) => {
        if (snapshot.exists()) {
          setChatData(snapshot.val());
        } else {
          console.error("Chat not found");
        }
        setLoading(false);
      });
    };

    fetchChatData();
  }, [chatId]);
  // useEffect(() => {
  //   const unsubscribe = listenForMessages(chatId, (message) => {
  //     setMessages((prevMessages) => [...prevMessages, message]);
  //   });

  //   return () => unsubscribe();
  // }, [chatId]);

  if (loading) return <p>Loading...</p>;

  if (!chatData) return <p>Chat not found</p>;

  return (
    <div>
      <h1>Chat with {Object.keys(chatData.participants).join(", ")}</h1>
      {/* Додайте логіку для відображення повідомлень */}
    </div>
  );
}
