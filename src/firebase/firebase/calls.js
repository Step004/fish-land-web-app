import {
  collection,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { firestore } from "./firebase.js";
import { query, where } from "firebase/firestore";

const deleteCollection = async (parentDoc, subcollection) => {
  const subColRef = collection(parentDoc, subcollection);
  const subColDocs = await getDocs(subColRef);

  await Promise.all(subColDocs.docs.map((doc) => deleteDoc(doc.ref)));
};

export const deleteCallById = async (callId) => {
  try {
    const callDocRef = doc(firestore, "calls", callId);

    await deleteCollection(callDocRef, "offerCandidates");
    await deleteCollection(callDocRef, "answerCandidates");
    await deleteDoc(callDocRef);

    console.log(`Document with ID ${callId} deleted successfully.`);
  } catch (error) {
    console.error(
      `Error scheduling deletion for document with ID ${callId}:`,
      error
    );
  }
};
export const findCallById = async (callId) => {
  const callDoc = await firestore.collection("calls").doc(callId).get();
  if (callDoc.exists) {
    const callData = callDoc.data();
    return callData.status === "active" ? callData : null;
  }
  return null;
};

export const getUserCalls = async (uid) => {
  try {
    // Отримуємо ID поточного користувача
    const currentUserId = uid;
    if (!currentUserId) throw new Error("User is not authenticated");

    // Формуємо запит для отримання дзвінків поточного користувача
    const callsCollection = collection(firestore, "calls");
    const userCallsQuery = query(
      callsCollection,
      where("participants", "array-contains", currentUserId)
    );

    // Виконуємо запит
    const snapshot = await getDocs(userCallsQuery);

    // Формуємо масив дзвінків
    const calls = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return calls;
  } catch (error) {
    console.error("Error fetching user calls:", error);
    return [];
  }
};
