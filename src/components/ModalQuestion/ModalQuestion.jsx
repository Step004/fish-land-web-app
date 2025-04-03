import { IoClose } from "react-icons/io5";
import css from "./ModalQuestion.module.css";
import { useState } from "react";
import { questions } from "../../source/questions.json";
import toast from "react-hot-toast";
import { saveAnswersToDatabase } from "../../firebase/firebase/writeData.js";
import { useAuth } from "../../firebase/contexts/authContexts/index.jsx";
import { i18n } from "../../utils/i18n";

export default function ModalQuestion({ close }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const data = questions;
  const { currentUser } = useAuth();

  const handleNextStep = async () => {
    if (step === data.length - 1) {
      toast.success(i18n.t("modalQuestion.messages.finish"));
      console.log("User answers:", answers);

      try {
        await saveAnswersToDatabase(currentUser.uid, answers);
        toast.success(i18n.t("modalQuestion.messages.answersSaved"));
      } catch (error) {
        toast.error(i18n.t("modalQuestion.messages.savingError"));
        console.error("Error saving answers:", error);
      }

      close();
      return;
    }
    setStep(step + 1);
  };

  const handlePrevStep = () => {
    if (step === 0) {
      toast.error(i18n.t("modalQuestion.messages.firstQuestion"));
      return;
    }
    setStep(step - 1);
  };

  const handleAnswerChange = (value) => {
    const currentQuestion = data[step];
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]:
        currentQuestion.type === "multiple_choice"
          ? Array.isArray(prev[currentQuestion.id])
            ? prev[currentQuestion.id].includes(value)
              ? prev[currentQuestion.id].filter((item) => item !== value)
              : [...prev[currentQuestion.id], value]
            : [value]
          : value,
    }));
  };

  const isAnswered = (questionId) => {
    const answer = answers[questionId];
    if (!answer) return false;
    if (Array.isArray(answer)) return answer.length > 0;
    return answer !== "";
  };

  return (
    <>
      <div className={css.overlay} onClick={close}></div>
      <div className={css.window}>
        <IoClose
          className={css.closeBtn}
          onClick={close}
          aria-label={i18n.t("modalQuestion.aria.close")}
        />
        <h2 className={css.title}>{i18n.t("modalQuestion.title")}</h2>

        <div className={css.progressBar}>
          {data.map((_, index) => (
            <span
              key={index}
              className={`${css.progressCircle} ${
                isAnswered(data[index].id) ? css.completed : ""
              } ${index === step ? css.active : ""}`}
              aria-label={i18n.t("modalQuestion.aria.progressCircle")}
              role="progressbar"
              aria-valuenow={index + 1}
              aria-valuemin={1}
              aria-valuemax={data.length}
            ></span>
          ))}
        </div>

        <div>
          <p className={css.question}>{data[step].question}</p>
          <div className={css.options}>
            {data[step].type === "single_choice" &&
              data[step].options.map((option) => (
                <label key={option}>
                  <input
                    type="radio"
                    name={`question-${data[step].id}`}
                    value={option}
                    checked={answers[data[step].id] === option}
                    onChange={() => handleAnswerChange(option)}
                  />
                  {option}
                </label>
              ))}
            {data[step].type === "multiple_choice" &&
              data[step].options.map((option) => (
                <label key={option}>
                  <input
                    type="checkbox"
                    name={`question-${data[step].id}`}
                    value={option}
                    checked={
                      Array.isArray(answers[data[step].id]) &&
                      answers[data[step].id].includes(option)
                    }
                    onChange={() => handleAnswerChange(option)}
                  />
                  {option}
                </label>
              ))}
            {data[step].type === "number" && (
              <input
                type="number"
                value={answers[data[step].id] || ""}
                onChange={(e) =>
                  setAnswers((prev) => ({
                    ...prev,
                    [data[step].id]: e.target.value,
                  }))
                }
              />
            )}
          </div>
        </div>

        <div className={css.buttons}>
          <button onClick={handlePrevStep}>
            {i18n.t("modalQuestion.buttons.prev")}
          </button>
          <button onClick={handleNextStep}>
            {i18n.t("modalQuestion.buttons.next")}
          </button>
        </div>
      </div>
    </>
  );
}
