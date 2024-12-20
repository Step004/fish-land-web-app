import { Field, Formik, Form, ErrorMessage } from "formik";
import css from "./LogInForm.module.css";
import { RxEyeOpen } from "react-icons/rx";
import { GoEyeClosed } from "react-icons/go";
import { useState } from "react";
import {
  doSignInWithEmailAndPassword,
  signInWithGoogle,
} from "../../firebase/firebase/auth.js";
import { useNavigate } from "react-router-dom";
import * as Yup from "yup";
import { changeOnlineStatusForLogin } from "../../firebase/firebase/writeData.js";
import toast from "react-hot-toast";
import { FcGoogle } from "react-icons/fc";

export default function LogInForm() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  const handleSubmit = async (values, actions) => {
    if (!isLoggedIn) {
      setIsLoggedIn(true);
      try {
        await doSignInWithEmailAndPassword(values.email, values.password).then(
          async (userCredential) => {
            const userId = userCredential.user.uid;
            await changeOnlineStatusForLogin(userId);
            console.log("User logged in and status updated");
            toast.success("Successfully logged in!");
          }
        );
      } catch (error) {
        toast.error(error.message);
      }

      navigate("/");
    }
    actions.resetForm();
  };
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const validationSchema = Yup.object({
    email: Yup.string().email("Invalid email").required("Email is required"),
    password: Yup.string()
      .min(6, "Password must be at least 6 characters long")
      .required("Password is required"),
  });
  const handleGoogleLogin = async () => {
    if (!isLoggedIn) {
      setIsLoggedIn(true);
      try {
        const userCredential = await signInWithGoogle();
        const userId = userCredential.user.uid;

        await changeOnlineStatusForLogin(userId);

        console.log("User logged in and status updated");
        toast.success("Вхід виконано успішно!");

        navigate("/");
      } catch (error) {
        console.error("Error during login:", error);
        toast.error(`Помилка авторизації: ${error.message}`);
        setIsLoggedIn(false);
      }
    }
  };

  return (
    <main className={css.container}>
      <Formik
        initialValues={{
          email: "",
          password: "",
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        <Form className={css.form} autoComplete="off">
          <p className={css.logInText}>Log In</p>
          <p className={css.welcomeText}>
            Welcome back! Please enter your credentials to access your account
            and continue your babysitter search.
          </p>
          <div className={css.fields}>
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
            Log In
          </button>
          <div className={css.googleIconContainer}>
            <FcGoogle
              className={css.googleIcon}
              onClick={() => handleGoogleLogin()}
            />
          </div>
          <p className={css.registr}>
            Don`t have an account?{" "}
            <span
              className={css.registrLink}
              onClick={() => {
                navigate("/register");
              }}
            >
              Registration
            </span>
          </p>
        </Form>
      </Formik>
    </main>
  );
}
