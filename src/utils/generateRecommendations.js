import { collection, getDocs } from "firebase/firestore";
import { firestore } from "../firebase/firebase/firebase";
export async function generateRecommendations(userData) {
  try {
    if (!userData.origin) {
      console.log("Ви не вказали місто");

      return {
        message: `Ви не вказали місто`,
      };
    }

    // Нормалізуємо місто користувача
    const userCity = userData.origin.trim().toLowerCase();
    // Отримуємо всі місця з колекції places
    const placesRef = collection(firestore, "places");
    const placesSnapshot = await getDocs(placesRef);
    const allPlaces = [];

    const recommendations = [];

    // Отримуємо відповіді користувача
    const userAnswers = userData.answers || {};

    placesSnapshot.forEach((doc) => {
      allPlaces.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    // Фільтрація місць
    for (const place of allPlaces) {
      const placeCity = place.location.trim().toLowerCase();

      // Пропускаємо, якщо місто не збігається
      if (placeCity !== userCity) {
        continue;
      }

      let matchScore = 0;

      // 1. Фільтрація за типом риби (якщо вказано)
      const requestedFishType = userAnswers[1]; // Питання 1: Тип риби
      if (
        requestedFishType &&
        Array.isArray(place.fishTypes) && // Перевірка, чи fishTypes - це масив
        place.fishTypes.includes(requestedFishType)
      ) {
        matchScore += 1;
      }

      // 2. Фільтрація за місцем риболовлі (берег чи човен)
      const requestedFishingLocation = userAnswers[2]; // Питання 2: Ловля з берега чи з човна
      if (
        requestedFishingLocation &&
        requestedFishingLocation !== "Без різниці" &&
        place.fishingLocation &&
        requestedFishingLocation === place.fishingLocation
      ) {
        matchScore += 1;
      }

      // 3. Фільтрація за стилем риболовлі
      const requestedFishingStyle = userAnswers[3]; // Питання 3: Стиль риболовлі
      if (
        requestedFishingStyle &&
        Array.isArray(place.fishingStyles) && // Перевірка, чи fishingStyles - це масив
        requestedFishingStyle.some((style) =>
          place.fishingStyles.includes(style)
        )
      ) {
        matchScore += 1;
      }

      // 4. Фільтрація за нічною риболовлею
      const likesNightFishing = userAnswers[4]; // Питання 4: Нічна риболовля
      if (likesNightFishing === "Так" && place.hasNightFishing) {
        matchScore += 1;
      }

      // 5. Фільтрація за типом водойми
      const requestedWaterTypes = userAnswers[5]; // Питання 5: Типи водойм
      if (
        requestedWaterTypes &&
        Array.isArray(place.waterTypes) && // Перевірка, чи waterTypes - це масив
        requestedWaterTypes.some((type) => place.waterTypes.includes(type))
      ) {
        matchScore += 1;
      }

      // 6. Фільтрація за відстанню
      const maxDistance = userAnswers[6]; // Питання 6: Максимальна відстань
      if (maxDistance && place.distance <= maxDistance) {
        matchScore += 1;
      }

      // 7. Фільтрація за зручностями
      const requestedFacilities = userAnswers[7]; // Питання 7: Зручності
      if (
        requestedFacilities &&
        Array.isArray(place.facilities) && // Перевірка, чи facilities - це масив
        requestedFacilities.some((facility) =>
          place.facilities.includes(facility)
        )
      ) {
        matchScore += 1;
      }

      // 8. Погода
      const weatherPreference = userAnswers[8]; // Питання 8: Погода
      if (
        weatherPreference &&
        Array.isArray(place.weatherTypes) && // Перевірка, чи weatherTypes - це масив
        place.weatherTypes.includes(weatherPreference)
      ) {
        matchScore += 1;
      }

      // 9. Досвід у риболовлі
      const fishingExperience = userAnswers[9]; // Питання 9: Досвід у риболовлі
      if (fishingExperience && place.experienceLevel === fishingExperience) {
        matchScore += 1;
      }

      // Якщо місце пройшло всі фільтри, додаємо до рекомендацій
      if (matchScore >= 0) {
        recommendations.push({
          place_name: place.name,
          location: place.location,
          facilities: place.facilities,
          matchScore: matchScore,
        });
      }
    }

    // Сортуємо місця за найбільшим коефіцієнтом відповідності
    recommendations.sort((a, b) => b.matchScore - a.matchScore);

    // Вибираємо топ-3 місця
    const topRecommendations = recommendations.slice(0, 3);
    console.log(topRecommendations);

    // Якщо рекомендацій немає, повертаємо повідомлення
    if (topRecommendations.length === 0) {
      console.log("У місті немає місць, що відповідають вашим критеріям");
      return {
        message: `У місті ${userData.origin} немає місць, що відповідають вашим критеріям`,
      };
    }

    return topRecommendations;
  } catch (error) {
    console.log("error", error);
    return { error: error.message };
  }
}
