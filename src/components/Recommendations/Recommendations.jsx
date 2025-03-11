import { useEffect, useState } from "react";
import { useAuth } from "../../firebase/contexts/authContexts/index.jsx";
import css from "./Recommendations.module.css";
import { getRecommendations } from "../../utils/requests.js";
export const Recommendations = ({ answers }) => {
  const { userFromDB } = useAuth();
  const sessionKey = Object.keys(answers)[0];
  const userAnswers = answers[sessionKey]?.answers;
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    const fetchRecommendations = async () => {
      const recommend = await getRecommendations(
        userFromDB.uid,
        userFromDB.origin,
        userAnswers[5],
        userAnswers[7]
      );
      setRecommendations(recommend);
      console.log("====>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", recommend);
    };
    fetchRecommendations();
  }, []);

  return (
    <div className={css.container}>
      {Array.isArray(recommendations) && recommendations.length > 0 ? (
        recommendations.map((item, index) => (
          <div key={index}>
            <h2>{item.place_name}</h2>
            <p>{item.location}</p>
          </div>
        ))
      ) : (
        <p>Немає рекомендацій для відображення.</p>
      )}
    </div>
  );
};
