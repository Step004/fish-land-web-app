import css from "./AddPostForm.module.css";
import { Field, Formik, Form, ErrorMessage } from "formik";
import { IoClose } from "react-icons/io5";
import * as Yup from "yup";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../../firebase/contexts/authContexts/index.jsx";
import {
  addUserPost,
  uploadPostImage,
} from "../../firebase/firebase/writeData.js";
import { nanoid } from "nanoid";

export default function AddPostForm({ close, handleAddPost }) {
  const { currentUser } = useAuth();
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const handleImageChange = (event) => {
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

  const handleSubmit = async (values, actions) => {
    const postId = nanoid();
    let imageUrl = null;

    try {
      if (selectedImage) {
        imageUrl = await uploadPostImage(
          selectedImage,
          currentUser.uid,
          postId
        );
      }

      const post = {
        id: postId,
        title: values.title || "",
        content: values.content || "",
        createdAt: new Date().toISOString(),
        likes: [],
        comments: [],
        imageUrl: imageUrl,
      };

      await addUserPost(currentUser.uid, post);
      handleAddPost((prevUser) => ({
        ...prevUser,
        posts: {
          ...prevUser.posts,
          [postId]: post,
        },
      }));
      toast.success("Post added successfully!");
      close();
      actions.resetForm();
      setSelectedImage(null);
      setImagePreview(null);
    } catch (error) {
      toast.error("Failed to add post");
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
      initialValues={{ title: "", content: "" }}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      <Form className={css.form}>
        <div className={css.containerForTitleAndClose}>
          <h2>Add post</h2>
          <button type="button" className={css.closeButton} onClick={close}>
            <IoClose className={css.closeIcon} />
          </button>
        </div>
        <div className={css.containerForInputs}>
          <Field
            type="text"
            name="title"
            placeholder="Title"
            className={css.input}
          />
          <Field
            as="textarea"
            name="content"
            placeholder="Content"
            className={css.textarea}
          />
          <ErrorMessage name="content" component="div" className={css.error} />

          <div className={css.imageUploadContainer}>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className={css.fileInput}
              id="image-upload"
            />
            <label htmlFor="image-upload" className={css.uploadButton}>
              {imagePreview ? "Change Image" : "Add Image"}
            </label>
          </div>

          {imagePreview && (
            <div className={css.imagePreview}>
              <img src={imagePreview} alt="Preview" />
            </div>
          )}
        </div>
        <button type="submit" className={css.submitButton}>
          Add post
        </button>
      </Form>
    </Formik>
  );
}
