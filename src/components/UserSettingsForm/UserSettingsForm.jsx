import css from "./UserSettingsForm.module.css";
import { Field, Formik, Form, ErrorMessage } from "formik";
import { IoClose } from "react-icons/io5";
import clsx from "clsx";
import * as Yup from "yup";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import defaultPhoto from "../../img/default-user.jpg";
import { updateUserFields } from "../../firebase/firebase/writeData.js";
import { useAuth } from "../../firebase/contexts/authContexts/index.jsx";
import { updateUserDisplayName } from "../../firebase/firebase/auth.js";
import { updateUserPhoto } from "../../firebase/firebase/storage.js";
import { i18n } from "../../utils/i18n";

export default function UserSettingsForm({ close, user }) {
  const { currentUser, updateCurrentUser, userFromDB } = useAuth();
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(userFromDB.photoURL);
  const [formData, setFormData] = useState({
    name: "",
    origin: "",
    language: userFromDB.language,
  });
  const [, setLanguageUpdate] = useState(0);

  const handlePhotoChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "language") {
      i18n.setLanguage(value);
    }
  };

  const handleSubmit = async (values, actions) => {
    const currentUserUpdatesName =
      values.name !== undefined ? values.name : user.name;

    const updates = {
      name: values.name !== undefined ? values.name : user.name,
      age:
        values.age !== undefined && values.age !== "" ? values.age : user.age,
      origin:
        values.origin !== undefined && values.origin !== ""
          ? values.origin
          : user.origin,
      preference:
        values.preference !== undefined && values.preference !== ""
          ? values.preference
          : user.preference,
      number:
        values.number !== undefined && values.number !== ""
          ? values.number
          : user.number,
      language: formData.language,
    };

    Object.keys(updates).forEach((key) => {
      if (updates[key] === undefined || updates[key] === "") {
        delete updates[key];
      }
    });

    try {
      if (selectedImage) {
        const photoURL = await updateUserPhoto(currentUser.uid, selectedImage);
        if (photoURL) {
          updates.photoURL = photoURL;
        }
      }

      await updateUserDisplayName(currentUserUpdatesName);
      await updateUserFields(currentUser.uid, updates);
      updateCurrentUser(updates);

      toast.success(i18n.t("settings.updateSuccess"));
      close();
      actions.resetForm();
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error(i18n.t("settings.updateError"));
    }
  };

  const validationSchema = Yup.object({
    name: Yup.string(),
    age: Yup.number().max(100, i18n.t("settings.validation.ageMax")),
    origin: Yup.string(),
    preference: Yup.string(),
    number: Yup.string().matches(
      /^\+?3?8?(0\d{9})$/,
      i18n.t("settings.validation.invalidPhone")
    ),
    language: Yup.string().oneOf(["uk", "en"]),
  });

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        close();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [close]);

  useEffect(() => {
    if (userFromDB) {
      setFormData((prev) => ({
        ...prev,
        name: userFromDB.displayName || "",
        origin: userFromDB.origin || "",
        language: userFromDB.language || i18n.getCurrentLanguage(),
      }));
    }
  }, [userFromDB]);

  useEffect(() => {
    const handleLanguageChange = () => {
      setLanguageUpdate((prev) => prev + 1);
    };

    window.addEventListener("languageChange", handleLanguageChange);
    return () => {
      window.removeEventListener("languageChange", handleLanguageChange);
    };
  }, []);

  const userPhoto = imagePreview ? (
    <img src={imagePreview} alt="UserPhoto" className={css.photo} />
  ) : currentUser.photoURL ? (
    <img src={currentUser.photoURL} alt="UserPhoto" className={css.photo} />
  ) : (
    <img src={defaultPhoto} alt="UserPhoto" className={css.photo} />
  );

  return (
    <Formik
      initialValues={{
        name: currentUser.displayName,
        number: user.number || "",
        age: user.age || "",
        origin: user.origin || "",
        preference: user.preference || "",
        language: i18n.getCurrentLanguage(),
      }}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      <Form className={css.form} autoComplete="off">
        <IoClose className={css.closeBtn} onClick={close} />
        <p className={css.logInText}>{i18n.t("settings.title")}</p>
        <p className={css.welcomeText}>{i18n.t("settings.subtitle")}</p>
        <div className={css.fields}>
          <div className={css.NameAndPhoto}>
            {userPhoto}
            <div className={css.nannyName}>
              <input
                type="file"
                id="fileInput"
                accept="image/*"
                onChange={handlePhotoChange}
                style={{ display: "none" }}
              />
              <button
                className={css.choosePhotoButton}
                type="button"
                onClick={() => document.getElementById("fileInput").click()}
              >
                {i18n.t("settings.buttons.changePhoto")}
              </button>
            </div>
          </div>
          <div className={css.fourFields}>
            <div className={css.inputContainerForm}>
              <label className={css.label} htmlFor="name">
                {i18n.t("settings.fields.name")}
              </label>
              <Field
                name="name"
                type="text"
                placeholder={user.displayName}
                className={clsx(css.field, css.fieldFirstFour)}
              />
            </div>
            <div className={css.errorMsgCont}>
              <div className={css.inputContainerForm}>
                <label className={css.label} htmlFor="number">
                  {i18n.t("settings.fields.number")}
                </label>
                <Field
                  name="number"
                  type="text"
                  placeholder={
                    user.number || i18n.t("settings.placeholders.number")
                  }
                  className={clsx(css.field, css.fieldFirstFour)}
                />
              </div>
              <ErrorMessage
                name="number"
                component="span"
                className={css.errorMsg}
              />
            </div>
            <div className={css.errorMsgCont}>
              <div className={css.inputContainerForm}>
                <label className={css.label} htmlFor="age">
                  {i18n.t("settings.fields.age")}
                </label>
                <Field
                  name="age"
                  type="text"
                  placeholder={user.age || i18n.t("settings.placeholders.age")}
                  className={clsx(css.field, css.fieldFirstFour)}
                />
              </div>
              <ErrorMessage
                name="age"
                component="span"
                className={css.errorMsg}
              />
            </div>
            <div className={css.inputContainerForm}>
              <label className={css.label} htmlFor="origin">
                {i18n.t("settings.fields.origin")}
              </label>
              <Field
                name="origin"
                type="text"
                placeholder={
                  user.origin || i18n.t("settings.placeholders.origin")
                }
                className={clsx(css.field, css.fieldFirstFour)}
              />
            </div>
          </div>

          <div className={css.errorMsgCont}>
            <div className={css.inputContainerForm}>
              <label className={css.label} htmlFor="preference">
                {i18n.t("settings.fields.preference")}
              </label>
              <Field
                name="preference"
                type="text"
                placeholder={
                  user.preference || i18n.t("settings.placeholders.preference")
                }
                className={clsx(css.field, css.fieldLast)}
              />
            </div>
            <ErrorMessage
              name="preference"
              component="span"
              className={css.errorMsg}
            />
          </div>

          <div className={css.formGroup}>
            <label className={css.label} htmlFor="language">
              {i18n.t("settings.language.title")}:
            </label>
            <select
              id="language"
              name="language"
              value={formData.language}
              onChange={handleChange}
              className={css.select}
            >
              <option value="uk">{i18n.t("settings.language.uk")}</option>
              <option value="en">{i18n.t("settings.language.en")}</option>
            </select>
          </div>
        </div>

        <button type="submit" className={css.submitButton}>
          {i18n.t("settings.buttons.submit")}
        </button>
      </Form>
    </Formik>
  );
}
