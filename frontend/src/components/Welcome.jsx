import { useState } from 'react';
import './Welcome.css';

function Welcome({ onLogin }) {
  const [username, setUsername] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username.trim()) {
      onLogin(username.trim());
    }
  };

  return (
    <div className="welcome-container">
      <div className="welcome-card fade-in">
        <div className="welcome-header">
          <h1 className="welcome-title">
            <span className="icon">🔐</span>
            RSA 加密教學平台
          </h1>
          <p className="welcome-subtitle">從零開始的加密世界</p>
        </div>

        <div className="welcome-content">
          <p className="welcome-description">
            歡迎來到互動式 RSA 加密教學平台！
          </p>
          <p className="welcome-description">
            在這裡，你將學習到：
          </p>

          <ul className="feature-list">
            <li>🔒 什麼是加密，為什麼重要</li>
            <li>🔑 RSA 加密的原理和運作方式</li>
            <li>🧮 實際動手操作 RSA 加密解密</li>
            <li>📊 追蹤你的學習進度</li>
            <li>✏️ 透過測驗驗證你的理解</li>
          </ul>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="input-group">
              <label htmlFor="username">請輸入你的名字開始學習：</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="輸入你的名字..."
                className="username-input"
                autoFocus
              />
            </div>
            <button type="submit" className="start-btn" disabled={!username.trim()}>
              🚀 開始學習
            </button>
          </form>
        </div>

        <div className="welcome-footer">
          <p className="footer-note">
            💡 提示：不需要任何密碼學背景，跟著課程一步步學習即可！
          </p>
        </div>
      </div>
    </div>
  );
}

export default Welcome;
