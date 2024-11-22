import { Field, Formik, Form, ErrorMessage } from "formik";
import css from "./RegisterForm.module.css";
import * as Yup from "yup";
import { RxEyeOpen } from "react-icons/rx";
import { GoEyeClosed } from "react-icons/go";
import { useState } from "react";
import { doCreateUserWithEmailAndPassword } from "../../firebase/firebase/auth.js";
import { useNavigate } from "react-router-dom";
import { saveUserToDatabase } from "../../firebase/firebase/writeData.js";
import toast from "react-hot-toast";


export default function RegisterForm() {
  const navigate = useNavigate();

  const [isRegistering, setIsRegistering] = useState(false);
  const handleSubmit = async (values, actions) => {
    if (!isRegistering) {
      setIsRegistering(true);
      try {
        const user = await doCreateUserWithEmailAndPassword(
          values.email,
          values.password,
          values.name
        );
        if (user) {
          navigate("/");
          await saveUserToDatabase(user.uid, user.email, user.displayName);
        }
      } catch (error) {
        toast.error(error.message);
      }
    }
    actions.resetForm();
  };

  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };
  const validationSchema = Yup.object({
    email: Yup.string().email("Invalid email").required("Email is required"),
    name: Yup.string().required("Name is required"),
    password: Yup.string()
      .min(6, "Password must be at least 6 characters long")
      .required("Password is required"),
  });

  return (
    <main>
      <Formik
        initialValues={{
          name: "",
          email: "",
          password: "",
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        <Form className={css.form} autoComplete="off">
          <p className={css.logInText}>Registration</p>
          <p className={css.welcomeText}>
            Thank you for your interest in our platform! In order to register,
            we need some information. Please provide us with the following
            information.
          </p>
          <div className={css.fields}>
            <div className={css.errorMsgCont}>
              <Field
                type="text"
                name="name"
                placeholder="Name"
                className={css.field}
              />
              <ErrorMessage
                name="name"
                component="span"
                className={css.errorMsg}
              />
            </div>
            <div className={css.errorMsgCont}>
              <Field
                type="email"
                name="email"
                placeholder="Email"
                className={css.field}
              />
              <ErrorMessage
                name="email"
                component="span"
                className={css.errorMsg}
              />
            </div>
            <div className={css.passwordWrapper}>
              <div className={css.errorMsgCont}>
                <Field
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  className={css.field}
                />
                <ErrorMessage
                  name="password"
                  component="span"
                  className={css.errorMsg}
                />
              </div>
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className={css.eyeIcon}
              >
                {showPassword ? (
                  <RxEyeOpen className={css.eye} />
                ) : (
                  <GoEyeClosed className={css.eye} />
                )}
              </button>
            </div>
          </div>

          <button type="submit" className={css.submitButton}>
            Sign Up
          </button>
          <p
            className={css.registr}
            onClick={() => {
              navigate("/login");
            }}
          >
            Do you have an account? Log in
          </p>
        </Form>
      </Formik>
    </main>
  );
}
