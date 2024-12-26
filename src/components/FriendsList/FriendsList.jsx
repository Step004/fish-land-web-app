import { useEffect, useState } from "react";
import { getFriendsContacts } from "../../firebase/firebase/readData.js";
import { useAuth } from "../../firebase/contexts/authContexts/index.jsx";
import css from "./FriendsList.module.css";
import defaultPhoto from "../../img/default-user.jpg";
import { useLocation, useNavigate } from "react-router-dom";
import Loader from "../Loader/Loader.jsx";

export default function FriendsList() {
  const location = useLocation();
  const navigation = useNavigate();
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { currentUser } = useAuth();
  const targetUid = location.state?.uid || currentUser?.uid;

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const friendsContacts = await getFriendsContacts(targetUid);
        setFriends(friendsContacts || []);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    if (targetUid) {
      fetchUsers();
    }
  }, [targetUid]);
  const filteredFriends = friends.filter((user) =>
    user.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <Loader />;
  return (
    <div className={css.container}>
      <input
        type="text"
        placeholder="Search friends by name..."
        className={css.searchInput}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      {filteredFriends?.map((user, index) => (
        <div
          key={index}
          className={css.card}
          onClick={() => {
            if (user.uid == currentUser.uid) {
              navigation("/user");
            } else navigation(`/friends/${user.uid}`);
          }}
        >
          {user.photo ? (
            <img src={user.photo} alt="UserPhoto" className={css.photo} />
          ) : (
            <img src={defaultPhoto} alt="UserPhoto" className={css.photo} />
          )}
          <div className={css.userInfo}>
            <div className={css.nameAndStatus}>
              <p className={css.name}>{user.name}</p>
              <p>
                {user.online ? (
                  <span className={css.online}>Online</span>
                ) : (
                  <span className={css.offline}>Offline</span>
                )}
              </p>
            </div>
            <div className={css.descriptions}>
              {user.origin ? (
                <p className={css.desc}>
                  From: <span>{user.origin}</span>
                </p>
              ) : null}
              {user.age ? (
                <p className={css.desc}>
                  Age: <span>{user.age}</span>
                </p>
              ) : null}
              {user.number ? (
                <p className={css.desc}>
                  Number: <span>{user.number}</span>
                </p>
              ) : null}
            </div>
            {user.preference ? (
              <p className={css.fromLocal}>
                Preference: <span>{user.preference}</span>
              </p>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}
