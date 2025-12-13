import { useState, useRef, useEffect } from "react";
import { cuestionarioData } from "./data/cuestionario";
import { AnswerMetrics, CuestionarioResponse } from "./types/cuestionario";

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

function App() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [answers, setAnswers] = useState<AnswerMetrics[]>([]);
  const [startedAt, setStartedAt] = useState<string | null>(null);

  const questionStartTime = useRef<number>(Date.now());
  const changeCount = useRef<number>(0);
  const firstSelection = useRef<string | null>(null);

  const question = cuestionarioData.questions[currentQuestion];
  const isLastQuestion = currentQuestion === cuestionarioData.questions.length - 1;

  useEffect(() => {
    if (!startedAt) {
      setStartedAt(new Date().toISOString());
    }
  }, [startedAt]);

  useEffect(() => {
    questionStartTime.current = Date.now();
    changeCount.current = 0;
    firstSelection.current = null;
  }, [currentQuestion]);

  function handleOptionSelect(optionKey: string) {
    if (firstSelection.current === null) {
      firstSelection.current = optionKey;
    } else if (selectedOption !== optionKey) {
      changeCount.current += 1;
    }
    setSelectedOption(optionKey);
  }

  function handleNext() {
    if (selectedOption === null) return;

    const timeToAnswer = Date.now() - questionStartTime.current;
    const answerMetrics: AnswerMetrics = {
      question_number: question.question_number,
      selected_option: selectedOption,
      time_to_answer_ms: timeToAnswer,
      changed_answer: changeCount.current > 0,
      change_count: changeCount.current,
    };

    const newAnswers = [...answers, answerMetrics];
    setAnswers(newAnswers);

    if (isLastQuestion) {
      const finishedAt = new Date().toISOString();
      const response: CuestionarioResponse = {
        response_id: generateId(),
        cuestionario_id: cuestionarioData.id_cuestionario,
        cuestionario_version: cuestionarioData.version,
        started_at: startedAt!,
        finished_at: finishedAt,
        total_time_ms: Date.now() - new Date(startedAt!).getTime(),
        answers: newAnswers,
      };

      saveResponse(response);

      setCurrentQuestion(0);
      setSelectedOption(null);
      setAnswers([]);
      setStartedAt(null);
    } else {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedOption(null);
    }
  }

  function saveResponse(response: CuestionarioResponse) {
    const responses = JSON.parse(localStorage.getItem("cuestionario_responses") || "[]");
    responses.push(response);
    localStorage.setItem("cuestionario_responses", JSON.stringify(responses));

    console.log("Response saved:", JSON.stringify(response, null, 2));
    alert(`Cuestionario completado!\nID: ${response.response_id}\nTiempo total: ${Math.round(response.total_time_ms / 1000)}s`);
  }

  return (
    <main style={{ maxWidth: "600px", margin: "0 auto", padding: "20px" }}>
      <h1>{cuestionarioData.title}</h1>
      <p style={{ color: "#666", marginBottom: "20px" }}>
        Pregunta {question.question_number} de {cuestionarioData.total_questions}
      </p>

      <div style={{ marginBottom: "30px" }}>
        <h2 style={{ fontSize: "1.2rem", marginBottom: "20px" }}>
          {question.text}
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {question.options.map((option) => (
            <button
              key={option.option_key}
              onClick={() => handleOptionSelect(option.option_key)}
              style={{
                padding: "15px",
                textAlign: "left",
                border: selectedOption === option.option_key
                  ? "2px solid #007bff"
                  : "1px solid #ddd",
                borderRadius: "8px",
                backgroundColor: selectedOption === option.option_key
                  ? "#e7f1ff"
                  : "#fff",
                color: "#333",
                cursor: "pointer",
                fontSize: "1rem",
              }}
            >
              <strong>{option.option_key}.</strong> {option.option_text}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleNext}
        disabled={selectedOption === null}
        style={{
          padding: "15px 30px",
          fontSize: "1rem",
          backgroundColor: selectedOption === null ? "#ccc" : "#007bff",
          color: selectedOption === null ? "#666" : "#fff",
          border: "none",
          borderRadius: "8px",
          cursor: selectedOption === null ? "not-allowed" : "pointer",
        }}
      >
        {isLastQuestion ? "Finalizar" : "Siguiente"}
      </button>

      <div style={{ marginTop: "20px" }}>
        <div
          style={{
            width: "100%",
            backgroundColor: "#eee",
            borderRadius: "4px",
            height: "8px"
          }}
        >
          <div
            style={{
              width: `${((currentQuestion + 1) / cuestionarioData.total_questions) * 100}%`,
              backgroundColor: "#007bff",
              height: "8px",
              borderRadius: "4px",
              transition: "width 0.3s ease"
            }}
          />
        </div>
      </div>
    </main>
  );
}

export default App;
