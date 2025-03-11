import { useState, useEffect } from "react";
import css from "./UserPage.module.css";
import { useAuth } from "../../firebase/contexts/authContexts/index.jsx";
import {
  getFriendsContacts,
  getUserAnswers,
  getUserById,
} from "../../firebase/firebase/readData.js";
import defaultPhoto from "../../img/default-user.jpg";
import { IoSettingsOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { IoMdAddCircleOutline } from "react-icons/io";
import UserSettingsModal from "../../components/UserSettingsModal/UserSettingsModal.jsx";
import AddPostModal from "../../components/AddPostModal/AddPostModal.jsx";
import Loader from "../../components/Loader/Loader.jsx";
import {
  addCommentToPost,
  deleteUserPost,
  toggleLikeOnPost,
} from "../../firebase/firebase/writeData.js";
import { MdDelete } from "react-icons/md";
import ModalQuestion from "../../components/ModalQuestion/ModalQuestion.jsx";
import { useMediaQuery } from "react-responsive";
import toast from "react-hot-toast";
import { Recommendations } from "../../components/Recommendations/Recommendations.jsx";
import { FcLike, FcLikePlaceholder } from "react-icons/fc";
import { FaRegCommentAlt } from "react-icons/fa";

export default function UserPage() {
  const { currentUser, userFromDB } = useAuth();
  console.log(userFromDB);

  const isTabletScreen = useMediaQuery({ query: "(max-width: 768px)" });
  const isSmallScreen = useMediaQuery({ query: "(max-width: 515px)" });
  let value = 6;
  if (isTabletScreen) {
    value = 4;
  }
  if (isSmallScreen) {
    value = 3;
  }

  const [friends, setFriends] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openSetting, setOpenSetting] = useState(false);
  const [thisUser, setThisUser] = useState(null);
  const [openAddPost, setOpenAddPost] = useState(false);
  const [questionOpen, setQuestionOpen] = useState(false);
  const [answers, setAnswers] = useState();
  ////////////////////////////////////
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
  ///////////////////////////////////////////
  const navigation = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const friendsContacts = await getFriendsContacts(currentUser.uid);
        const answers = await getUserAnswers(currentUser.uid);
        setAnswers(answers);
        const user = await getUserById(currentUser.uid);
        setFriends(friendsContacts);

        setThisUser(user);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchUsers();
    }
  }, [currentUser]);

  if (loading) return <Loader />;

  const toggleSettings = () => {
    setOpenSetting(!openSetting);
  };
  const toggleAddPost = () => {
    setOpenAddPost(!openAddPost);
  };
  const toggleQuestion = () => {
    setQuestionOpen(!questionOpen);
  };

  const handleDeletePost = async (postId) => {
    try {
      await deleteUserPost(currentUser.uid, postId);
      setThisUser((prevUser) => ({
        ...prevUser,
        posts: prevUser.posts.filter((post) => post.id !== postId),
      }));
      toast.success(`Post deleted successfully`);
    } catch (error) {
      console.log(error.message);
    }
  };

  const userPhoto = currentUser.photoURL ? (
    <img src={currentUser.photoURL} alt="UserPhoto" className={css.photo} />
  ) : (
    <img src={defaultPhoto} alt="UserPhoto" className={css.photo} />
  );

  return (
    <main className={css.container}>
      <div className={css.containerForImgAndRecommendation}>
        {userPhoto}
        <div className={css.containerForRecommended}>
          <h2>Recommendations</h2>
          {answers.length == 0 ? (
            <>
              <div className={css.containerForDescRecommend}>
                <p className={css.descRecommend}>
                  In order to receive recommendations for fishing spots, you
                  need to complete a survey!
                </p>
              </div>
              <button
                className={css.buttonStart}
                onClick={() => toggleQuestion()}
              >
                Start
              </button>
            </>
          ) : (
            <Recommendations answers={answers} />
          )}
        </div>
      </div>
      <div className={css.containerForElement}>
        <div className={css.nameAndButton}>
          <h2 className={css.userName}>{currentUser.displayName}</h2>
          <button className={css.buttonSettings} onClick={toggleSettings}>
            <IoSettingsOutline className={css.settingsIcon} />
          </button>
        </div>
        <div className={css.descriptions}>
          {thisUser.origin ? (
            <p className={css.desc}>
              From: <span>{thisUser.origin}</span>
            </p>
          ) : null}
          {thisUser.age ? (
            <p className={css.desc}>
              Age: <span>{thisUser.age}</span>
            </p>
          ) : null}
          {thisUser.number ? (
            <p className={css.desc}>
              Number: <span>{thisUser.number}</span>
            </p>
          ) : null}
        </div>
        {thisUser.preference ? (
          <p className={css.fromLocal}>
            Preference: <span>{thisUser.preference}</span>
          </p>
        ) : null}
        <div>
          <div className={css.containerForPhotoText}>
            <h3 className={css.forP}>My photos</h3>
            <button className={css.addPhotoButton}>
              <IoMdAddCircleOutline className={css.iconAdd} />{" "}
              <p className={css.textAdd}>Add photo</p>
            </button>
          </div>
          {thisUser.gallery ? (
            <ul className={css.photoList}>
              <li>1</li>
              <li>2</li>
              <li>3</li>
              <li>4</li>
            </ul>
          ) : (
            <p className={css.pointPhoto}>You don`t have photo yet.</p>
          )}
        </div>
        <div className={css.containerForSeeAll}>
          <h3 className={css.friendsP}>
            My friends: {Object.keys(friends).length}
          </h3>
          <button
            className={css.buttonSeeAll}
            onClick={() => {
              navigation("/friends/friends");
            }}
          >
            See all
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
            <button className={css.publish} onClick={toggleAddPost}>
              {/* <IoAddSharp className={css.iconAdd} /> */}
              Add news
            </button>
          </div>
          <div className={css.containerForPublic}>
            {thisUser.posts ? (
              <ul className={css.listPublications}>
                {thisUser.posts &&
                  Object.values(thisUser.posts).map((post) => (
                    <li key={post.id} className={css.listPublicationsItem}>
                      <p className={css.titlePost}>{post.title}</p>
                      <p className={css.contentPost}>{post.content}</p>
                      <button
                        className={css.deletePost}
                        onClick={() => handleDeletePost(post.id)}
                      >
                        <MdDelete className={css.deleteIcon} />
                      </button>
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
                You don`t have publications!
              </p>
            )}
          </div>
        </div>
      </div>
      {openSetting && (
        <UserSettingsModal close={toggleSettings} user={thisUser} />
      )}
      {openAddPost && (
        <AddPostModal close={toggleAddPost} handleAddPost={setThisUser} />
      )}
      {questionOpen && <ModalQuestion close={toggleQuestion} />}
    </main>
  );
}
