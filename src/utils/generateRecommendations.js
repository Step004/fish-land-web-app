import { places } from "../source/places.json";

export function generateRecommendations(userData) {
  try {
    // Перевірка наявності поля 'city'
    if (!userData.origin || !userData.origin.trim()) {
      throw new Error("Поле 'city' відсутнє або пусте у вхідних даних");
    }

    // Нормалізуємо місто користувача
    const userCity = userData.origin.trim().toLowerCase();
    const recommendations = [];

    // Логування (опціонально, можна прибрати, якщо не потрібно)
    console.log(`Шукаємо місця в місті: ${userCity}`);
    console.log(
      `Критерії: тип водойми ${userData.answers?.[5]}, зручності ${userData.answers?.[7]}`
    );

    // Фільтрація місць
    for (const place of places) {
      const placeCity = place.location.trim().toLowerCase();

      // Пропускаємо, якщо місто не збігається
      if (placeCity !== userCity) {
        console.log(`Пропускаємо ${place.name} - не в місті ${userCity}`);
        continue;
      }

      // Фільтрація за типом водойми (якщо вказано)
      const requestedTypes = userData.answers?.[5]; // Отримуємо типи, якщо є
      if (requestedTypes && Array.isArray(requestedTypes)) {
        if (!requestedTypes.includes(place.type)) {
          console.log(
            `Пропускаємо ${place.name} - тип ${place.type} не відповідає`
          );
          continue;
        }
      } else {
        console.log(
          `Тип водойми не вказано, враховуємо всі типи для ${place.name}`
        );
      }

      // Фільтрація за зручностями (якщо вказано)
      const requestedFacilities = userData.answers?.[7]; // Отримуємо зручності, якщо є
      if (requestedFacilities && Array.isArray(requestedFacilities)) {
        const hasFacility = place.facilities.some((facility) =>
          requestedFacilities.includes(facility)
        );
        if (!hasFacility) {
          console.log(
            `Пропускаємо ${place.name} - зручності ${place.facilities} не відповідають`
          );
          continue;
        }
      } else {
        console.log(
          `Зручності не вказано, враховуємо всі зручності для ${place.name}`
        );
      }

      // Якщо місце пройшло всі фільтри, додаємо до рекомендацій
      console.log(`Додаємо ${place.name} до рекомендацій`);
      recommendations.push({
        place_name: place.name,
        location: place.location,
        facilities: place.facilities,
      });
    }

    // Якщо рекомендацій немає, повертаємо повідомлення
    if (recommendations.length === 0) {
      console.log(`Не знайдено відповідних місць у місті ${userCity}`);
      return {
        message: `У місті ${userData.city} немає місць, що відповідають вашим критеріям`,
      };
    }

    return recommendations;
  } catch (error) {
    console.error(`Помилка в генерації рекомендацій: ${error.message}`);
    return { error: error.message };
  }
}
