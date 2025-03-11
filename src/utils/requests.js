// Базовий URL вашого API
const API_URL = "http://127.0.0.1:8000/recommend";

// 1. Функція із повними критеріями (тип водойми + зручності)
export async function getRecommendations(
  id,
  city,
  waterTypes = [],
  facilities = []
) {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: id,
        answers: {
          5: waterTypes, // Масив або порожній
          7: facilities, // Зручності (масив)
        },
        city: city,
      }),
    });

    if (!response.ok) {
      throw new Error(`Помилка HTTP: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Помилка при отриманні рекомендацій:", error);
    throw error;
  }
}



