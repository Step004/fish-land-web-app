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
import { i18n } from "../../utils/i18n";

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
    email: Yup.string()
      .email(i18n.t("registerForm.validation.emailInvalid"))
      .required(i18n.t("registerForm.validation.emailRequired")),
    name: Yup.string().required(i18n.t("registerForm.validation.nameRequired")),
    password: Yup.string()
      .min(6, i18n.t("registerForm.validation.passwordMin"))
      .required(i18n.t("registerForm.validation.passwordRequired")),
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
          <p className={css.logInText}>{i18n.t("registerForm.title")}</p>
          <p className={css.welcomeText}>{i18n.t("registerForm.welcome")}</p>
          <div className={css.fields}>
            <div className={css.errorMsgCont}>
              <Field
                type="text"
                name="name"
                placeholder={i18n.t("registerForm.fields.name")}
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
                placeholder={i18n.t("registerForm.fields.email")}
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
                  placeholder={i18n.t("registerForm.fields.password")}
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
                    ? i18n.t("registerForm.buttons.hidePassword")
                    : i18n.t("registerForm.buttons.showPassword")
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
            {i18n.t("registerForm.buttons.signup")}
          </button>

          <p className={css.registr}>
            {i18n.t("registerForm.login.prompt")}{" "}
            <span
              className={css.registrLink}
              onClick={() => {
                navigate("/login");
              }}
              role="button"
              tabIndex={0}
            >
              {i18n.t("registerForm.login.link")}
            </span>
          </p>
        </Form>
      </Formik>
    </main>
  );
}
