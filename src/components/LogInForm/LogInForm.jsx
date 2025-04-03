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
import { i18n } from "../../utils/i18n";

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
            toast.success(i18n.t("loginForm.messages.loginSuccess"));
          }
        );
      } catch (error) {
        toast.error(
          i18n.tReplace("loginForm.messages.loginError", {
            error: error.message,
          })
        );
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
    email: Yup.string()
      .email(i18n.t("loginForm.validation.emailInvalid"))
      .required(i18n.t("loginForm.validation.emailRequired")),
    password: Yup.string()
      .min(6, i18n.t("loginForm.validation.passwordMin"))
      .required(i18n.t("loginForm.validation.passwordRequired")),
  });

  const handleGoogleLogin = async () => {
    if (!isLoggedIn) {
      setIsLoggedIn(true);
      try {
        const userCredential = await signInWithGoogle();
        const userId = userCredential.user.uid;

        await changeOnlineStatusForLogin(userId);

        console.log("User logged in and status updated");
        toast.success(i18n.t("loginForm.messages.loginSuccess"));

        navigate("/");
      } catch (error) {
        console.error("Error during login:", error);
        toast.error(
          i18n.tReplace("loginForm.messages.loginError", {
            error: error.message,
          })
        );
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
          <p className={css.logInText}>{i18n.t("loginForm.title")}</p>
          <p className={css.welcomeText}>{i18n.t("loginForm.welcome")}</p>
          <div className={css.fields}>
            <div className={css.errorMsgCont}>
              <Field
                type="email"
                name="email"
                placeholder={i18n.t("loginForm.fields.email")}
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
                  placeholder={i18n.t("loginForm.fields.password")}
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
                aria-label={
                  showPassword
                    ? i18n.t("loginForm.buttons.hidePassword")
                    : i18n.t("loginForm.buttons.showPassword")
                }
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
            {i18n.t("loginForm.buttons.login")}
          </button>
          <div className={css.googleIconContainer}>
            <FcGoogle
              className={css.googleIcon}
              onClick={() => handleGoogleLogin()}
              aria-label={i18n.t("loginForm.aria.googleLogin")}
              role="button"
              tabIndex={0}
            />
          </div>
          <p className={css.registr}>
            {i18n.t("loginForm.registration.prompt")}{" "}
            <span
              className={css.registrLink}
              onClick={() => {
                navigate("/register");
              }}
              role="button"
              tabIndex={0}
            >
              {i18n.t("loginForm.registration.link")}
            </span>
          </p>
        </Form>
      </Formik>
    </main>
  );
}
