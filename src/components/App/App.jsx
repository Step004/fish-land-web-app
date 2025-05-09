import { lazy, Suspense, useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import Layout from "../Layout/Layout.jsx";
import { useAuth } from "../../firebase/contexts/authContexts/index.jsx";
import Loader from "../Loader/Loader.jsx";
import { i18n } from "../../utils/i18n.js";

const HomePage = lazy(() => import("../../pages/HomePage/HomePage.jsx"));
const UserPage = lazy(() => import("../../pages/UserPage/UserPage.jsx"));
const LoginPage = lazy(() => import("../../pages/LoginPage/LoginPage.jsx"));
const RegistrationPage = lazy(() =>
  import("../../pages/RegistrationPage/RegistrationPage.jsx")
);
const FriendPage = lazy(() => import("../../pages/FriendsPage/FriendPage.jsx"));
const FriendListPage = lazy(() =>
  import("../../pages/FriendListPage/FriendListPage.jsx")
);
const MessagePage = lazy(() =>
  import("../../pages/MessagePage/MessagePage.jsx")
);

const MapPage = lazy(() => import("../../pages/MapPage/MapPage.jsx"));
const UsersList = lazy(() => import("../UsersList/UsersList.jsx"));
const FriendsList = lazy(() => import("../FriendsList/FriendsList.jsx"));
const Messages = lazy(() => import("../Messages/Messages.jsx"));

const NotFoundPage = lazy(() =>
  import("../../pages/NotFoundPage/NotFoundPage")
);

function App() {
  const { loading, userFromDB } = useAuth();
  useEffect(() => {
    // Встановлюємо мову з даних користувача, якщо він авторизований
    if (userFromDB?.language) {
      i18n.setLanguage(userFromDB.language);
    }
  }, [userFromDB]);

  if (loading) return <Loader />;

  return (
    <Layout>
      <Suspense fallback={<div>Please wait loading page...</div>}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegistrationPage />} />
          <Route path="/user" element={<UserPage />} />
          <Route path="/friends/:friendId" element={<FriendPage />} />
          <Route path="/friends" element={<FriendListPage />}>
            <Route path="friends" element={<FriendsList />} />
            <Route path="users" element={<UsersList />} />
          </Route>
          <Route path="/message" element={<MessagePage />}>
            <Route path="/message/:chatId" element={<Messages />} />
          </Route>
          <Route path="/map" element={<MapPage />} />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </Layout>
  );
}

export default App;
