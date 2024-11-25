import { getDatabase, ref, set, push, onChildAdded, get } from "firebase/database";

export const getAllChats = async () => {
  const db = getDatabase();
  const chatsRef = ref(db, "chats");

  try {
    // Отримуємо всі чати
    const snapshot = await get(chatsRef);

    if (snapshot.exists()) {
      const chats = snapshot.val();
      console.log("Chats retrieved successfully:", chats);

      // Перетворюємо об'єкт на масив для зручної роботи
      const chatList = Object.keys(chats).map((chatId) => ({
        chatId,
        ...chats[chatId],
      }));

      return chatList;
    } else {
      console.log("No chats found.");
      return [];
    }
  } catch (error) {
    console.error("Error retrieving chats:", error);
    throw error;
  }
};

// export const createChat = async (userId1, userId2) => {
//   const db = getDatabase();
//   const newChatRef = push(ref(db, "chats"));

//   // Створюємо новий чат з учасниками
//   try {
//     await set(newChatRef, {
//       participants: {
//         [userId1]: true,
//         [userId2]: true,
//       },
//     });
//     console.log("Chat created!");
//     return newChatRef.key; // Повертаємо chatId
//   } catch (error) {
//     console.error("Error creating chat:", error);
//     throw error;
//   }
// };
export const createChat = async (userId1, userId2) => {
  const db = getDatabase();
  const chatId = [userId1, userId2].sort().join("_");
  const chatRef = ref(db, `chats/${chatId}`);

  try {
    // Перевіряємо чи існує чат
    const snapshot = await get(chatRef);

    if (snapshot.exists()) {
      console.log("Chat already exists:", chatId);
      return chatId; // Повертаємо існуючий chatId
    }

    // Якщо чат не знайдено, створюємо новий
    await set(chatRef, {
      participants: {
        [userId1]: true,
        [userId2]: true,
      },
    });

    console.log("Chat created!");
    return chatId;
  } catch (error) {
    console.error("Error creating chat:", error);
    throw error;
  }
};

export const sendMessage = (chatId, senderId, content) => {
  const db = getDatabase();
  const messagesRef = ref(db, `chats/${chatId}/messages`);

  // Додаємо нове повідомлення в чат
  const newMessageRef = push(messagesRef);
  set(newMessageRef, {
    senderId: senderId,
    content: content,
    timestamp: new Date().toISOString(),
  })
    .then(() => {
      console.log("Message sent!");
    })
    .catch((error) => {
      console.error("Error sending message:", error);
    });
};
export const listenForMessages = (chatId, onNewMessage) => {
  const db = getDatabase();
  const messagesRef = ref(db, `chats/${chatId}/messages`);

  const unsubscribe = onChildAdded(messagesRef, (snapshot) => {
    const message = snapshot.val();
    onNewMessage(message);
  });

  return () => unsubscribe.off(); // Очищення слухача
};