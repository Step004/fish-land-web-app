import { useNavigate } from "react-router-dom";
import { useAuth } from "../../firebase/contexts/authContexts/index.jsx";
import { useEffect, useMemo, useState } from "react";
import { getFriendsContacts } from "../../firebase/firebase/readData.js";
import css from "./HomePage.module.css";
import defaultPhoto from "../../img/default-user.jpg";
import Loader from "../../components/Loader/Loader.jsx";

export default function HomePage() {
  const { userLoggedIn, currentUser } = useAuth();
  const navigation = useNavigate();

  // Перенаправлення, якщо користувач не авторизований
  useEffect(() => {
    if (!userLoggedIn && userLoggedIn !== null) {
      navigation("/login");
    }
  }, [userLoggedIn, navigation]);

  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);

  // Завантаження друзів
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        if (currentUser?.uid) {
          const friendsContacts = await getFriendsContacts(currentUser.uid);
          setFriends(friendsContacts || []);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [currentUser]);

  // Мемоізований список друзів
  const memoizedFriends = useMemo(() => {
    return friends.map((friend) => ({
      id: friend.uid,
      name: friend.name,
      photo: friend.photo,
      posts: friend.posts,
      createdAt: friend.createdAt,
    }));
  }, [friends]);

  if (loading) return <Loader />;

  return (
    <main className={css.container}>
      <div className={css.containerForElement}>
        <h2 className={css.title}>News from your friends</h2>
        {memoizedFriends.length > 0 ? (
          <ul className={css.listPublications}>
            {memoizedFriends.flatMap((friend) =>
              friend.posts.map((post, index) => (
                <li
                  key={`${friend.id}-${index}`}
                  className={css.listPublicationsItem}
                >
                  <div className={css.nameRow}>
                    {friend.photo ? (
                      <img
                        src={friend.photo}
                        alt="UserPhoto"
                        className={css.photo}
                      />
                    ) : (
                      <img
                        src={defaultPhoto}
                        alt="UserPhoto"
                        className={css.photo}
                      />
                    )}
                    <p className={css.friendName}>{friend.name}</p>
                  </div>
                  <p className={css.titlePost}>{post.title}</p>
                  <p className={css.contentPost}>{post.content}</p>
                </li>
              ))
            )}
          </ul>
        ) : (
          <p className={css.pForNothingPublications}>
            You don’t have publications!
          </p>
        )}
      </div>
    </main>
  );
}
