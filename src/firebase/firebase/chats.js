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
  limit,
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
      status: "unread",
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
export const markAllMessagesAsRead = async (chatId) => {
  const db = getFirestore();
  const messagesRef = collection(db, "chats", chatId, "messages");

  try {
    // Отримуємо всі непрочитані повідомлення
    const unreadMessagesQuery = query(
      messagesRef,
      where("status", "==", "unread")
    );
    const querySnapshot = await getDocs(unreadMessagesQuery);

    // Оновлюємо статус на "read"
    const updatePromises = querySnapshot.docs.map((docSnap) =>
      updateDoc(docSnap.ref, { status: "read" })
    );

    await Promise.all(updatePromises);
    console.log("All messages marked as read!");
  } catch (error) {
    console.error("Error marking messages as read:", error);
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

export const subscribeToChatsAndMessages = (currentUserId) => {
  const db = getFirestore();
  const chatsRef = collection(db, "chats");

  // Зберігаємо посилання на функції відписки для чатів та повідомлень
  const unsubscribeMessagesMap = new Map();

  // Запит на чати, де поточний користувач є учасником
  const chatsQuery = query(
    chatsRef,
    where(`participants.${currentUserId}`, "==", true)
  );

  // Підписка на зміни в чатах
  const unsubscribeChats = onSnapshot(chatsQuery, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      const chatId = change.doc.id;

      if (change.type === "added" || change.type === "modified") {
        // Перевіряємо, чи є активна підписка на цей чат, і скасовуємо її
        if (unsubscribeMessagesMap.has(chatId)) {
          const unsubscribePrevious = unsubscribeMessagesMap.get(chatId);
          unsubscribePrevious(); // Скасовуємо попередню підписку
        }

        // Підписка на нові повідомлення у підколекції `messages`
        const messagesRef = collection(db, "chats", chatId, "messages");
        const messagesQuery = query(
          messagesRef,
          orderBy("timestamp", "desc"),
          limit(1) // Беремо лише останнє повідомлення
        );

        const unsubscribeMessages = onSnapshot(
          messagesQuery,
          (messageSnapshot) => {
            if (!messageSnapshot.empty) {
              const lastMessageDoc = messageSnapshot.docs[0];
              const lastMessageData = lastMessageDoc.data();

              // Перевірка, чи повідомлення не від поточного користувача
              if (lastMessageData.senderId !== currentUserId) {
                toast(
                  `New message from ${lastMessageData.name}: ${lastMessageData.content}`,
                  {
                    position: "top-right",
                    autoClose: 8000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                  }
                );
              }
            }
          }
        );

        // Зберігаємо нову підписку для цього чату
        unsubscribeMessagesMap.set(chatId, unsubscribeMessages);
      }

      // Якщо чат видалено, скасовуємо відповідну підписку
      if (change.type === "removed" && unsubscribeMessagesMap.has(chatId)) {
        const unsubscribePrevious = unsubscribeMessagesMap.get(chatId);
        unsubscribePrevious(); // Скасовуємо підписку
        unsubscribeMessagesMap.delete(chatId); // Видаляємо з мапи
      }
    });
  });

  return () => {
    // Відписка від усіх чатів та повідомлень
    unsubscribeChats();
    unsubscribeMessagesMap.forEach((unsubscribe) => unsubscribe());
  };
};
