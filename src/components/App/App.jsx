import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import Layout from "../Layout/Layout.jsx";

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
const NotFoundPage = lazy(() =>
  import("../../pages/NotFoundPage/NotFoundPage")
);

function App() {

  return (
    <Layout>
      <Suspense fallback={<div>Please wait loading page...</div>}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegistrationPage />} />
          <Route path="/user" element={<UserPage />} />
          <Route path="/friends/:friendId" element={<FriendPage />} />
          <Route path="/friends" element={<FriendListPage />} />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </Layout>
  );
}

export default App;
