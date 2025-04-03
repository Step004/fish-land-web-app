export const translations = {
  recommendations: {
    errors: {
      noCitySpecified: "Ви не вказали місто",
      noMatchingPlaces:
        "У місті {city} немає місць, що відповідають вашим критеріям",
      generalError: "Помилка при генерації рекомендацій: {error}",
    },
    fishingLocation: {
      noPreference: "Без різниці",
    },
    answers: {
      yes: "Так",
    },
    questions: {
      fishType: "Тип риби",
      fishingLocation: "Ловля з берега чи з човна",
      fishingStyle: "Стиль риболовлі",
      nightFishing: "Нічна риболовля",
      waterTypes: "Типи водойм",
      maxDistance: "Максимальна відстань",
      facilities: "Зручності",
      weather: "Погода",
      experience: "Досвід у риболовлі",
    },
  },
  settings: {
    language: {
      title: "Мова",
      uk: "Українська",
      en: "English",
      changeSuccess: "Мову успішно змінено",
      changeError: "Помилка при зміні мови",
    },
    title: "Налаштування",
    subtitle: "Додайте більше інформації про себе",
    fields: {
      name: "Ім'я",
      number: "Номер телефону",
      age: "Вік",
      origin: "Місто",
      preference: "Вподобання",
    },
    placeholders: {
      number: "+380",
      age: "Вік",
      origin: "Місто",
      preference: "Вподобання",
    },
    buttons: {
      changePhoto: "Змінити фото!",
      submit: "Зберегти",
    },
    validation: {
      ageMax: "Вік має бути менше або дорівнювати 100",
      invalidPhone: "Невірний формат номера телефону",
    },
    updateSuccess: "Інформацію користувача успішно оновлено!",
    updateError: "Помилка при оновленні інформації користувача.",
  },
  addPlace: {
    title: "Додавання нового місця",
    labels: {
      placeName: "Назва місця",
      placeLocation: "Розташування",
      placeType: "Тип місця",
    },
    placeholders: {
      placeName: "Введіть назву місця",
      placeLocation: "Введіть розташування",
      placeType: "Введіть тип місця",
    },
    buttons: {
      prev: "Назад",
      next: "Далі",
    },
    messages: {
      success: "Місце успішно додано!",
      error: "Помилка при збереженні місця.",
      firstQuestion: "Ви на першому питанні!",
    },
    progressBar: {
      completed: "Завершено",
      active: "Поточне питання",
    },
  },
  userPage: {
    titles: {
      recommendations: "Рекомендації",
      myPhotos: "Мої фотографії",
      myFriends: "Мої друзі",
      publications: "Публікації",
    },
    buttons: {
      start: "Почати",
      addPlace: "Додати місце",
      settings: "Налаштування",
      seeAll: "Переглянути все",
      addPhoto: "Додати фото",
      addNews: "Додати новину",
      send: "Надіслати",
    },
    labels: {
      from: "Звідки",
      age: "Вік",
      number: "Номер",
      preference: "Вподобання",
    },
    messages: {
      noPhotos: "У вас ще немає фотографій.",
      noUsers: "Користувачів не знайдено.",
      noPublications: "У вас ще немає публікацій!",
      photoAddSuccess: "Фото успішно додано!",
      photoAddError:
        "Помилка при додаванні фото. Перевірте ваші права доступу.",
      fileSelectError:
        "Будь ласка, виберіть файл та переконайтесь, що ви увійшли в систему.",
      recommendationsSurvey:
        "Щоб отримати рекомендації щодо місць для риболовлі, вам потрібно пройти опитування!",
    },
    social: {
      like: "Подобається",
      comments: "Коментарі",
      writeComment: "Напишіть коментар...",
    },
  },
  auth: {
    buttons: {
      login: "Увійти",
      registration: "Реєстрація",
      logout: "Вийти",
    },
  },
  userMenu: {
    buttons: {
      logout: "Вийти",
    },
    aria: {
      userPhoto: "Фото користувача",
      burgerMenu: "Відкрити меню",
    },
  },
  navigation: {
    links: {
      news: "Новини",
      friends: "Друзі",
      messages: "Повідомлення",
      map: "Карта",
      myProfile: "Мій профіль",
      logout: "Вийти",
    },
  },
  homePage: {
    titles: {
      newsFromFriends: "Новини від ваших друзів",
    },
  },
  friendListPage: {
    links: {
      friends: "Друзі",
      users: "Користувачі",
    },
  },
  friendsList: {
    searchInputPlaceholder: "Пошук друзів за іменем...",
    online: "Онлайн",
    offline: "Офлайн",
    from: "Звідки",
    age: "Вік",
    number: "Номер",
    preference: "Вподобання",
  },
  messagePage: {
    titles: {
      chatMessages: "Повідомлення",
      chooseChat: "Оберіть чат!",
    },
    messages: {
      noChats: "У вас ще немає чатів!",
      unreadMessage: "Непрочитане повідомлення",
      callEnded: "Дзвінок завершено",
      deleteChat: "Чат успішно видалено!",
    },
    aria: {
      userPhoto: "Фото користувача",
      unreadIndicator: "Індикатор непрочитаного повідомлення",
    },
    buttons: {
      endCall: "Завершити дзвінок",
      send: "Надіслати",
      deleteChat: "Видалити чат",
      back: "Назад",
    },
    placeholders: {
      messageInput: "Ваше повідомлення...",
    },
    calls: {
      active: "Активний дзвінок",
      ended: "Дзвінок завершено",
    },
  },
  friendPage: {
    status: {
      online: "Онлайн",
      offline: "Офлайн",
    },
    messages: {
      areFriends: "Ми друзі",
      noPhotos: "У користувача {name} ще немає фотографій",
      noUsers: "Користувачів не знайдено",
      noPublications: "У користувача {name} немає публікацій!",
      friendDeleted: "Друга успішно видалено",
      commentAdded: "Коментар додано успішно",
      commentError: "Помилка при додаванні коментаря",
      likeError: "Помилка при оновленні лайку",
    },
    buttons: {
      addFriend: "Додати до друзів",
      sendMessage: "Надіслати повідомлення",
      seeAll: "Переглянути все!",
      send: "Надіслати",
    },
    labels: {
      from: "Звідки",
      age: "Вік",
      number: "Номер",
      preference: "Вподобання",
      photo: "Фотографії",
      friends: "Друзі",
      publications: "Публікації",
      like: "Вподобати",
      comments: "Коментарі",
    },
    aria: {
      userPhoto: "Фото користувача",
      defaultPhoto: "Фото за замовчуванням",
      postPhoto: "Фото публікації",
      deleteIcon: "Видалити друга",
    },
  },
  modalQuestion: {
    title: "Ваші риболовні вподобання",
    messages: {
      finish: "Завершено!",
      answersSaved: "Відповіді успішно збережено!",
      savingError: "Помилка при збереженні відповідей",
      firstQuestion: "Ви на першому питанні!",
    },
    buttons: {
      prev: "Назад",
      next: "Далі",
    },
    aria: {
      close: "Закрити вікно",
      progressCircle: "Індикатор прогресу",
    },
    progressBar: {
      completed: "Завершено",
      active: "Поточне питання",
    },
  },
  loginForm: {
    title: "Вхід",
    welcome:
      "Ласкаво просимо! Будь ласка, введіть свої дані для входу в обліковий запис.",
    buttons: {
      login: "Увійти",
      showPassword: "Показати пароль",
      hidePassword: "Приховати пароль",
    },
    fields: {
      email: "Електронна пошта",
      password: "Пароль",
    },
    validation: {
      emailRequired: "Електронна пошта обов'язкова",
      emailInvalid: "Невірний формат електронної пошти",
      passwordRequired: "Пароль обов'язковий",
      passwordMin: "Пароль має бути не менше 6 символів",
    },
    messages: {
      loginSuccess: "Вхід виконано успішно!",
      loginError: "Помилка авторизації: {error}",
    },
    registration: {
      prompt: "Немає облікового запису?",
      link: "Реєстрація",
    },
    aria: {
      googleLogin: "Увійти через Google",
    },
  },
  registerForm: {
    title: "Реєстрація",
    welcome:
      "Дякуємо за інтерес до нашої платформи! Для реєстрації нам потрібна деяка інформація. Будь ласка, надайте наступні дані.",
    buttons: {
      signup: "Зареєструватися",
      showPassword: "Показати пароль",
      hidePassword: "Приховати пароль",
    },
    fields: {
      name: "Ім'я",
      email: "Електронна пошта",
      password: "Пароль",
    },
    validation: {
      nameRequired: "Ім'я обов'язкове",
      emailRequired: "Електронна пошта обов'язкова",
      emailInvalid: "Невірний формат електронної пошти",
      passwordRequired: "Пароль обов'язковий",
      passwordMin: "Пароль має бути не менше 6 символів",
    },
    login: {
      prompt: "Вже маєте обліковий запис?",
      link: "Увійти",
    },
  },
  videoCall: {
    buttons: {
      startCall: "Почати дзвінок",
      endCall: "Завершити дзвінок",
      join: "Приєднатися",
    },
  },
};
