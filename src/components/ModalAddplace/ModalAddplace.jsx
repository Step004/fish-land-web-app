import { IoClose } from "react-icons/io5";
import css from "./ModalAddplace.module.css";
import { useState } from "react";
import { questions } from "../../source/questionsPlaces.json";
import toast from "react-hot-toast";
import { addPlaceToFirestore } from "../../firebase/firebase/writeData.js";
import { i18n } from "../../utils/i18n";

export default function ModalAddPlace({ close }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const data = questions;
  const [place, setPlace] = useState({
    placeName: "",
    placeLocation: "",
    placeType: "",
    placeAnswers: {},
  });

  const handleNextStep = async () => {
    if (step === data.length - 1) {
      try {
        await addPlaceToFirestore(
          place.placeName,
          place.placeLocation,
          place.placeType,
          answers
        );
        toast.success(i18n.t("addPlace.messages.success"));
      } catch (error) {
        toast.error(i18n.t("addPlace.messages.error"));
        console.error("Помилка збереження відповідей:", error);
      }

      close();
      return;
    }
    setStep(step + 1);
  };

  const handlePrevStep = () => {
    if (step === 0) {
      toast.error(i18n.t("addPlace.messages.firstQuestion"));
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
        <h2 className={css.title}>{i18n.t("addPlace.title")}</h2>

        <div className={css.inputContainer}>
          <label htmlFor="placeName">
            {i18n.t("addPlace.labels.placeName")}
          </label>
          <input
            type="text"
            id="placeName"
            value={place.placeName}
            onChange={(e) => setPlace({ ...place, placeName: e.target.value })}
            placeholder={i18n.t("addPlace.placeholders.placeName")}
          />
        </div>

        <div className={css.inputContainer}>
          <label htmlFor="placeLocation">
            {i18n.t("addPlace.labels.placeLocation")}
          </label>
          <input
            type="text"
            id="placeLocation"
            value={place.placeLocation}
            onChange={(e) =>
              setPlace({ ...place, placeLocation: e.target.value })
            }
            placeholder={i18n.t("addPlace.placeholders.placeLocation")}
          />
        </div>

        <div className={css.inputContainer}>
          <label htmlFor="placeType">
            {i18n.t("addPlace.labels.placeType")}
          </label>
          <input
            type="text"
            id="placeType"
            value={place.placeType}
            onChange={(e) => setPlace({ ...place, placeType: e.target.value })}
            placeholder={i18n.t("addPlace.placeholders.placeType")}
          />
        </div>

        <div className={css.progressBar}>
          {data.map((_, index) => (
            <span
              key={index}
              className={`${css.progressCircle} ${
                isAnswered(data[index].id) ? css.completed : ""
              } ${index === step ? css.active : ""}`}
              aria-label={
                isAnswered(data[index].id)
                  ? i18n.t("addPlace.progressBar.completed")
                  : index === step
                  ? i18n.t("addPlace.progressBar.active")
                  : ""
              }
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
            {i18n.t("addPlace.buttons.prev")}
          </button>
          <button onClick={handleNextStep}>
            {i18n.t("addPlace.buttons.next")}
          </button>
        </div>
      </div>
    </>
  );
}
