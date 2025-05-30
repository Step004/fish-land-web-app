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
    };
    fetchRecommendations();
  }, [userFromDB]);
  const handleOpenMap = (placeName) => {
    console.log(placeName);

    window.open(
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        placeName
      )}`,
      "_blank"
    );
  };

  return (
    <div className={css.container}>
      {Array.isArray(recommendations) && recommendations.length > 0 ? (
        recommendations.map((item, index) => (
          <div
            key={index}
            className={css.containerForRecommendation}
            onClick={() => {
              handleOpenMap(`${item.place_name} ${item.location}`);
            }}
          >
            <div className={css.containerForIcon}>
              <MdLocationSearching className={css.icon} />
              <h3 className={css.placeName}>{item.place_name}</h3>
            </div>
            <div className={css.containerForIcon}>
              <FaLocationDot className={css.icon} />
              <p className={css.location}>{item.location}</p>
            </div>
          </div>
        ))
      ) : (
        <p>{recommendations.message}.</p>
      )}
    </div>
  );
};
