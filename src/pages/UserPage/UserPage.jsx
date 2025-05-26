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
  uploadGalleryImage,
} from "../../firebase/firebase/writeData.js";
import { MdDelete } from "react-icons/md";
import ModalQuestion from "../../components/ModalQuestion/ModalQuestion.jsx";
import { useMediaQuery } from "react-responsive";
import toast from "react-hot-toast";
import { Recommendations } from "../../components/Recommendations/Recommendations.jsx";
import { FcLike, FcLikePlaceholder } from "react-icons/fc";
import { FaRegCommentAlt } from "react-icons/fa";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";
import ModalAddPlace from "../../components/ModalAddplace/ModalAddplace.jsx";
import { i18n } from "../../utils/i18n";

export default function UserPage() {
  const { currentUser } = useAuth();

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
  const [addPlaceOpen, setAddPlaceOpen] = useState(false);
  const [answers, setAnswers] = useState();
  ////////////////////////////////////
  const [openPostId, setOpenPostId] = useState(null);
  const [commentText, setCommentText] = useState("");

  const handleLike = async (userId, postId) => {
    try {
      await toggleLikeOnPost(userId, postId, currentUser.uid);

      // Оновлюємо стан користувача після зміни лайків
      setThisUser((prevUser) => ({
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

      // Оновлюємо стан користувача після додавання коментаря
      setThisUser((prevUser) => ({
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
      toast.success("Comment added successfully");
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Failed to add comment");
    }
  };

  const toggleComments = (postId) => {
    setOpenPostId((prev) => (prev === postId ? null : postId));
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
  const toggleAddPlace = () => {
    setAddPlaceOpen(!addPlaceOpen);
  };

  const handleDeletePost = async (postId) => {
    try {
      await deleteUserPost(currentUser.uid, postId);
      setThisUser((prevUser) => ({
        ...prevUser,
        posts: Object.values(prevUser.posts || {}).filter(
          (post) => post.id !== postId
        ),
      }));
      toast.success(`Post deleted successfully`);
    } catch (error) {
      console.log(error.message);
    }
  };

  const userPhoto = thisUser.photoURL ? (
    <img src={thisUser.photoURL} alt="UserPhoto" className={css.photo} />
  ) : (
    <img src={defaultPhoto} alt="UserPhoto" className={css.photo} />
  );
  if (!thisUser) {
    return;
  }

  const handleAddPhoto = async (event) => {
    const file = event.target.files[0];
    if (file && currentUser) {
      try {
        const photoUrl = await uploadGalleryImage(file, currentUser.uid);
        setThisUser((prevUser) => ({
          ...prevUser,
          gallery: [...(prevUser.gallery || []), { url: photoUrl }],
        }));
        toast.success(i18n.t("userPage.messages.photoAddSuccess"));
      } catch (error) {
        console.error("Error adding photo to gallery:", error);
        toast.error(i18n.t("userPage.messages.photoAddError"));
      }
    } else {
      toast.error(i18n.t("userPage.messages.fileSelectError"));
    }
  };

  return (
    <main className={css.container}>
      <div className={css.containerForImgAndRecommendation}>
        <Zoom
          overlayBgColorEnd="rgba(0, 0, 0, 0.85)"
          zoomMargin={40}
          transitionDuration={300}
        >
          {userPhoto}
        </Zoom>
        <div className={css.containerForRecommended}>
          <h2>{i18n.t("userPage.titles.recommendations")}</h2>
          {answers.length === 0 ? (
            <>
              <div className={css.containerForDescRecommend}>
                <p className={css.descRecommend}>
                  {i18n.t("userPage.messages.recommendationsSurvey")}
                </p>
              </div>
              <button
                className={css.buttonStart}
                onClick={() => toggleQuestion()}
              >
                {i18n.t("userPage.buttons.start")}
              </button>
            </>
          ) : (
            <Recommendations />
          )}
        </div>
        <button className={css.buttonAddPlace} onClick={toggleAddPlace}>
          {i18n.t("userPage.buttons.addPlace")}
        </button>
      </div>
      <div className={css.containerForElement}>
        <div className={css.nameAndButton}>
          <h2 className={css.userName}>{currentUser.displayName}</h2>
          <button className={css.buttonSettings} onClick={toggleSettings}>
            <IoSettingsOutline className={css.settingsIcon} />
          </button>
        </div>
        <div className={css.descriptions}>
          {thisUser.origin && (
            <p className={css.desc}>
              {i18n.t("userPage.labels.from")}: <span>{thisUser.origin}</span>
            </p>
          )}
          {thisUser.age && (
            <p className={css.desc}>
              {i18n.t("userPage.labels.age")}: <span>{thisUser.age}</span>
            </p>
          )}
          {thisUser.number && (
            <p className={css.desc}>
              {i18n.t("userPage.labels.number")}: <span>{thisUser.number}</span>
            </p>
          )}
        </div>
        {thisUser.preference && (
          <p className={css.fromLocal}>
            {i18n.t("userPage.labels.preference")}:{" "}
            <span>{thisUser.preference}</span>
          </p>
        )}
        <div>
          <div className={css.containerForPhotoText}>
            <h3 className={css.forP}>{i18n.t("userPage.titles.myPhotos")}</h3>
            <label className={css.addPhotoButton}>
              <input
                type="file"
                accept="image/*"
                onChange={handleAddPhoto}
                style={{ display: "none" }}
              />
              <IoMdAddCircleOutline className={css.iconAdd} />
              <p className={css.textAdd}>
                {i18n.t("userPage.buttons.addPhoto")}
              </p>
            </label>
          </div>
          {thisUser.gallery ? (
            <ul className={css.photoList}>
              {thisUser.gallery.map((photo, index) => (
                <li key={index} className={css.photoItem}>
                  <Zoom
                    overlayBgColorEnd="rgba(0, 0, 0, 0.85)"
                    zoomMargin={40}
                    transitionDuration={300}
                  >
                    <img src={photo.url} alt="fish" className={css.photoItem} />
                  </Zoom>
                </li>
              ))}
            </ul>
          ) : (
            <p className={css.pointPhoto}>
              {i18n.t("userPage.messages.noPhotos")}
            </p>
          )}
        </div>
        <div className={css.containerForSeeAll}>
          <h3 className={css.friendsP}>
            {i18n.t("userPage.titles.myFriends")}: {Object.keys(friends).length}
          </h3>
          <button
            className={css.buttonSeeAll}
            onClick={() => {
              navigation("/friends/friends");
            }}
          >
            {i18n.t("userPage.buttons.seeAll")}
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
          <p>{i18n.t("userPage.messages.noUsers")}</p>
        )}
        <div className={css.publications}>
          <div className={css.contPubl}>
            <h3 className={css.publicationsText}>
              {i18n.t("userPage.titles.publications")}
            </h3>
            <button className={css.publish} onClick={toggleAddPost}>
              {i18n.t("userPage.buttons.addNews")}
            </button>
          </div>
          <div className={css.containerForPublic}>
            {thisUser.posts ? (
              <ul className={css.listPublications}>
                {thisUser.posts &&
                  Object.values(thisUser.posts)
                    .sort(
                      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
                    )
                    .map((post) => (
                      <li key={post.id} className={css.listPublicationsItem}>
                        <p className={css.titlePost}>{post.title}</p>
                        <p className={css.contentPost}>{post.content}</p>
                        {post.imageUrl && (
                          <div className={css.postImageContainer}>
                            <Zoom>
                              <img
                                src={post.imageUrl}
                                alt="Post"
                                className={css.postImage}
                              />
                            </Zoom>
                          </div>
                        )}
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
                            {i18n.t("userPage.social.like")}{" "}
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
                            {i18n.t("userPage.social.comments")}{" "}
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
                              <textarea
                                className={css.commentInput}
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                placeholder={i18n.t(
                                  "userPage.social.writeComment"
                                )}
                              />
                              <button
                                className={css.commentButtonSend}
                                onClick={() =>
                                  handleAddComment(currentUser.uid, post.id)
                                }
                              >
                                {i18n.t("userPage.buttons.send")}
                              </button>
                            </div>
                          </div>
                        )}
                      </li>
                    ))}
              </ul>
            ) : (
              <p className={css.pForNothingPublications}>
                {i18n.t("userPage.messages.noPublications")}
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
      {addPlaceOpen && <ModalAddPlace close={toggleAddPlace} />}
    </main>
  );
}
