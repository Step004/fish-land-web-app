import { useNavigate } from "react-router-dom";
import { useAuth } from "../../firebase/contexts/authContexts/index.jsx";
import { useEffect, useMemo, useState } from "react";
import { getFriendsContacts } from "../../firebase/firebase/readData.js";
import css from "./HomePage.module.css";
import defaultPhoto from "../../img/default-user.jpg";
import Loader from "../../components/Loader/Loader.jsx";
import { FcLike, FcLikePlaceholder } from "react-icons/fc";
import { FaRegCommentAlt } from "react-icons/fa";
import {
  addCommentToPost,
  toggleLikeOnPost,
} from "../../firebase/firebase/writeData.js";

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
  const [openPostId, setOpenPostId] = useState(null);
  const [likes, setLikes] = useState({});
  const [comments, setComments] = useState({});
  const [commentText, setCommentText] = useState("");

  const handleLike = async (userId, postId) => {
    await toggleLikeOnPost(userId, postId, currentUser.uid);

    setLikes((prevLikes) => {
      const hasLiked = prevLikes[postId]?.includes(currentUser.uid);
      const updatedLikes = hasLiked
        ? prevLikes[postId].filter((id) => id !== currentUser.uid)
        : [...(prevLikes[postId] || []), currentUser.uid];

      return { ...prevLikes, [postId]: updatedLikes };
    });
  };

  const handleAddComment = async (userId, postId) => {
    if (!commentText.trim()) return;

    const newComment = {
      id: Date.now(),
      userId: currentUser.uid,
      text: commentText,
      author: currentUser.displayName || "Anonymous",
    };

    await addCommentToPost(userId, postId, newComment);

    setComments((prevComments) => ({
      ...prevComments,
      [postId]: [...(prevComments[postId] || []), newComment],
    }));

    setCommentText("");
  };
  const toggleComments = (postId) => {
    setOpenPostId((prev) => (prev === postId ? null : postId));
    console.log(postId);
  };

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
      posts: Array.isArray(friend.posts)
        ? friend.posts.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          )
        : [],
      createdAt: friend.createdAt,
    }));
  }, [friends]);
  useEffect(() => {
    const postLikes = {};
    const postComments = {};

    memoizedFriends.forEach((friend) => {
      friend.posts.forEach((post) => {
        postLikes[post.id] = post.likes || [];
        postComments[post.id] = post.comments || [];
      });
    });

    setLikes(postLikes);
    setComments(postComments);
  }, [memoizedFriends]);

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
                  <div
                    className={css.nameRow}
                    onClick={() => navigation(`/friends/${friend.id}`)}
                  >
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
                    <div>
                      <p className={css.friendName}>{friend.name}</p>
                      <p className={css.timeCreatingMsg}>
                        {new Date(post.createdAt).toLocaleString("uk-UA", {
                          hour: "2-digit",
                          minute: "2-digit",
                          day: "2-digit",
                          month: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                  <p className={css.titlePost}>{post.title}</p>
                  <p className={css.contentPost}>{post.content}</p>
                  <div className={css.containerForLikesAndComments}>
                    <p
                      className={css.likes}
                      onClick={() => handleLike(friend.id, post.id)}
                    >
                      Like {post.likes?.length || 0}
                      {post.likes?.includes(currentUser.uid) ? (
                        <FcLike className={css.likesIcon} />
                      ) : (
                        <FcLikePlaceholder className={css.likesIcon} />
                      )}
                    </p>
                    <p
                      className={css.likes}
                      onClick={() => toggleComments(post.id)}
                    >
                      Comments {post.comments?.length || 0}
                      <FaRegCommentAlt className={css.commentIcon} />
                    </p>
                  </div>
                  {openPostId === post.id && (
                    <div className={css.commentsSection}>
                      <div className={css.commentsCont}>
                        {post.comments?.map((comment) => (
                          <p key={comment.id}>
                            <strong>{comment.author}: </strong>
                            {comment.text}
                          </p>
                        ))}
                      </div>

                      <div className={css.conForInputAndButton}>
                        <input
                          type="text"
                          className={css.commentInput}
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                        />
                        <button
                          className={css.commentButtonSend}
                          onClick={() =>
                            handleAddComment(currentUser.uid, post.id)
                          }
                        >
                          Send
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              ))
            )}
          </ul>
        ) : (
          <p className={css.pForNothingPublications}>
            Your friends haven`t posted anything yet.
          </p>
        )}
      </div>
    </main>
  );
}
