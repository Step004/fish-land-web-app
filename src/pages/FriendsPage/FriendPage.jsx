import { useState, useEffect } from "react";
import css from "./FriendPage.module.css";
import {
  getAllUsers,
  getFriendsContacts,
  getUserById,
} from "../../firebase/firebase/readData.js";
import defaultPhoto from "../../img/default-user.jpg";
// import { IoSettingsOutline } from "react-icons/io5";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../firebase/contexts/authContexts/index.jsx";
import { IoIosSend } from "react-icons/io";
import { IoMdAdd } from "react-icons/io";
import { addFriend } from "../../firebase/firebase/writeData.js";
import { createChat } from "../../firebase/firebase/chats.js";
import Loader from "../../components/Loader/Loader.jsx";

export default function FriendPage() {
  const { currentUser } = useAuth();
  const { friendId } = useParams();
  const [user, setUser] = useState(null);
  // const [users, setUsers] = useState(null);
  const [friends, setFriends] = useState(null);
  const [isFriend, setIsFriend] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const friendsContacts = await getFriendsContacts(friendId);
        const userData = await getUserById(friendId);
        const usersData = await getAllUsers();
        setFriends(friendsContacts);
        // setUsers(usersData);
        setUser(userData);

        // Перевірити, чи друг уже є в списку друзів
        if (usersData[currentUser?.uid]?.friends?.[friendId]) {
          setIsFriend(true);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [friendId, currentUser]);

  if (loading) return <Loader />;

  const handleAddFriend = () => {
    addFriend(currentUser.uid, friendId);
    setIsFriend(true);
  };
  
    const handleStartChat = async () => {
      try {
        const chatId = await createChat(currentUser.uid, user);
        navigate(`/message/${chatId}`); 
      } catch (error) {
        console.error("Failed to create chat:", error);
      }
    };
  return (
    <main className={css.container}>
      {user.photo ? (
        <img src={user.photo} alt="UserPhoto" className={css.photo} />
      ) : (
        <img src={defaultPhoto} alt="UserPhoto" className={css.photo} />
      )}
      <div className={css.containerForElement}>
        <div className={css.nameAndButton}>
          <div className={css.nameAndStatus}>
            <h2 className={css.userName}>{user.name}</h2>
            <p>
              {user.online ? (
                <span className={css.online}>Online</span>
              ) : (
                <span className={css.offline}>Offline</span>
              )}
            </p>
          </div>
          <div className={css.buttonsFriend}>
            {isFriend ? (
              <p className={css.online}>We are friends.</p>
            ) : (
              <button className={css.publish} onClick={handleAddFriend}>
                <IoMdAdd />
                Add to friends
              </button>
            )}
            <button className={css.publish} onClick={handleStartChat}>
              <IoIosSend />
              Send message
            </button>
          </div>
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
        <div className={css.containerForPhotoText}>
          <h3 className={css.forP}>Photo:</h3>
          {user.gallery ? (
            <ul className={css.photoList}>
              <li>1</li>
              <li>2</li>
              <li>3</li>
              <li>4</li>
            </ul>
          ) : (
            <p className={css.pointPhoto}>{user.name} don`t have photo yet.</p>
          )}
        </div>
        <div className={css.containerForSeeAll}>
          <h3 className={css.friendsP}>
            Friends: {Object.keys(friends).length}
          </h3>
          <button
            className={css.buttonSeeAll}
            onClick={() => {
              navigation("/friends/friends", { state: { uid: friendId } });
            }}
          >
            See all!
          </button>
        </div>
        {friends ? (
          <ul className={css.friendList}>
            {Object.keys(friends)
              .slice(0, 6)
              .map((userId) => (
                <li
                  key={userId}
                  className={css.friendItem}
                  onClick={() => {
                    if (userId == currentUser.uid) {
                      navigation("/user");
                    } else navigation(`/friends/${friends[userId].uid}`);
                  }}
                >
                  {friends[userId].photo ? (
                    <img
                      src={friends[userId].photo}
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
                  <p className={css.friendName}>{friends[userId].name}</p>
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
            {user.posts ? (
              <ul className={css.listPublications}>
                {user.posts.map((post) => (
                  <li key={post.id} className={css.listPublicationsItem}>
                    <p className={css.titlePost}>{post.title}</p>
                    <p className={css.contentPost}>{post.content}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className={css.pForNothingPublications}>
                {user.name} don`t have publications!
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
