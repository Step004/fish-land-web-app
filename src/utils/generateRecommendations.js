import { collection, getDocs } from "firebase/firestore";
import { firestore } from "../firebase/firebase/firebase";
import { i18n } from "./i18n";

export async function generateRecommendations(userData) {
  try {
    if (!userData.origin) {
      const message = i18n.t("recommendations.errors.noCitySpecified");
      console.log(message);
      return { message };
    }
    const userCity = userData.origin.trim().toLowerCase();
    const placesRef = collection(firestore, "places");
    const placesSnapshot = await getDocs(placesRef);
    const allPlaces = [];
    const recommendations = [];
    const userAnswers = userData.answers || {};
    placesSnapshot.forEach((doc) => {
      allPlaces.push({
        id: doc.id,
        ...doc.data(),
      });
    });
    for (const place of allPlaces) {
      const placeCity = place.location.trim().toLowerCase();

      if (placeCity !== userCity) {
        continue;
      }
      let matchScore = 0;
      // 1. Фільтрація за типом риби
      const requestedFishType = userAnswers[1];
      if (
        requestedFishType &&
        Array.isArray(place.fishTypes) &&
        place.fishTypes.includes(requestedFishType)
      ) {
        matchScore += 1;
      }
      // 2. Фільтрація за місцем риболовлі
      const requestedFishingLocation = userAnswers[2];
      if (
        requestedFishingLocation &&
        requestedFishingLocation !==
          i18n.t("recommendations.fishingLocation.noPreference") &&
        place.fishingLocation &&
        requestedFishingLocation === place.fishingLocation
      ) {
        matchScore += 1;
      }
      // 3. Фільтрація за стилем риболовлі
      const requestedFishingStyle = userAnswers[3];
      if (
        requestedFishingStyle &&
        Array.isArray(place.fishingStyles) &&
        requestedFishingStyle.some((style) =>
          place.fishingStyles.includes(style)
        )
      ) {
        matchScore += 1;
      }
      // 4. Фільтрація за нічною риболовлею
      const likesNightFishing = userAnswers[4];
      if (
        likesNightFishing === i18n.t("recommendations.answers.yes") &&
        place.hasNightFishing
      ) {
        matchScore += 1;
      }
      // 5. Фільтрація за типом водойми
      const requestedWaterTypes = userAnswers[5];
      if (
        requestedWaterTypes &&
        Array.isArray(place.waterTypes) &&
        requestedWaterTypes.some((type) => place.waterTypes.includes(type))
      ) {
        matchScore += 1;
      }
      // 6. Фільтрація за відстанню
      const maxDistance = userAnswers[6];
      if (maxDistance && place.distance <= maxDistance) {
        matchScore += 1;
      }
      // 7. Фільтрація за зручностями
      const requestedFacilities = userAnswers[7];
      if (
        requestedFacilities &&
        Array.isArray(place.facilities) &&
        requestedFacilities.some((facility) =>
          place.facilities.includes(facility)
        )
      ) {
        matchScore += 1;
      }
      // 8. Погода
      const weatherPreference = userAnswers[8];
      if (
        weatherPreference &&
        Array.isArray(place.weatherTypes) &&
        place.weatherTypes.includes(weatherPreference)
      ) {
        matchScore += 1;
      }
      // 9. Досвід у риболовлі
      const fishingExperience = userAnswers[9];
      if (fishingExperience && place.experienceLevel === fishingExperience) {
        matchScore += 1;
      }
      if (matchScore >= 0) {
        recommendations.push({
          place_name: place.name,
          location: place.location,
          facilities: place.facilities,
          matchScore: matchScore,
        });
      }
    }
    recommendations.sort((a, b) => b.matchScore - a.matchScore);
    const topRecommendations = recommendations.slice(0, 3);

    if (topRecommendations.length === 0) {
      const message = i18n.tReplace("recommendations.errors.noMatchingPlaces", {
        city: userData.origin,
      });
      console.log(message);
      return { message };
    }
    return topRecommendations;
  } catch (error) {
    const message = i18n.tReplace("recommendations.errors.generalError", {
      error: error.message,
    });
    console.log(message);
    return { error: error.message };
  }
}
