import { useState, useEffect } from "react";
import css from "./UserPage.module.css";
import { useAuth } from "../../firebase/contexts/authContexts/index.jsx";
import { getAllUsers } from "../../firebase/firebase/readData.js";

export default function UserPage() {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState(null);
  const [loading, setLoading] = useState(true);
  console.log(currentUser);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersData = await getAllUsers();
        setUsers(usersData);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchUsers();
    }
  }, [currentUser]);

  if (!currentUser) return <p>Please log in to view users.</p>;
  if (loading) return <p>Loading...</p>;

  return (
    <main className={css.container}>
      <div className={css.photo}></div>
      <div className={css.infContainer}>
        <div className={css.containerForElement}>
          <p className={css.userName}>{currentUser.displayName}</p>
          <p>Friends: 0</p>
        </div>
        <div className={css.containerForElement}>Публікації</div>
        {/* <h3>All Users:</h3>
        {users ? (
          <ul>
            {Object.keys(users).map((userId) => (
              <li key={userId}>
                <p>Name: {users[userId].name}</p>
                <p>Email: {users[userId].email}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p>No users found.</p>
        )} */}
      </div>
    </main>
  );
}
