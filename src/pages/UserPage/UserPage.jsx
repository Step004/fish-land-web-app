import { useState, useEffect } from "react";
import css from "./UserPage.module.css";
import { useAuth } from "../../firebase/contexts/authContexts/index.jsx";
import { getAllUsers, getUserById } from "../../firebase/firebase/readData.js";
import defaultPhoto from "../../img/default-user.jpg";
import { IoSettingsOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { IoMdAddCircleOutline } from "react-icons/io";
import UserSettingsModal from "../../components/UserSettingsModal/UserSettingsModal.jsx";
import AddPostModal from "../../components/AddPostModal/AddPostModal.jsx";

// import { IoAddSharp } from "react-icons/io5";

export default function UserPage() {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openSetting, setOpenSetting] = useState(false);
  const [thisUser, setThisUser] = useState(null);
  const [openAddPost, setOpenAddPost] = useState(false);
  const navigation = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersData = await getAllUsers();
        const user = await getUserById(currentUser.uid);
        setThisUser(user);
        setUsers(usersData);
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

  if (loading) return <p>Loading...</p>;

  const toggleSettings = () => {
    setOpenSetting(!openSetting);
  };
  const toggleAddPost = () => {
    setOpenAddPost(!openAddPost);
  };
  const userPhoto = thisUser.photo ? (
    <img src={thisUser.photo} alt="UserPhoto" className={css.photo} />
  ) : (
    <img src={defaultPhoto} alt="UserPhoto" className={css.photo} />
  );
  return (
    <main className={css.container}>
      <div>
        {userPhoto}
        <div className={css.containerForRecommended}>
          <h2>Recommendations</h2>
          <ul>
            <li>1</li>
            <li>2</li>
            <li>3</li>
            <li>4</li>
          </ul>
        </div>
      </div>
      <div className={css.containerForElement}>
        <div className={css.nameAndButton}>
          <h2 className={css.userName}>{thisUser.name}</h2>
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
            My friends: {Object.keys(users).length}
          </h3>
          <button
            className={css.buttonSeeAll}
            onClick={() => {
              navigation("/friends");
            }}
          >
            See all
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
                    if (userId == currentUser.uid) {
                      navigation("/user");
                    } else navigation(`/friends/${userId}`);
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
            <button className={css.publish} onClick={toggleAddPost}>
              {/* <IoAddSharp className={css.iconAdd} /> */}
              Add news
            </button>
          </div>
          <div className={css.containerForPublic}>
            {thisUser.posts ? (
              <ul className={css.listPublications}>
                {thisUser.posts.map((post) => (
                  <li key={post.id} className={css.listPublicationsItem}>
                    <p className={css.titlePost}>{post.title}</p>
                    <p className={css.contentPost}>{post.content}</p>
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
      {openAddPost && <AddPostModal close={toggleAddPost} />}
    </main>
  );
}
