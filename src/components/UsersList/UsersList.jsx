import { useEffect, useState } from "react";
import { getAllUsers } from "../../firebase/firebase/readData.js";
import css from "./UsersList.module.css";
import defaultPhoto from "../../img/default-user.jpg";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../firebase/contexts/authContexts/index.jsx";
import Loader from "../Loader/Loader.jsx";
import { i18n } from "../../utils/i18n";

function UsersList() {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const navigation = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersData = await getAllUsers();
        setUsers(usersData ? Object.values(usersData) : []);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);
  const filteredUsers = users.filter((user) =>
    user.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  if (loading) return <Loader />;
  console.log(users);

  return (
    <div className={css.container}>
      <input
        type="text"
        placeholder={i18n.t("friendsList.searchInputPlaceholder")}
        className={css.searchInput}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      {filteredUsers?.map((user, index) => (
        <div
          key={index}
          className={css.card}
          onClick={() => {
            if (user.uid == currentUser.uid) {
              navigation("/user");
            } else navigation(`/friends/${user.uid}`);
          }}
        >
          {user.photoURL ? (
            <img src={user.photoURL} alt="UserPhoto" className={css.photo} />
          ) : (
            <img src={defaultPhoto} alt="UserPhoto" className={css.photo} />
          )}
          <div className={css.userInfo}>
            <div className={css.nameAndStatus}>
              <p className={css.name}>{user.name}</p>
              <p>
                {user.online ? (
                  <span className={css.online}>
                    {i18n.t("friendsList.online")}
                  </span>
                ) : (
                  <span className={css.offline}>
                    {i18n.t("friendsList.offline")}
                  </span>
                )}
              </p>
            </div>
            <div className={css.descriptions}>
              {user.origin ? (
                <p className={css.desc}>
                  {i18n.t("friendsList.from")}: <span>{user.origin}</span>
                </p>
              ) : null}
              {user.age ? (
                <p className={css.desc}>
                  {i18n.t("friendsList.age")}: <span>{user.age}</span>
                </p>
              ) : null}
              {user.number ? (
                <p className={css.desc}>
                  {i18n.t("friendsList.number")}: <span>{user.number}</span>
                </p>
              ) : null}
            </div>
            {user.preference ? (
              <p className={css.fromLocal}>
                {i18n.t("friendsList.preference")}: <span>{user.preference}</span>
              </p>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}

export default UsersList;
