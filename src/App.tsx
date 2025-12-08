import { useState } from "react";
import { cuestionarioData } from "./data/cuestionario";

function App() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const question = cuestionarioData.questions[currentQuestion];
  const isLastQuestion = currentQuestion === cuestionarioData.questions.length - 1;

  function handleNext() {
    if (selectedOption === null) return;

    if (isLastQuestion) {
      alert("Cuestionario completado!");
      setCurrentQuestion(0);
      setSelectedOption(null);
    } else {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedOption(null);
    }
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
              onClick={() => setSelectedOption(option.option_key)}
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
