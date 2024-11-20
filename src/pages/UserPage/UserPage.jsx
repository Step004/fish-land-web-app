import { useState, useEffect } from "react";
import css from "./UserPage.module.css";
import { useAuth } from "../../firebase/contexts/authContexts/index.jsx";
import { getAllUsers } from "../../firebase/firebase/readData.js";
import defaultPhoto from "../../img/default-user.jpg";
import { IoSettingsOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
// import { IoAddSharp } from "react-icons/io5";

export default function UserPage() {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigate();
  console.log(currentUser);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersData = await getAllUsers();
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

  if (!currentUser) return <p>Please log in to view users.</p>;
  if (loading) return <p>Loading...</p>;
  console.log(users);


  return (
    <main className={css.container}>
      {currentUser.PhotoURL ? (
        <img src={currentUser.PhotoURL} alt="UserPhoto" className={css.photo} />
      ) : (
        <img src={defaultPhoto} alt="UserPhoto" className={css.photo} />
      )}
      <div className={css.containerForElement}>
        <div className={css.nameAndButton}>
          <h2 className={css.userName}>{currentUser.displayName}</h2>
          <button className={css.buttonSettings}>
            <IoSettingsOutline className={css.settingsIcon} />
          </button>
        </div>
        {false ? <p className={css.fromLocal}>From:</p> : null}
        <div>
          <h3 className={css.forP}>My photo:</h3>
          <ul className={css.photoList}>
            <li>1</li>
            <li>2</li>
            <li>3</li>
            <li>4</li>
          </ul>
        </div>
        <div className={css.containerForSeeAll}>
          <h3 className={css.friendsP}>
            My friends:{Object.keys(users).length}
          </h3>
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
                <li key={userId} className={css.friendItem} onClick={()=>{navigation(`/friends/${userId}`);}}>
                  {users[userId].photo !== "null" ? (
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
            <button className={css.publish}>
              {/* <IoAddSharp className={css.iconAdd} /> */}
              Add news
            </button>
          </div>
          <div className={css.containerForPublic}>
            <ul></ul>

            <p className={css.pForNothingPublications}>
              You don`t have publications!
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
