import { useState, useEffect } from "react";
import css from "./FriendPage.module.css";
import { getAllUsers, getUserById } from "../../firebase/firebase/readData.js";
import defaultPhoto from "../../img/default-user.jpg";
// import { IoSettingsOutline } from "react-icons/io5";
import { useNavigate, useParams } from "react-router-dom";

export default function FriendPage() {
  const { friendId } = useParams();
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getUserById(friendId);
        const usersData = await getAllUsers();
        setUsers(usersData);
        setUser(userData);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [friendId]);

  if (loading) return <p>Loading...</p>;

  return (
    <main className={css.container}>
      {user.photo ? (
        <img src={user.photo} alt="UserPhoto" className={css.photo} />
      ) : (
        <img src={defaultPhoto} alt="UserPhoto" className={css.photo} />
      )}
      <div className={css.containerForElement}>
        <div className={css.nameAndButton}>
          <h2 className={css.userName}>{user.name}</h2>
          <button className={css.publish}>Add to friends</button>
        </div>
        {user.origin ? (
          <p className={css.fromLocal}>From: {user.origin}</p>
        ) : null}
        {user.age ? <p className={css.fromLocal}>Age: {user.age}</p> : null}
        {user.preference ? (
          <p className={css.fromLocal}>Preference: {user.preference}</p>
        ) : null}
        {user.number ? (
          <p className={css.fromLocal}>Number: {user.number}</p>
        ) : null}
        <div>
          <h3 className={css.forP}>Photo:</h3>
          <ul className={css.photoList}>
            <li>1</li>
            <li>2</li>
            <li>3</li>
            <li>4</li>
          </ul>
        </div>
        <div className={css.containerForSeeAll}>
          <h3 className={css.friendsP}>Friends: {Object.keys(users).length}</h3>
          <button
            className={css.buttonSeeAll}
            onClick={() => {
              navigation("/friends");
            }}
          >
            See all!
          </button>
        </div>
        {users ? (
          <ul className={css.friendList}>
            {Object.keys(users)
              .slice(0, 6)
              .map((userId) => (
                <li
                  key={userId}
                  className={css.friendItem}
                  onClick={() => {
                    navigation(`/friends/${userId}`);
                  }}
                >
                  {users[userId].photo ? (
                    <img
                      src={users[userId].photo}
                      alt="UserPhoto"
                      className={css.friendPhoto}
                    />
                  ) : (
                    <img
                      src={defaultPhoto}
                      alt="defaultPhoto"
                      className={css.friendPhoto}
                    />
                  )}
                  <p className={css.friendName}>{users[userId].name}</p>
                </li>
              ))}
          </ul>
        ) : (
          <p>No users found.</p>
        )}
        <div className={css.publications}>
          <div className={css.contPubl}>
            <h3 className={css.publicationsText}>Publications</h3>
          </div>
          <div className={css.containerForPublic}>
            <ul></ul>

            <p className={css.pForNothingPublications}>
              This user doesn`t have publications!
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
