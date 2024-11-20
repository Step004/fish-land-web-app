import { useEffect, useState } from "react";
import { useAuth } from "../../firebase/contexts/authContexts/index.jsx";
import { getAllUsers } from "../../firebase/firebase/readData.js";

export default function FriendListPage() {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState(null);
  const [loading, setLoading] = useState(true);

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
    <div>
      <h3>All Users:</h3>
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
        )}
    </div>
  );
}
