// import { useState, useEffect } from "react";
import css from "./UserPage.module.css";
import { useAuth } from "../../firebase/contexts/authContexts/index.jsx";
// import { saveUserToDatabase } from "../../firebase/firebase/readData.js";
// import { getAllUsers } from "../../firebase/firebase/readData.js";

export default function UserPage() {
  const { currentUser } = useAuth();
  // const [users, setUsers] = useState(null); // State to store users data
  // const [loading, setLoading] = useState(true); // Loading state
  if (!currentUser) return;
  console.log(currentUser);
  
// saveUserToDatabase(currentUser.uid, currentUser.email, currentUser.name);
  // useEffect(() => {
  //   // Fetch users data when component mounts
  //   const fetchUsers = async () => {
  //     try {
  //       const usersData = await getAllUsers(); // Get users data
  //       // setUsers(usersData); // Set users in state
  //     } catch (error) {
  //       console.error("Error fetching users:", error); // Log error if fetching fails
  //     } finally {
  //       setLoading(false); // Set loading to false once the data is fetched
  //     }
  //   };

  //   if (currentUser) {
  //     fetchUsers(); // Only fetch users if there is a logged-in user
  //   }
  // }, [currentUser]); // Effect will rerun when `currentUser` changes

  // if (!currentUser) return <p>Please log in to view users.</p>; // If not logged in, show message
  // if (loading) return <p>Loading...</p>; // Show loading state while fetching data

  return (
    <main>
      <div className={css.photo}>photo</div>
      <div className={css.infContainer}>
        <p>{currentUser.name}</p>
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
