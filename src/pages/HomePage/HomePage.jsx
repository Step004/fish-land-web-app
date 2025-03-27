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
import toast from "react-hot-toast";

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
  const [commentText, setCommentText] = useState("");

  const handleLike = async (userId, postId) => {
    try {
      await toggleLikeOnPost(userId, postId, currentUser.uid);

      // Оновлюємо стан друзів після зміни лайків
      setFriends((prevFriends) => {
        return prevFriends.map((friend) => {
          if (friend.uid === userId) {
            return {
              ...friend,
              posts: {
                ...friend.posts,
                [postId]: {
                  ...friend.posts[postId],
                  likes: friend.posts[postId].likes?.includes(currentUser.uid)
                    ? friend.posts[postId].likes.filter(
                        (id) => id !== currentUser.uid
                      )
                    : [...(friend.posts[postId].likes || []), currentUser.uid],
                },
              },
            };
          }
          return friend;
        });
      });
    } catch (error) {
      console.error("Error toggling like:", error);
      toast.error("Failed to update like");
    }
  };

  const handleAddComment = async (userId, postId) => {
    if (!commentText.trim()) return;

    try {
      const newComment = {
        id: Date.now(),
        userId: currentUser.uid,
        text: commentText,
        author: currentUser.displayName || "Anonymous",
      };

      await addCommentToPost(userId, postId, newComment);

      // Оновлюємо стан друзів після додавання коментаря
      setFriends((prevFriends) => {
        return prevFriends.map((friend) => {
          if (friend.uid === userId) {
            return {
              ...friend,
              posts: {
                ...friend.posts,
                [postId]: {
                  ...friend.posts[postId],
                  comments: [
                    ...(friend.posts[postId].comments || []),
                    newComment,
                  ],
                },
              },
            };
          }
          return friend;
        });
      });

      setCommentText("");
      toast.success("Comment added successfully");
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Failed to add comment");
    }
  };

  const toggleComments = (postId) => {
    setOpenPostId((prev) => (prev === postId ? null : postId));
  };

  // Завантаження друзів
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        if (currentUser?.uid) {
          const friendsContacts = await getFriendsContacts(currentUser.uid);
          console.log("Friends data:", friendsContacts);
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
    console.log("Processing friends:", friends);
    return friends.map((friend) => {
      const processedFriend = {
        id: friend.uid,
        name: friend.name,
        photoURL: friend.photoURL,
        posts: Object.values(friend.posts || {}).sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        ),
        createdAt: friend.createdAt,
      };
      console.log("Processed friend:", processedFriend);
      return processedFriend;
    });
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
                  <div
                    className={css.nameRow}
                    onClick={() => navigation(`/friends/${friend.id}`)}
                  >
                    {friend.photoURL ? (
                      <img
                        src={friend.photoURL}
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
                  {post.imageUrl && (
                    <img
                      src={post.imageUrl}
                      alt="PostPhoto"
                      className={css.photoWraper}
                    />
                  )}
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
