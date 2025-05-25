import { useState } from 'react';
import styles from '../styles/Quiz.module.css';

interface Question {
  id: number;
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  userAnswer: string;
  correctAnswer?: string;
  isCorrect?: boolean;
  feedback?: string;
}

interface QuizResult {
  score: string;
  evaluatedQuestions: Question[];
}

export default function Quiz() {
  const [topic, setTopic] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateQuiz = async () => {
    if (!topic.trim()) return;

    setLoading(true);
    setQuestions([]);
    setQuizResult(null);
    setError(null);

    try {
      const response = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate quiz');
      }

      const data = await response.json();
      if (!data.questions || data.questions.length === 0) {
        throw new Error('No questions generated');
      }

      setQuestions(data.questions.map((q: any, index: number) => ({
        id: index + 1,
        question: q.question,
        options: q.options,
        userAnswer: '',
        correctAnswer: q.correctAnswer,
      })));
    } catch (error) {
      console.error('Error generating quiz:', error);
      setError('Failed to generate quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const checkAnswers = async () => {
    if (!questions.length) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/check-answers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          questions,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to check answers');
      }

      const result = await response.json();
      setQuizResult(result);
    } catch (error) {
      console.error('Error checking answers:', error);
      setError('Failed to check answers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (id: number, answer: string) => {
    setQuestions(questions.map(q =>
      q.id === id ? { ...q, userAnswer: answer } : q
    ));
  };

  return (
    <div className={styles.quiz}>
      <h1 className={styles.title}>QUIZLY</h1>

      <div className={styles.inputSection}>
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Enter a topic (e.g., World War II, Photosynthesis)"
          className={styles.topicInput}
          disabled={loading}
        />
        <button
          onClick={generateQuiz}
          disabled={loading || !topic.trim()}
          className={styles.button}
        >
          {loading ? 'Generating...' : 'Generate Quiz'}
        </button>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {questions.length > 0 && (
        <div className={styles.questionsContainer}>
          {questions.map((q) => (
            <div
              key={q.id}
              className={`${styles.questionCard} ${
                quizResult ? (q.userAnswer === q.correctAnswer ? styles.correct : styles.incorrect) : ''
              }`}
            >
              <h3 className={styles.questionText}>
                Question {q.id}: {q.question}
              </h3>
              <div className={styles.optionsGrid}>
                {Object.entries(q.options).map(([letter, text]) => (
                  <label key={letter} className={styles.optionLabel}>
                    <input
                      type="radio"
                      name={`question-${q.id}`}
                      value={letter}
                      checked={q.userAnswer === letter}
                      onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                      disabled={loading || !!quizResult}
                      className={styles.radioInput}
                    />
                    <span className={styles.optionText}>
                      {letter}) {text}
                    </span>
                  </label>
                ))}
              </div>

              {quizResult && (
                <div className={styles.feedback}>
                  {q.userAnswer === q.correctAnswer ? (
                    <p className={styles.correctText}>Correct!</p>
                  ) : (
                    <>
                      
                      <p className={styles.correctText}>
                        Correct Answer: {q.correctAnswer}
                      </p>
                    </>
                  )}
                </div>
              )}
            </div>
          ))}

          {!quizResult && questions.some(q => q.userAnswer) && (
            <button
              onClick={checkAnswers}
              disabled={loading || questions.some(q => !q.userAnswer)}
              className={`${styles.button} ${styles.checkButton}`}
            >
              {loading ? 'Checking...' : 'Check My Answers'}
            </button>
          )}

          {quizResult && (
            <div className={styles.result}>
              <h2>Final Score: {parseInt(quizResult.score)}/5</h2>
              <button
                onClick={() => {
                  setQuestions([]);
                  setQuizResult(null);
                  setTopic('');
                  setError(null);
                }}
                className={`${styles.button} ${styles.newQuizButton}`}
              >
                Start New Quiz
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
