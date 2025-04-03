export const translations = {
  recommendations: {
    errors: {
      noCitySpecified: "City is not specified",
      noMatchingPlaces: "No places matching your criteria in {city}",
      generalError: "Error generating recommendations: {error}",
    },
    fishingLocation: {
      noPreference: "No preference",
    },
    answers: {
      yes: "Yes",
    },
    questions: {
      fishType: "Fish type",
      fishingLocation: "Shore or boat fishing",
      fishingStyle: "Fishing style",
      nightFishing: "Night fishing",
      waterTypes: "Water types",
      maxDistance: "Maximum distance",
      facilities: "Facilities",
      weather: "Weather",
      experience: "Fishing experience",
    },
  },
  settings: {
    language: {
      title: "Language",
      uk: "Ukrainian",
      en: "English",
      changeSuccess: "Language changed successfully",
      changeError: "Error changing language",
    },
    title: "Settings",
    subtitle: "Add more information about yourself",
    fields: {
      name: "Name",
      number: "Phone Number",
      age: "Age",
      origin: "City",
      preference: "Preference",
    },
    placeholders: {
      number: "+380",
      age: "Age",
      origin: "City",
      preference: "Preference",
    },
    buttons: {
      changePhoto: "Change my photo!",
      submit: "Save",
    },
    validation: {
      ageMax: "Age must be less than or equal to 100",
      invalidPhone: "Invalid phone number format",
    },
    updateSuccess: "User information updated successfully!",
    updateError: "Failed to update user information.",
  },
  addPlace: {
    title: "Add New Place",
    labels: {
      placeName: "Place Name",
      placeLocation: "Location",
      placeType: "Place Type",
    },
    placeholders: {
      placeName: "Enter place name",
      placeLocation: "Enter location",
      placeType: "Enter place type",
    },
    buttons: {
      prev: "Previous",
      next: "Next",
    },
    messages: {
      success: "Place added successfully!",
      error: "Failed to save place.",
      firstQuestion: "You are on the first question!",
    },
    progressBar: {
      completed: "Completed",
      active: "Current question",
    },
  },
  userPage: {
    titles: {
      recommendations: "Recommendations",
      myPhotos: "My Photos",
      myFriends: "My Friends",
      publications: "Publications",
    },
    buttons: {
      start: "Start",
      addPlace: "Add Place",
      settings: "Settings",
      seeAll: "See All",
      addPhoto: "Add Photo",
      addNews: "Add News",
      send: "Send",
    },
    labels: {
      from: "From",
      age: "Age",
      number: "Number",
      preference: "Preference",
    },
    messages: {
      noPhotos: "You don't have any photos yet.",
      noUsers: "No users found.",
      noPublications: "You don't have any publications!",
      photoAddSuccess: "Photo added successfully!",
      photoAddError: "Failed to add photo. Please check your permissions.",
      fileSelectError: "Please select a file and make sure you are logged in.",
      recommendationsSurvey:
        "In order to receive recommendations for fishing spots, you need to complete a survey!",
    },
    social: {
      like: "Like",
      comments: "Comments",
      writeComment: "Write a comment...",
    },
  },
  auth: {
    buttons: {
      login: "Login",
      registration: "Registration",
      logout: "Logout",
    },
  },
  userMenu: {
    buttons: {
      logout: "Logout",
    },
    aria: {
      userPhoto: "User photo",
      burgerMenu: "Open menu",
    },
  },
  navigation: {
    links: {
      news: "News",
      friends: "Friends",
      messages: "Messages",
      map: "Map",
      myProfile: "My Profile",
      logout: "Logout",
    },
  },
  homePage: {
    titles: {
      newsFromFriends: "News from your friends",
    },
  },
  friendListPage: {
    links: {
      friends: "Friends",
      users: "Users",
    },
  },
  friendsList: {
    searchInputPlaceholder: "Search friends by name...",
    online: "Online",
    offline: "Offline",
    from: "From",
    age: "Age",
    number: "Number",
    preference: "Preference",
  },
  messagePage: {
    titles: {
      chatMessages: "Chat Messages",
      chooseChat: "Choose chat!",
    },
    messages: {
      noChats: "You don't have any chats yet!",
      unreadMessage: "Unread message",
      callEnded: "Call ended",
      deleteChat: "Chat successfully deleted!",
    },
    aria: {
      userPhoto: "User photo",
      unreadIndicator: "Unread message indicator",
    },
    buttons: {
      endCall: "End call",
      send: "Send",
      deleteChat: "Delete chat",
      back: "Back",
    },
    placeholders: {
      messageInput: "Your text...",
    },
    calls: {
      active: "Active call",
      ended: "Call ended",
    },
  },
  friendPage: {
    status: {
      online: "Online",
      offline: "Offline",
    },
    messages: {
      areFriends: "We are friends",
      noPhotos: "{name} doesn't have any photos yet",
      noUsers: "No users found",
      noPublications: "{name} doesn't have any publications!",
      friendDeleted: "Friend deleted successfully",
      commentAdded: "Comment added successfully",
      commentError: "Failed to add comment",
      likeError: "Failed to update like",
    },
    buttons: {
      addFriend: "Add to friends",
      sendMessage: "Send message",
      seeAll: "See all!",
      send: "Send",
    },
    labels: {
      from: "From",
      age: "Age",
      number: "Number",
      preference: "Preference",
      photo: "Photo",
      friends: "Friends",
      publications: "Publications",
      like: "Like",
      comments: "Comments",
    },
    aria: {
      userPhoto: "User photo",
      defaultPhoto: "Default photo",
      postPhoto: "Post photo",
      deleteIcon: "Delete friend",
    },
  },
  modalQuestion: {
    title: "Your fishing preferences",
    messages: {
      finish: "Finish!",
      answersSaved: "Answers saved successfully!",
      savingError: "Failed to save answers",
      firstQuestion: "You are on the first question!",
    },
    buttons: {
      prev: "Previous",
      next: "Next",
    },
    aria: {
      close: "Close window",
      progressCircle: "Progress indicator",
    },
    progressBar: {
      completed: "Completed",
      active: "Current question",
    },
  },
  loginForm: {
    title: "Log In",
    welcome:
      "Welcome back! Please enter your credentials to access your account.",
    buttons: {
      login: "Log In",
      showPassword: "Show password",
      hidePassword: "Hide password",
    },
    fields: {
      email: "Email",
      password: "Password",
    },
    validation: {
      emailRequired: "Email is required",
      emailInvalid: "Invalid email",
      passwordRequired: "Password is required",
      passwordMin: "Password must be at least 6 characters long",
    },
    messages: {
      loginSuccess: "Successfully logged in!",
      loginError: "Login error: {error}",
    },
    registration: {
      prompt: "Don't have an account?",
      link: "Registration",
    },
    aria: {
      googleLogin: "Login with Google",
    },
  },
  registerForm: {
    title: "Registration",
    welcome:
      "Thank you for your interest in our platform! In order to register, we need some information. Please provide us with the following information.",
    buttons: {
      signup: "Sign Up",
      showPassword: "Show password",
      hidePassword: "Hide password",
    },
    fields: {
      name: "Name",
      email: "Email",
      password: "Password",
    },
    validation: {
      nameRequired: "Name is required",
      emailRequired: "Email is required",
      emailInvalid: "Invalid email",
      passwordRequired: "Password is required",
      passwordMin: "Password must be at least 6 characters long",
    },
    login: {
      prompt: "Do you have an account?",
      link: "Log in",
    },
  },
  videoCall: {
    buttons: {
      startCall: "Start Call",
      endCall: "End Call",
      join: "Join",
    },
  },
};
