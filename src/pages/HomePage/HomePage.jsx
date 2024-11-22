import { useNavigate } from "react-router-dom";
import { useAuth } from "../../firebase/contexts/authContexts/index.jsx";
import { useEffect } from "react";

export default function HomePage() {
  const { userLoggedIn } = useAuth();
  const navigation = useNavigate();
  useEffect(() => {
    if (!userLoggedIn) navigation("/login");
  }, [userLoggedIn, navigation]);
  return <div></div>;
}
