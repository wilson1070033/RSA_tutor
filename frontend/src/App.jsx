import { useState, useEffect } from 'react';
import Welcome from './components/Welcome';
import SlideNavigator from './components/SlideNavigator';
import RSACalculator from './components/RSACalculator';
import CaesarCipher from './components/CaesarCipher';
import Quiz from './components/Quiz';
import ProgressTracker from './components/ProgressTracker';
import { slides } from './data/slides';
import api from './utils/api';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('welcome'); // welcome, slides, calculator, caesar, quiz
  const [currentSlide, setCurrentSlide] = useState(0);
  const [user, setUser] = useState(null);
  const [progress, setProgress] = useState([]);

  // 載入用戶進度
  const loadProgress = async (userId) => {
    try {
      const data = await api.getProgress(userId);
      setProgress(data);
    } catch (error) {
      console.error('載入進度失敗:', error);
    }
  };

  // 用戶登入
  const handleLogin = async (username) => {
    try {
      const userData = await api.createUser(username);
      setUser(userData);
      await loadProgress(userData.id);
      setCurrentView('slides');
    } catch (error) {
      console.error('登入失敗:', error);
      alert('登入失敗，請重試');
    }
  };

  // 更新學習進度
  const updateSlideProgress = async (slideNumber, completed) => {
    if (!user) return;

    try {
      await api.updateProgress(user.id, slideNumber, completed);
      await loadProgress(user.id);
    } catch (error) {
      console.error('更新進度失敗:', error);
    }
  };

  // 切換投影片
  const goToSlide = (index) => {
    setCurrentSlide(index);
    updateSlideProgress(index, true);
  };

  // 下一張投影片
  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      goToSlide(currentSlide + 1);
    }
  };

  // 上一張投影片
  const prevSlide = () => {
    if (currentSlide > 0) {
      goToSlide(currentSlide - 1);
    }
  };

  return (
    <div className="app">
      {/* 頂部導覽列 */}
      {user && (
        <nav className="navbar">
          <div className="navbar-container">
            <h1 className="navbar-title">🔐 RSA 加密教學平台</h1>
            <div className="navbar-menu">
              <button
                className={`nav-btn ${currentView === 'slides' ? 'active' : ''}`}
                onClick={() => setCurrentView('slides')}
              >
                📚 教學投影片
              </button>
              <button
                className={`nav-btn ${currentView === 'calculator' ? 'active' : ''}`}
                onClick={() => setCurrentView('calculator')}
              >
                🧮 RSA 計算器
              </button>
              <button
                className={`nav-btn ${currentView === 'caesar' ? 'active' : ''}`}
                onClick={() => setCurrentView('caesar')}
              >
                👑 古典密碼
              </button>
              <button
                className={`nav-btn ${currentView === 'quiz' ? 'active' : ''}`}
                onClick={() => setCurrentView('quiz')}
              >
                ✏️ 測驗
              </button>
              <span className="user-info">👤 {user.username}</span>
            </div>
          </div>
        </nav>
      )}

      {/* 主要內容區域 */}
      <main className="main-content">
        {!user && (
          <Welcome onLogin={handleLogin} />
        )}

        {user && currentView === 'slides' && (
          <>
            <SlideNavigator
              slides={slides}
              currentSlide={currentSlide}
              onSlideChange={goToSlide}
              onNext={nextSlide}
              onPrev={prevSlide}
              progress={progress}
            />
            <ProgressTracker
              totalSlides={slides.length}
              progress={progress}
            />
          </>
        )}

        {user && currentView === 'calculator' && (
          <RSACalculator userId={user.id} />
        )}

        {user && currentView === 'caesar' && (
          <CaesarCipher />
        )}

        {user && currentView === 'quiz' && (
          <Quiz userId={user.id} />
        )}
      </main>
    </div>
  );
}

export default App;
