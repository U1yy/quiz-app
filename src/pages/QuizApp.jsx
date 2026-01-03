import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import MOCK_QUIZZES from "../data/quizzes";
import Sidebar from './Sidebar';

// Warning Modal
const WarningModal = ({ type, onClose, onBackToDashboard }) => {
  const getContent = () => {
    switch (type) {
      case 'tab-switch':
        return {
          icon: (
            <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center border-4 border-black mx-auto mb-6">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          ),
          title: 'Oops! You Left the Quiz',
          message: 'Please stay on this page so your quiz progress isn\'t interrupted. Three times away and your quiz will auto-submit, so keep focused!',
          buttonText: 'Back to Quiz',
          buttonClass: 'bg-cyan-200 hover:bg-cyan-300'
        };
      case 'time-up':
        return {
          icon: (
            <div className="w-24 h-24 rounded-full bg-cyan-100 flex items-center justify-center border-4 border-black mx-auto mb-6">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          ),
          title: 'Oops! Quiz Time\'s Up',
          message: 'Looks like you switched tabs too many times, your quiz has been safely saved and submitted. Check your results on the dashboard!',
          buttonText: 'Back to Dashboard',
          buttonClass: 'bg-cyan-200 hover:bg-cyan-300',
          isDashboard: true
        };
      case 'already-taken':
        return {
          icon: (
            <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center border-4 border-black mx-auto mb-6">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          ),
          title: 'Oops! Quiz Already Taken',
          message: 'You have already taken this quiz. Please wait for the instructor to release your score.',
          buttonText: 'Back to Dashboard',
          buttonClass: 'bg-cyan-200 hover:bg-cyan-300',
          isDashboard: true
        };
      case 'exit-warning':
        return {
          icon: (
            <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center border-4 border-black mx-auto mb-6">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          ),
          title: 'Oops! You Left the Quiz',
          message: 'Please stay on this page so your quiz progress isn\'t interrupted. Three times away and your quiz will auto-submit, so keep focused!',
          buttonText: 'Back to Quiz',
          buttonClass: 'bg-cyan-200 hover:bg-cyan-300'
        };
      default:
        return null;
    }
  };

  const content = getContent();

  return (
    <div className="fixed inset-0 bg-white flex items-center justify-center z-50 min-h-screen">
      <div className="text-center max-w-2xl px-8">
        <div className="relative inline-flex items-center justify-center mb-8">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-cyan-200 rounded-full opacity-30 blur-3xl pointer-events-none"></div>
          {content.icon}
        </div>

        <h2 className="text-4xl font-bold text-gray-900 mb-6 text-center">{content.title}</h2>
        <p className="text-lg text-gray-700 text-center mb-12 leading-relaxed max-w-xl mx-auto">{content.message}</p>

        <Button
          onClick={content.isDashboard ? onBackToDashboard : onClose}
          className={`${content.buttonClass} text-gray-900 font-medium px-12 py-4 rounded-full text-lg shadow-lg border-none`}
        >
          {content.buttonText}
        </Button>
      </div>
    </div>
  );
};

const QuizApp = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const hasSubmitted = useRef(false);

  const user =
    location.state?.user ||
    JSON.parse(localStorage.getItem("quizAppUser")) || null;

  const [currentView, setCurrentView] = useState('home');
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(300);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [showWarning, setShowWarning] = useState(null);
  const [takenQuizzes, setTakenQuizzes] = useState({});
  const [autoSubmitReason, setAutoSubmitReason] = useState(null);

  // user authentication
  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);


  useEffect(() => {
    if (!user) return;
    const key = `takenQuizzes_${user.email}`;
    const saved = JSON.parse(localStorage.getItem(key)) || {};
    setTakenQuizzes(saved);
  }, [user?.email]);

  useEffect(() => {
    if (!autoSubmitReason || hasSubmitted.current || !selectedQuiz || quizCompleted) return;
    
    hasSubmitted.current = true;
    setQuizCompleted(true);
    
    const finalAnswers = { ...answers };
    if (selectedAnswer !== null && finalAnswers[currentQuestionIndex] === undefined) {
      finalAnswers[currentQuestionIndex] = selectedAnswer;
    }

    let score = 0;
    selectedQuiz.questions.forEach((q, i) => {
      if (finalAnswers[i] === q.correctAnswer) score++;
    });

    const activity = {
      studentEmail: user.email,
      quizId: selectedQuiz.id,
      quizTitle: selectedQuiz.title,
      score,
      total: selectedQuiz.questions.length,
      date: new Date().toLocaleString(),
      autoSubmitted: true,
      submitReason: autoSubmitReason,
      tabSwitchViolations: tabSwitchCount
    };

    const activities = JSON.parse(localStorage.getItem("quizActivities")) || [];
    activities.push(activity);
    localStorage.setItem("quizActivities", JSON.stringify(activities));

    const key = `takenQuizzes_${user.email}`;
    const saved = JSON.parse(localStorage.getItem(key)) || {};
    const updated = { ...saved, [selectedQuiz.id]: true };
    localStorage.setItem(key, JSON.stringify(updated));
    
    setTakenQuizzes(updated);
    setAnswers(finalAnswers);
  }, [autoSubmitReason]);

  useEffect(() => {
    if (currentView !== 'quiz' || quizCompleted) return;

    let lastEventTime = 0;
    const DEBOUNCE_TIME = 2000;

    const registerViolation = (source) => {
      const now = Date.now();
      if (now - lastEventTime < DEBOUNCE_TIME) {
        console.log('Debounced:', source);
        return;
      }
      lastEventTime = now;

      console.log('Violation registered from:', source);

      setTabSwitchCount(prev => {
        const next = prev + 1;
        console.log('Tab switch count:', next); 

        if (next < 3) {
          setShowWarning('tab-switch');
        } else {
          setAutoSubmitReason('tab-switch');
          setShowWarning('time-up');
        }

        return next;
      });
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log('Tab switched away');
        registerViolation('visibility-change');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [currentView, quizCompleted]);

  // timer effect
  useEffect(() => {
    if (currentView === 'quiz' && !quizCompleted && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setAutoSubmitReason("time-up");
            setShowWarning("time-up");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [currentView, quizCompleted, timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startQuiz = (quiz) => {
    hasSubmitted.current = false;
    setSelectedQuiz(quiz);
    setCurrentView('quiz');
    setCurrentQuestionIndex(0);
    setAnswers({});
    setSelectedAnswer(null);
    setTimeLeft(300);
    setQuizCompleted(false);
    setTabSwitchCount(0);
    setAutoSubmitReason(null);
  };

  const handleAnswerSelect = (index) => setSelectedAnswer(index);

  const handleNextQuestion = () => {
    if (selectedAnswer !== null) {
      setAnswers((prev) => ({
        ...prev,
        [currentQuestionIndex]: selectedAnswer,
      }));
    }

    if (currentQuestionIndex < selectedQuiz.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedAnswer(null);
    } else {
      handleQuizComplete();
    }
  };

  const handleQuizComplete = useCallback(() => {
    if (hasSubmitted.current) return;
    hasSubmitted.current = true;
    
    setQuizCompleted(true);

    setAnswers(prevAnswers => {
      const finalAnswers = { ...prevAnswers };

      if (
        selectedAnswer !== null &&
        finalAnswers[currentQuestionIndex] === undefined
      ) {
        finalAnswers[currentQuestionIndex] = selectedAnswer;
      }

      let score = 0;
      selectedQuiz.questions.forEach((q, i) => {
        if (finalAnswers[i] === q.correctAnswer) score++;
      });

      const activity = {
        studentEmail: user.email,
        quizId: selectedQuiz.id,
        quizTitle: selectedQuiz.title,
        score,
        total: selectedQuiz.questions.length,
        date: new Date().toLocaleString(),
        autoSubmitted: false,
        submitReason: "finished",
        tabSwitchViolations: tabSwitchCount
      };

      const activities =
        JSON.parse(localStorage.getItem("quizActivities")) || [];
      activities.push(activity);
      localStorage.setItem("quizActivities", JSON.stringify(activities));

      const key = `takenQuizzes_${user.email}`;
      const saved = JSON.parse(localStorage.getItem(key)) || {};
      const updated = { ...saved, [selectedQuiz.id]: true };
      
      localStorage.setItem(key, JSON.stringify(updated));
      setTakenQuizzes(updated);

      return finalAnswers;
    });
  }, [selectedAnswer, currentQuestionIndex, selectedQuiz, user]);

  const handleBackToHome = () => {
    hasSubmitted.current = false;
    setCurrentView('home');
    setSelectedQuiz(null);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setSelectedAnswer(null);
    setQuizCompleted(false);
    setTabSwitchCount(0);
    setShowWarning(null);
    setAutoSubmitReason(null);
  };

  const handleCloseWarning = () => {
    setShowWarning(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("quizAppUser");
    navigate("/login");
  };

  const currentQuestion = selectedQuiz?.questions[currentQuestionIndex];

  if (showWarning === "time-up") {
    return (
      <WarningModal
        type="time-up"
        onBackToDashboard={handleBackToHome}
      />
    );
  }

  if (showWarning) {
    return (
      <WarningModal
        type={showWarning}
        onClose={handleCloseWarning}
        onBackToDashboard={handleBackToHome}
      />
    );
  }

  // Main layout with sidebar
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar*/}
      {currentView !== 'quiz' && <Sidebar user={user} onLogout={handleLogout} />}

      {/* Main */}
      <div className="flex-1 overflow-y-auto">
        {/* QuizView */}
        {quizCompleted && (
          <div className="bg-[url('/quiz_bg.svg')] bg-no-repeat bg-center min-h-screen bg-gray-100 flex items-center justify-center p-8">
            <div className="text-center max-w-2xl">
              <div className="relative inline-flex items-center justify-center mb-8">
                <div className="w-32 h-32 rounded-full flex items-center justify-center border-4 border-black">
                  <img src="/check_quiz.svg" alt="check" />
                </div>
              </div>

              <h2 className="text-4xl font-bold text-gray-900 mb-6">Quiz Completed!</h2>

              <p className="text-lg text-gray-700 mb-12 max-w-xl mx-auto">
                Your answers have been submitted. Please wait for the instructor to release the results.
              </p>

              <Button
                onClick={handleBackToHome}
                className="bg-cyan-200 hover:bg-cyan-400 text-gray-900 font-medium px-12 py-4 rounded-full text-lg shadow-lg border-none"
              >
                Back to Dashboard
              </Button>
            </div>
          </div>
        )}

        {/* Home View */}
        {currentView === 'home' && !quizCompleted && (
          <div className="bg-[url('/ellipse_quiz.svg')] bg-no-repeat min-h-screen bg-grey-200 pt-24">
            <div className="max-w-4xl mx-auto">
              <Card className="mb-8 mt-4 border-none bg-gray-50 shadow-lg">
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h1 className="text-2xl font-bold text-gray-800 mb-2">
                        Welcome back! Let's continue your learning journey
                      </h1>
                      <p className="text-gray-600 text-sm">
                        Please select your Quiz
                      </p>
                    </div>
                    <div className="ml-8 shrink-0">
                      <div className="w-50 h-20 rounded-lg flex items-center justify-center">
                        <div className="text-center">
                          <img src="/study.png" alt="study" />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-4">
                {MOCK_QUIZZES.map((quiz) => (
                  <Card key={quiz.id} className="border-2 border-gray-300 shadow-md hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                          <div className="text-gray-700 font-medium min-w-20">
                            {quiz.code}
                          </div>
                          <div className="text-gray-800 font-medium">
                            {quiz.title}
                          </div>
                        </div>
                        <Button
                          onClick={() => {
                            if (takenQuizzes[quiz.id]) {
                              setShowWarning("already-taken");
                            } else {
                              startQuiz(quiz);
                            }
                          }}
                          className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-medium px-6 py-2 rounded-full shadow-md"
                        >
                          Start Quiz
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Quiz View */}
        {currentView === 'quiz' && !quizCompleted && (
          <div className="bg-[url('/quiz_bg.svg')] bg-no-repeat bg-center bg-gray-100 min-h-screen p-8">
            <div className="max-w-4xl mx-auto">
              <div className="flex justify-between items-center mb-8">
                <div className="bg-white px-6 py-3 rounded-full border-2 border-gray-300 shadow-md">
                  <span className="text-2xl font-bold text-gray-800">
                    {currentQuestionIndex + 1}/{selectedQuiz.questions.length}
                  </span>
                </div>
                <div className="bg-white px-6 py-3 rounded-xl border-2 border-gray-300 shadow-md">
                  <span className="text-2xl font-bold text-gray-800">
                    {formatTime(timeLeft)}
                  </span>
                </div>
              </div>

              <Card className="border-2 border-gray-300 shadow-xl mb-8">
                <CardContent className="p-8">
                  <p className="text-lg text-gray-800 leading-relaxed">
                    {currentQuestion.question}
                  </p>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {currentQuestion.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    className={`p-6 rounded-xl border-2 transition-all text-left font-medium text-gray-800 ${
                      selectedAnswer === index
                        ? 'border-blue-500 bg-blue-100 shadow-lg scale-105'
                        : 'border-gray-300 bg-white hover:border-blue-300 hover:shadow-md'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>

              <div className="flex justify-center">
                <Button
                  onClick={handleNextQuestion}
                  disabled={selectedAnswer === null}
                  className="bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-300 disabled:cursor-not-allowed text-gray-900 font-medium px-12 py-3 rounded-full shadow-md text-lg"
                >
                  {currentQuestionIndex < selectedQuiz.questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizApp;