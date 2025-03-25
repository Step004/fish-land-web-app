import { useEffect, useState } from "react";
import { useAuth } from "../../firebase/contexts/authContexts/index.jsx";
import css from "./Recommendations.module.css";
import { generateRecommendations } from "../../utils/generateRecommendations.js";
import { FaLocationDot } from "react-icons/fa6";
import { MdLocationSearching } from "react-icons/md";

export const Recommendations = () => {
  const { userFromDB } = useAuth();
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    const fetchRecommendations = async () => {
      const recommend = await generateRecommendations(userFromDB);
      setRecommendations(recommend);
      console.log("====>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", recommend);
    };
    fetchRecommendations();
  }, []);

  return (
    <div className={css.container}>
      {Array.isArray(recommendations) && recommendations.length > 0 ? (
        recommendations.map((item, index) => (
          <div key={index} className={css.containerForRecommendation}>
            <div className={css.containerForIcon}>
              <MdLocationSearching />
              <h3>{item.place_name}</h3>
            </div>
            <div className={css.containerForIcon}>
              <FaLocationDot />
              <p>{item.location}</p>
            </div>
          </div>
        ))
      ) : (
        <p>Немає рекомендацій для відображення.</p>
      )}
    </div>
  );
};
