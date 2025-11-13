import { useState, useEffect } from 'react';
import { quizQuestions } from '../data/slides';
import api from '../utils/api';
import './Quiz.css';

function Quiz({ userId }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await api.getQuizStats(userId);
      setStats(data);
    } catch (err) {
      console.error('載入統計失敗:', err);
    }
  };

  const handleAnswer = async (answer) => {
    const question = quizQuestions[currentQuestion];
    const isCorrect = answer === question.answer;

    // 儲存答案
    setAnswers({
      ...answers,
      [currentQuestion]: { answer, correct: isCorrect }
    });

    // 提交到後端
    try {
      await api.submitQuizAnswer(userId, currentQuestion + 1, answer, isCorrect);
    } catch (err) {
      console.error('提交答案失敗:', err);
    }

    // 如果是最後一題，顯示結果
    if (currentQuestion === quizQuestions.length - 1) {
      await loadStats();
      setShowResults(true);
    } else {
      // 否則前往下一題
      setTimeout(() => {
        setCurrentQuestion(currentQuestion + 1);
      }, 1500);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setShowResults(false);
  };

  const calculateScore = () => {
    const correctCount = Object.values(answers).filter(a => a.correct).length;
    return {
      correct: correctCount,
      total: quizQuestions.length,
      percentage: Math.round((correctCount / quizQuestions.length) * 100)
    };
  };

  if (showResults) {
    const score = calculateScore();

    return (
      <div className="quiz-container fade-in">
        <div className="quiz-card">
          <div className="quiz-header">
            <h2>📊 測驗結果</h2>
          </div>

          <div className="results-summary">
            <div className="score-circle">
              <div className="score-number">{score.percentage}%</div>
              <div className="score-label">正確率</div>
            </div>

            <div className="score-details">
              <div className="score-item">
                <span className="score-icon">✅</span>
                <span>答對 {score.correct} 題</span>
              </div>
              <div className="score-item">
                <span className="score-icon">❌</span>
                <span>答錯 {score.total - score.correct} 題</span>
              </div>
              <div className="score-item">
                <span className="score-icon">📝</span>
                <span>總共 {score.total} 題</span>
              </div>
            </div>
          </div>

          {stats && stats.total_attempts > 0 && (
            <div className="overall-stats">
              <h3>📈 整體統計</h3>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-value">{stats.total_attempts}</div>
                  <div className="stat-label">總嘗試次數</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{stats.correct_answers}</div>
                  <div className="stat-label">累計答對</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{stats.accuracy}%</div>
                  <div className="stat-label">平均正確率</div>
                </div>
              </div>
            </div>
          )}

          <div className="results-review">
            <h3>📋 答題回顧</h3>
            {quizQuestions.map((q, index) => {
              const userAnswer = answers[index];
              return (
                <div key={q.id} className={`review-item ${userAnswer?.correct ? 'correct' : 'incorrect'}`}>
                  <div className="review-header">
                    <span className="review-number">題目 {index + 1}</span>
                    <span className="review-icon">
                      {userAnswer?.correct ? '✅' : '❌'}
                    </span>
                  </div>
                  <div className="review-question">{q.question}</div>
                  <div className="review-answer">
                    <strong>你的答案：</strong>
                    {userAnswer?.answer ? '⭕ 是（True）' : '❌ 否（False）'}
                  </div>
                  <div className="review-correct">
                    <strong>正確答案：</strong>
                    {q.answer ? '⭕ 是（True）' : '❌ 否（False）'}
                  </div>
                  <div className="review-explanation">
                    💡 {q.explanation}
                  </div>
                </div>
              );
            })}
          </div>

          <button className="retry-btn" onClick={resetQuiz}>
            🔄 重新測驗
          </button>
        </div>
      </div>
    );
  }

  const question = quizQuestions[currentQuestion];
  const hasAnswered = answers[currentQuestion] !== undefined;
  const userAnswer = answers[currentQuestion];

  return (
    <div className="quiz-container fade-in">
      <div className="quiz-card">
        <div className="quiz-header">
          <h2>✏️ RSA 加密測驗</h2>
          <div className="quiz-progress">
            <div className="progress-text">
              題目 {currentQuestion + 1} / {quizQuestions.length}
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${((currentQuestion + 1) / quizQuestions.length) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="question-section">
          <div className="question-number">第 {currentQuestion + 1} 題</div>
          <div className="question-text">{question.question}</div>
        </div>

        {!hasAnswered ? (
          <div className="answer-buttons">
            <button
              className="answer-btn true-btn"
              onClick={() => handleAnswer(true)}
            >
              ⭕ 是（True）
            </button>
            <button
              className="answer-btn false-btn"
              onClick={() => handleAnswer(false)}
            >
              ❌ 否（False）
            </button>
          </div>
        ) : (
          <div className="answer-feedback">
            {userAnswer.correct ? (
              <div className="feedback correct">
                <div className="feedback-icon">✅</div>
                <div className="feedback-title">答對了！</div>
                <div className="feedback-text">{question.explanation}</div>
              </div>
            ) : (
              <div className="feedback incorrect">
                <div className="feedback-icon">❌</div>
                <div className="feedback-title">答錯了</div>
                <div className="feedback-text">{question.explanation}</div>
                <div className="feedback-correct">
                  正確答案：{question.answer ? '⭕ 是（True）' : '❌ 否（False）'}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Quiz;
