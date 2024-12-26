import {
  getFirestore,
  collection,
  getDocs,
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
  addDoc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  where,
  deleteDoc,
} from "firebase/firestore";
import toast from "react-hot-toast";

export const getAllChats = async (currentUserId) => {
  const db = getFirestore();
  const chatsRef = collection(db, "chats");

  try {
    // Запит Firestore для отримання чатів, у яких поточний користувач є учасником
    const chatsQuery = query(
      chatsRef,
      where(`participants.${currentUserId}`, "==", true)
    );

    const snapshot = await getDocs(chatsQuery);

    if (!snapshot.empty) {
      const chats = snapshot.docs.map((doc) => ({
        chatId: doc.id,
        ...doc.data(),
      }));

      return chats;
    } else {
      console.log("No chats found for the current user.");
      return [];
    }
  } catch (error) {
    console.error("Error retrieving chats:", error);
    throw error;
  }
};
export const getChatById = async (chatId) => {
  const db = getFirestore();
  const chatRef = doc(db, "chats", chatId);

  try {
    const chatDoc = await getDoc(chatRef);

    if (chatDoc.exists()) {
      return { chatId: chatDoc.id, ...chatDoc.data() };
    } else {
      console.log(`Chat with ID ${chatId} not found.`);
      return null;
    }
  } catch (error) {
    console.error("Error retrieving chat by ID:", error);
    throw error;
  }
};

export const createChat = async (user1, user2) => {
  const db = getFirestore();
  const chatId = [user1.uid, user2.uid].sort().join("_");
  const chatRef = doc(db, "chats", chatId);

  try {
    const chatSnapshot = await getDoc(chatRef);

    if (chatSnapshot.exists()) {
      console.log("Chat already exists:", chatId);
      return chatId;
    }

    await setDoc(chatRef, {
      participants: {
        [user1.uid]: true,
        [user2.uid]: true,
      },
      name1: user1.displayName,
      name2: user2.name,
      photoUrl: user1.photoURL,
      photo: user2.photo || null,
      lastMessage: null,
      updatedAt: serverTimestamp(),
    });

    console.log("Chat created!");
    return chatId;
  } catch (error) {
    console.error("Error creating chat:", error);
    throw error;
  }
};

export const sendMessage = async (
  chatId,
  senderName,
  photo,
  senderId,
  content
) => {
  const db = getFirestore();
  const chatRef = doc(db, "chats", chatId);
  const messagesRef = collection(chatRef, "messages");

  try {
    // Додаємо повідомлення до підколекції `messages`
    await addDoc(messagesRef, {
      senderId: senderId,
      name: senderName,
      photo: photo || null,
      content: content,
      timestamp: serverTimestamp(),
    });

    // Оновлюємо останнє повідомлення в чаті
    await updateDoc(chatRef, {
      lastMessage: content,
      updatedAt: serverTimestamp(),
    });

    console.log("Message sent!");
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};

export const listenForMessages = (chatId, onNewMessage) => {
  const db = getFirestore();
  const messagesRef = collection(doc(db, "chats", chatId), "messages");
  const messagesQuery = query(messagesRef, orderBy("timestamp", "asc"));

  const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === "added") {
        onNewMessage({ id: change.doc.id, ...change.doc.data() });
      }
    });
  });

  return unsubscribe;
};

export const deleteChat = async (chatId) => {
  const db = getFirestore();
  const chatRef = doc(db, "chats", chatId);
  const messagesRef = collection(chatRef, "messages");

  try {
    const messagesSnapshot = await getDocs(messagesRef);

    const deletePromises = messagesSnapshot.docs.map((messageDoc) =>
      deleteDoc(messageDoc.ref)
    );
    await Promise.all(deletePromises);

    await deleteDoc(chatRef);

    console.log("Chat and all messages deleted:", chatId);
  } catch (error) {
    console.error("Error deleting chat and messages:", error);
    throw error;
  }
};
// export const subscribeToChatsAndMessages = (currentUserId) => {
//   const db = getFirestore();
//   const chatsRef = collection(db, "chats");

//   // Запит на чати, де поточний користувач є учасником
//   const chatsQuery = query(
//     chatsRef,
//     where(`participants.${currentUserId}`, "==", true)
//   );

//   // Підписка на зміни в чатах
//   const unsubscribeChats = onSnapshot(chatsQuery, (snapshot) => {
//     snapshot.docChanges().forEach((change) => {
//       const chatId = change.doc.id;
//       // const chatData = change.doc.data();

//       // Підписка на нові повідомлення у підколекції `messages`
//       const messagesRef = collection(db, "chats", chatId, "messages");
//       const messagesQuery = query(messagesRef, orderBy("timestamp", "asc"));

//       const unsubscribeMessages = onSnapshot(
//         messagesQuery,
//         (messageSnapshot) => {
//           messageSnapshot.docChanges().forEach((messageChange) => {
//             if (messageChange.type === "added") {
//               const messageData = messageChange.doc.data();
//               const lastMessage = messageData[messageData.length - 1];

//               if (lastMessage && lastMessage.senderId !== currentUserId) {
//                 toast(`${lastMessage.name}: ${lastMessage.content}`, {
//                   position: "top-right",
//                   autoClose: 5000,
//                   hideProgressBar: false,
//                   closeOnClick: true,
//                   pauseOnHover: true,
//                   draggable: true,
//                   progress: undefined,
//                 });
//                 console.log(lastMessage.name, lastMessage.content);
//               }
//             }
//           });
//         }
//       );

//       // Повертати функцію для відписки
//       return unsubscribeMessages;
//     });
//   });

//   return unsubscribeChats;
// };
export const subscribeToChatsAndMessages = (currentUserId) => {
  const db = getFirestore();
  const chatsRef = collection(db, "chats");

  // Запит на чати, де поточний користувач є учасником
  const chatsQuery = query(
    chatsRef,
    where(`participants.${currentUserId}`, "==", true)
  );

  // Підписка на зміни в чатах
  const unsubscribeChats = onSnapshot(chatsQuery, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === "added" || change.type === "modified") {
        const chatId = change.doc.id;

        // Підписка на нові повідомлення у підколекції `messages`
        const messagesRef = collection(db, "chats", chatId, "messages");
        const messagesQuery = query(messagesRef, orderBy("timestamp", "asc"));

        const unsubscribeMessages = onSnapshot(
          messagesQuery,
          (messageSnapshot) => {
            messageSnapshot.docChanges().forEach((messageChange) => {
              if (messageChange.type === "added") {
                const messageData = messageChange.doc.data();

                const lastMessage = messageData[messageData.length - 1];

                if (lastMessage && lastMessage.senderId !== currentUserId) {
                  toast(`${lastMessage.name}: ${lastMessage.content}`, {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                  });
                  console.log(lastMessage.name, lastMessage.content);
                }
              }
            });
          }
        );

        return unsubscribeMessages;
      }
    });
  });

  return unsubscribeChats;
};
