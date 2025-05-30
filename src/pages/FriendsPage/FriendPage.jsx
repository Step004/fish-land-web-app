import { useState, useEffect } from "react";
import css from "./FriendPage.module.css";
import {
  getAllUsers,
  getFriendsContacts,
  getUserById,
} from "../../firebase/firebase/readData.js";
import defaultPhoto from "../../img/default-user.jpg";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../firebase/contexts/authContexts/index.jsx";
import { IoIosSend } from "react-icons/io";
import { IoMdAdd } from "react-icons/io";
import { i18n } from "../../utils/i18n";
import {
  addCommentToPost,
  addFriend,
  removeFriend,
  toggleLikeOnPost,
} from "../../firebase/firebase/writeData.js";
import { createChat } from "../../firebase/firebase/chats.js";
import Loader from "../../components/Loader/Loader.jsx";
import { useMediaQuery } from "react-responsive";
import { MdDelete } from "react-icons/md";
import toast from "react-hot-toast";
import { FcLike, FcLikePlaceholder } from "react-icons/fc";
import { FaRegCommentAlt } from "react-icons/fa";
import Zoom from "react-medium-image-zoom";

export default function FriendPage() {
  const { currentUser } = useAuth();
  const { friendId } = useParams();
  const [user, setUser] = useState(null);
  const [friends, setFriends] = useState(null);
  const [isFriend, setIsFriend] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [commentText, setCommentText] = useState("");
  const [openPostId, setOpenPostId] = useState(null);

  const handleLike = async (userId, postId) => {
    try {
      await toggleLikeOnPost(userId, postId, currentUser.uid);

      setUser((prevUser) => ({
        ...prevUser,
        posts: {
          ...prevUser.posts,
          [postId]: {
            ...prevUser.posts[postId],
            likes: prevUser.posts[postId].likes?.includes(currentUser.uid)
              ? prevUser.posts[postId].likes.filter(
                  (id) => id !== currentUser.uid
                )
              : [...(prevUser.posts[postId].likes || []), currentUser.uid],
          },
        },
      }));
    } catch (error) {
      console.error("Error toggling like:", error);
      toast.error(i18n.t("friendPage.messages.likeError"));
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

      setUser((prevUser) => ({
        ...prevUser,
        posts: {
          ...prevUser.posts,
          [postId]: {
            ...prevUser.posts[postId],
            comments: [...(prevUser.posts[postId].comments || []), newComment],
          },
        },
      }));

      setCommentText("");
      toast.success(i18n.t("friendPage.messages.commentAdded"));
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error(i18n.t("friendPage.messages.commentError"));
    }
  };

  const toggleComments = (postId) => {
    setOpenPostId((prev) => (prev === postId ? null : postId));
  };

  const isTabletScreen = useMediaQuery({ query: "(max-width: 768px)" });
  const isSmallScreen = useMediaQuery({ query: "(max-width: 515px)" });
  let value = 6;
  if (isTabletScreen) {
    value = 4;
  }
  if (isSmallScreen) {
    value = 3;
  }

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const friendsContacts = await getFriendsContacts(friendId);
        const userData = await getUserById(friendId);
        const usersData = await getAllUsers();
        setFriends(friendsContacts);
        setUser(userData);

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
      const chatId = await createChat(currentUser, user);
      navigate(`/message/${chatId}`);
    } catch (error) {
      console.error("Failed to create chat:", error);
    }
  };
  return (
    <main className={css.container}>
      <Zoom
        overlayBgColorEnd="rgba(0, 0, 0, 0.85)"
        zoomMargin={40}
        transitionDuration={300}
      >
        {user?.photoURL ? (
          <img
            src={user?.photoURL}
            alt={i18n.t("friendPage.aria.userPhoto")}
            className={css.photo}
          />
        ) : (
          <img
            src={defaultPhoto}
            alt={i18n.t("friendPage.aria.defaultPhoto")}
            className={css.photo}
          />
        )}
      </Zoom>
      <div className={css.containerForElement}>
        <div className={css.nameAndButton}>
          <div className={css.nameAndStatus}>
            <h2 className={css.userName}>{user.name}</h2>
            <p>
              {user.online ? (
                <span className={css.online}>
                  {i18n.t("friendPage.status.online")}
                </span>
              ) : (
                <span className={css.offline}>
                  {i18n.t("friendPage.status.offline")}
                </span>
              )}
            </p>
          </div>
          <div className={css.buttonsFriend}>
            {isFriend ? (
              <p className={css.online}>
                {i18n.t("friendPage.messages.areFriends")}{" "}
                <MdDelete
                  className={css.deleteIcon}
                  aria-label={i18n.t("friendPage.aria.deleteIcon")}
                  onClick={async () => {
                    try {
                      await removeFriend(currentUser.uid, user.uid);
                      toast.success(
                        i18n.t("friendPage.messages.friendDeleted")
                      );
                    } catch (error) {
                      console.log(error);
                    }
                  }}
                />
              </p>
            ) : (
              <button className={css.publish} onClick={handleAddFriend}>
                <IoMdAdd />
                {i18n.t("friendPage.buttons.addFriend")}
              </button>
            )}
            <button className={css.publish} onClick={handleStartChat}>
              <IoIosSend className={css.sendMessageIcon} />
              {i18n.t("friendPage.buttons.sendMessage")}
            </button>
          </div>
        </div>
        <div className={css.descriptions}>
          {user.origin ? (
            <p className={css.desc}>
              {i18n.t("friendPage.labels.from")}: <span>{user.origin}</span>
            </p>
          ) : null}
          {user.age ? (
            <p className={css.desc}>
              {i18n.t("friendPage.labels.age")}: <span>{user.age}</span>
            </p>
          ) : null}
          {user.number ? (
            <p className={css.desc}>
              {i18n.t("friendPage.labels.number")}: <span>{user.number}</span>
            </p>
          ) : null}
        </div>
        {user.preference ? (
          <p className={css.fromLocal}>
            {i18n.t("friendPage.labels.preference")}:{" "}
            <span>{user.preference}</span>
          </p>
        ) : null}
        <div className={css.containerForPhotoText}>
          <h3 className={css.forP}>{i18n.t("friendPage.labels.photo")}:</h3>
          {user.gallery ? (
            <ul className={css.photoList}>
              {user.gallery.map((photo) => (
                <li key={photo.id} className={css.photoItem}>
                  <Zoom
                    overlayBgColorEnd="rgba(0, 0, 0, 0.85)"
                    zoomMargin={40}
                    transitionDuration={300}
                  >
                    <img
                      src={photo.url}
                      alt={i18n.t("friendPage.aria.userPhoto")}
                      className={css.photoItem}
                    />
                  </Zoom>
                </li>
              ))}
            </ul>
          ) : (
            <p className={css.pointPhoto}>
              {i18n.t("friendPage.messages.noPhotos", { name: user.name })}
            </p>
          )}
        </div>
        <div className={css.containerForSeeAll}>
          <h3 className={css.friendsP}>
            {i18n.t("friendPage.labels.friends")}: {Object.keys(friends).length}
          </h3>
          <button
            className={css.buttonSeeAll}
            onClick={() => {
              navigation("/friends/friends", { state: { uid: friendId } });
            }}
          >
            {i18n.t("friendPage.buttons.seeAll")}
          </button>
        </div>
        {friends ? (
          <ul className={css.friendList}>
            {Object.keys(friends)
              .slice(0, value)
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
                  {friends[userId].photoURL ? (
                    <img
                      src={friends[userId].photoURL}
                      alt={i18n.t("friendPage.aria.userPhoto")}
                      className={css.friendPhoto}
                    />
                  ) : (
                    <img
                      src={defaultPhoto}
                      alt={i18n.t("friendPage.aria.defaultPhoto")}
                      className={css.friendPhoto}
                    />
                  )}
                  <p className={css.friendName}>{friends[userId].name}</p>
                </li>
              ))}
          </ul>
        ) : (
          <p>{i18n.t("friendPage.messages.noUsers")}</p>
        )}
        <div className={css.publications}>
          <div className={css.contPubl}>
            <h3 className={css.publicationsText}>
              {i18n.t("friendPage.labels.publications")}
            </h3>
          </div>
          <div className={css.containerForPublic}>
            {user.posts ? (
              <ul className={css.listPublications}>
                {user.posts &&
                  Object.values(user.posts)
                    .sort(
                      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
                    )
                    .map((post, index) => (
                      <li key={index} className={css.listPublicationsItem}>
                        <p className={css.titlePost}>{post.title}</p>
                        <p className={css.contentPost}>{post.content}</p>
                        {post.imageUrl && (
                          <img
                            src={post.imageUrl}
                            alt={i18n.t("friendPage.aria.postPhoto")}
                            className={css.photoWraper}
                          />
                        )}
                        <div className={css.containerForLikesAndComments}>
                          <p
                            className={css.likes}
                            onClick={() => handleLike(currentUser.uid, post.id)}
                          >
                            {i18n.t("friendPage.labels.like")}{" "}
                            {post.likes?.length || 0}
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
                            {i18n.t("friendPage.labels.comments")}{" "}
                            {post.comments?.length || 0}
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
                                {i18n.t("friendPage.buttons.send")}
                              </button>
                            </div>
                          </div>
                        )}
                      </li>
                    ))}
              </ul>
            ) : (
              <p className={css.pForNothingPublications}>
                {i18n.t("friendPage.messages.noPublications", {
                  name: user.name,
                })}
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
