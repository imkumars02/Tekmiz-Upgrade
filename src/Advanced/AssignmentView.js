import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { db } from "../Firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { FaClock, FaChevronLeft, FaChevronRight, FaRedo } from "react-icons/fa";
import "./AssignmentView.scss";
import UserHeader from "../Header/UserHeader";

const AssignmentView = () => {
  const { playlistId } = useParams();
  const [assignments, setAssignments] = useState([]);
  const [error, setError] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [timer, setTimer] = useState(10);
  const [userAnswers, setUserAnswers] = useState([]);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const q = query(
          collection(db, "assignments"),
          where("playlistId", "==", playlistId)
        );
        const snapshot = await getDocs(q);
        const assignmentsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAssignments(assignmentsData);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchAssignments();
  }, [playlistId]);

  const handleNextQuestion = useCallback(() => {
    setUserAnswers((prev) => [...prev, selectedAnswer || null]);

    if (currentQuestionIndex < assignments.length - 1) {
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
      setTimer(10);
      setSelectedAnswer(null);
    } else {
      setShowResults(true);
    }
  }, [currentQuestionIndex, selectedAnswer, assignments.length]);

  useEffect(() => {
    let countdown;
    if (timer > 0 && !showResults) {
      countdown = setInterval(() => setTimer((prev) => prev - 1), 1000);
    } else if (timer === 0 && !showResults) {
      handleNextQuestion();
    }
    return () => clearInterval(countdown);
  }, [timer, showResults, handleNextQuestion]);

  const handleSelectAnswer = (answer) => {
    setSelectedAnswer(answer);
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prevIndex) => prevIndex - 1);
      setTimer(10);
      setSelectedAnswer(userAnswers[currentQuestionIndex - 1]);
    }
  };

  const handleRestartQuiz = () => {
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setShowResults(false);
    setTimer(10);
    setSelectedAnswer(null);
  };

  if (error) return <div className="error-message">Error: {error}</div>;
  if (!assignments.length) return <div className="loading-message">Loading quiz...</div>;

  const currentQuestion = assignments[currentQuestionIndex];

  const calculateScore = () => {
    return userAnswers.reduce((score, answer, index) => {
      const userAnswer = answer?.toLowerCase();
      const correctAnswer = assignments[index]?.answer.toLowerCase();
      return userAnswer === correctAnswer ? score + 1 : score;
    }, 0);
  };

  const totalQuestions = assignments.length;
  const score = showResults ? calculateScore() : 0;

  return (
    <>
      <UserHeader />
      <div className="quiz-page">
        <div className="quiz-container">
          <AnimatePresence mode="wait">
            {showResults ? (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="results-container"
              >
                <div className="score-circle">
                  <span className="score">{score}</span>
                  <span className="total">/{totalQuestions}</span>
                </div>
                <h2>Quiz Completed!</h2>
                <p>You scored {score} out of {totalQuestions}</p>
                <button onClick={handleRestartQuiz} className="restart-button">
                  <FaRedo /> Restart Quiz
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="question"
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className="question-container"
              >
                <div className="progress-bar">
                  <div
                    className="progress"
                    style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
                  ></div>
                </div>
                <div className="timer-wrapper">
                  <div className="timer-container">
                    <FaClock className="timer-icon" />
                    <svg className="timer-svg" viewBox="0 0 100 100">
                      <circle
                        className="timer-circle"
                        cx="50"
                        cy="50"
                        r="45"
                        style={{
                          strokeDasharray: 283,
                          strokeDashoffset: 283 - (timer / 10) * 283,
                        }}
                      />
                    </svg>
                    {/* <span className="timer-text">{timer}</span> */}
                  </div>
                </div>
                <h2>{currentQuestion.question}</h2>
                <div className="options">
                  {currentQuestion.options.map((option, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`option-button ${selectedAnswer === option ? "selected" : ""}`}
                      onClick={() => handleSelectAnswer(option)}
                    >
                      {option}
                    </motion.button>
                  ))}
                </div>
                <div className="navigation">
                  <button
                    onClick={handlePreviousQuestion}
                    disabled={currentQuestionIndex === 0}
                    className="nav-button prev"
                  >
                    <FaChevronLeft /> Previous
                  </button>
                  <button onClick={handleNextQuestion} className="nav-button next">
                    {currentQuestionIndex === assignments.length - 1 ? "Submit" : "Next"} <FaChevronRight />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
};

export default AssignmentView;