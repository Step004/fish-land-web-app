import css from "./UserSettingsForm.module.css";
import { Field, Formik, Form, ErrorMessage } from "formik";
import { IoClose } from "react-icons/io5";
import clsx from "clsx";
import * as Yup from "yup";

import { useEffect } from "react";
import toast from "react-hot-toast";
import defaultPhoto from "../../img/default-user.jpg";
import { updateUserFields } from "../../firebase/firebase/writeData.js";
import { useAuth } from "../../firebase/contexts/authContexts/index.jsx";

export default function UserSettingsForm({ close, user }) {
  console.log(user);
  const { updateCurrentUser } = useAuth();

  const handleSubmit = async (values, actions) => {
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
    };
    Object.keys(updates).forEach((key) => {
      if (updates[key] === undefined) {
        delete updates[key];
      }
    });
    try {
      await updateUserFields(user.uid, updates);
      updateCurrentUser(updates);
      toast.success("User information updated successfully!");
      close();
      actions.resetForm();
    } catch (error) {
      toast.error("Failed to update user information.");
      console.error(error);
    }
  };
  const validationSchema = Yup.object({
    name: Yup.string(),
    age: Yup.string().max(100, "Age must be less than or equal to 100"),
    origin: Yup.string(),
    preference: Yup.string(),
    number: Yup.string().matches(
      /^\+?3?8?(0\d{9})$/,
      "Invalid phone number format"
    ),
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
  const userPhoto = user?.photo ? (
    <img src={user.photo} alt="UserPhoto" className={css.photo} />
  ) : (
    <img src={defaultPhoto} alt="UserPhoto" className={css.photo} />
  );

  return (
    <Formik
      initialValues={{
        name: user.name,
        number: user.number || "",
        age: user.age || "",
        origin: user.origin || "",
        preference: user.preference || "",
      }}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      <Form className={css.form} autoComplete="off">
        <IoClose className={css.closeBtn} onClick={close} />
        <p className={css.logInText}>Settings</p>
        <p className={css.welcomeText}>Add more information about yourself</p>
        <div className={css.fields}>
          <div className={css.NameAndPhoto}>
            {userPhoto}
            <div className={css.nannyName}>
              <button className={css.choosePhotoButton} type="button">
                Choose your photo!
              </button>
            </div>
          </div>
          <div className={css.fourFields}>
            <Field
              name="name"
              type="text"
              placeholder={user.displayName}
              className={clsx(css.field, css.fieldFirstFour)}
            />
            <div className={css.errorMsgCont}>
              <Field
                name="number"
                type="text"
                placeholder={user.number || "+380"}
                className={clsx(css.field, css.fieldFirstFour)}
              />
              <ErrorMessage
                name="number"
                component="span"
                className={css.errorMsg}
              />
            </div>
            <div className={css.errorMsgCont}>
              <Field
                name="age"
                type="text"
                placeholder={user.age || "Age"}
                className={clsx(css.field, css.fieldFirstFour)}
              />
              <ErrorMessage
                name="age"
                component="span"
                className={css.errorMsg}
              />
            </div>
            <Field
              name="origin"
              type="text"
              placeholder={user.origin || "Origin"}
              className={clsx(css.field, css.fieldFirstFour)}
            />
          </div>

          <Field
            name="preference"
            type="text"
            placeholder={user.preference || "Preference"}
            className={clsx(css.field, css.fieldLast)}
          />
        </div>

        <button type="submit" className={css.submitButton}>
          Send
        </button>
      </Form>
    </Formik>
  );
}
