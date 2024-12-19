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
} from "firebase/firestore";

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

export const createChat = async (userId1, user2) => {
  const db = getFirestore();
  const chatId = [userId1, user2.uid].sort().join("_");
  const chatRef = doc(db, "chats", chatId);

  try {
    const chatSnapshot = await getDoc(chatRef);

    if (chatSnapshot.exists()) {
      console.log("Chat already exists:", chatId);
      return chatId; // Повертаємо існуючий chatId
    }

    await setDoc(chatRef, {
      participants: {
        [userId1]: true,
        [user2.uid]: true,
      },
      name: user2.name,
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

export const sendMessage = async (chatId, senderName,photo, senderId, content) => {
  const db = getFirestore();
  const chatRef = doc(db, "chats", chatId);
  const messagesRef = collection(chatRef, "messages");

  try {
    // Додаємо повідомлення до підколекції `messages`
    await addDoc(messagesRef, {
      senderId: senderId,
      name: senderName,
      photo,
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

  return unsubscribe; // Повертаємо функцію для зупинки прослуховування
};
