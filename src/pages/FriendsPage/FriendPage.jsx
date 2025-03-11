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
import { addFriend, removeFriend } from "../../firebase/firebase/writeData.js";
import { createChat } from "../../firebase/firebase/chats.js";
import Loader from "../../components/Loader/Loader.jsx";
import { useMediaQuery } from "react-responsive";
import { MdDelete } from "react-icons/md";
import toast from "react-hot-toast";
import { FcLike, FcLikePlaceholder } from "react-icons/fc";
import { FaRegCommentAlt } from "react-icons/fa";

export default function FriendPage() {
  const { currentUser } = useAuth();
  const { friendId } = useParams();
  const [user, setUser] = useState(null);
  const [friends, setFriends] = useState(null);
  const [isFriend, setIsFriend] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
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
  const isTabletScreen = useMediaQuery({ query: "(max-width: 768px)" });
  const isSmallScreen = useMediaQuery({ query: "(max-width: 515px)" });
  let value = 6;
  if (isTabletScreen) {
    value = 4;
  }
  if (isSmallScreen) {
    value = 3;
  }
  const [isLiked, setIsLiked] = useState(false);
  const [openPostId, setOpenPostId] = useState(null);

  const handleLike = () => {
    setIsLiked(!isLiked);
  };
  const toggleComments = (postId) => {
    setOpenPostId((prev) => (prev === postId ? null : postId));
    console.log(postId);
  };

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
              <p className={css.online}>
                We are friends.{" "}
                <MdDelete
                  className={css.deleteIcon}
                  onClick={async () => {
                    try {
                      await removeFriend(currentUser.uid, user.uid);
                      toast.success("Friend deleted successfully");
                    } catch (error) {
                      console.log(error);
                    }
                  }}
                />
              </p>
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
                {user.posts &&
                  Object.values(user.posts).map((post) => (
                    <li key={post.id} className={css.listPublicationsItem}>
                      <p className={css.titlePost}>{post.title}</p>
                      <p className={css.contentPost}>{post.content}</p>
                      <div className={css.containerForLikesAndComments}>
                        <p
                          className={css.likes}
                          onClick={() => handleLike(currentUser.uid, post.id)}
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
