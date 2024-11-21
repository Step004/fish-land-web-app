import css from "./AddPostForm.module.css";
import { Field, Formik, Form } from "formik";
import { IoClose } from "react-icons/io5";
import * as Yup from "yup";

import { useEffect } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../../firebase/contexts/authContexts/index.jsx";
import { nanoid } from "nanoid";
import { addUserPost } from "../../firebase/firebase/writeData.js";

export default function AddPostForm({ close }) {
  const { currentUser } = useAuth();
  const uniqueId = nanoid();

  const handleSubmit = async (values, actions) => {
    const post = {
      id: uniqueId,
      title: values.title || "",
      content: values.content || "",
    };
    try {
      addUserPost(currentUser.uid, post);
      toast.success("Post added successfully!");
      close();
      actions.resetForm();
    } catch (error) {
      toast.error("Failed to update user information.");
      console.error(error);
    }
  };
  const validationSchema = Yup.object({
    title: Yup.string(),
    content: Yup.string(),
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

  return (
    <Formik
      initialValues={{
        title: "",
        content: "",
      }}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      <Form className={css.form} autoComplete="off">
        <IoClose className={css.closeBtn} onClick={close} />
        <p className={css.logInText}>Add new post</p>
        <div className={css.fields}>
          <div className={css.twoFields}>
            <Field
              name="title"
              type="text"
              placeholder="Title"
              className={css.fieldTitle}
            />
            <Field
              name="content"
              as="textarea"
              placeholder="Content"
              className={css.fieldContent}
            />
          </div>
        </div>

        <button type="submit" className={css.submitButton}>
          Add post
        </button>
      </Form>
    </Formik>
  );
}