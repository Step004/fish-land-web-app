import { useEffect, useState } from "react";
import { getAllUsers } from "../../firebase/firebase/readData.js";

function UsersList() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    setUsers(getAllUsers());
  }, []);

  return (
    <div>
      <h2>Registered Users</h2>
      {users.map((user, index) => (
        <div key={index}>
          <p>Name: {user.name}</p>
          <p>Email: {user.email}</p>
        </div>
      ))}
    </div>
  );
}

export default UsersList;
