import { IoClose } from "react-icons/io5";
import css from "./ModalAddplace.module.css";
import { useState } from "react";
import { questions } from "../../source/questions.json";
import toast from "react-hot-toast";
import { saveAnswersToDatabase } from "../../firebase/firebase/writeData.js";
import { useAuth } from "../../firebase/contexts/authContexts/index.jsx";

export default function ModalAddPlace({ close }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const data = questions;
  const { currentUser } = useAuth();

  const handleNextStep = async () => {
    if (step === data.length - 1) {
      toast.success("Finish!");
      console.log("User answers:", answers);

      try {
        await saveAnswersToDatabase(currentUser.uid, answers);
        toast.success("Answers saved successfully!");
      } catch (error) {
        toast.error("Failed to save answers.");
        console.error("Помилка збереження відповідей:", error);
      }

      close();
      return;
    }
    setStep(step + 1);
  };

  const handlePrevStep = () => {
    if (step === 0) {
      toast.error("You are on the first question!");
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
        <IoClose className={css.closeBtn} onClick={close} />
        <h2 className={css.title}>Your fishing preferences</h2>

        {/* Прогрес-бар */}
        <div className={css.progressBar}>
          {data.map((_, index) => (
            <span
              key={index}
              className={`${css.progressCircle} ${
                isAnswered(data[index].id) ? css.completed : ""
              } ${index === step ? css.active : ""}`}
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
          <button onClick={handlePrevStep}>Prev</button>
          <button onClick={handleNextStep}>Next</button>
        </div>
      </div>
    </>
  );
}
