import { useState } from 'react';
import './SlideNavigator.css';

function SlideNavigator({ slides, currentSlide, onSlideChange, onNext, onPrev }) {
  const [showMenu, setShowMenu] = useState(false);
  const slide = slides[currentSlide];

  return (
    <div className="slide-navigator fade-in">
      {/* 投影片主體 */}
      <div className="slide-container">
        <div className="slide-header">
          <div className="slide-number">
            {currentSlide + 1} / {slides.length}
          </div>
          <div className="slide-icon">{slide.icon}</div>
          <h2 className="slide-title">{slide.title}</h2>
          {slide.subtitle && (
            <p className="slide-subtitle">{slide.subtitle}</p>
          )}
        </div>

        <div className="slide-content">
          {slide.content.map((paragraph, index) => {
            if (paragraph === '') {
              return <div key={index} className="spacer"></div>;
            }

            if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
              return (
                <h3 key={index} className="content-heading">
                  {paragraph.replace(/\*\*/g, '')}
                </h3>
              );
            }

            if (paragraph.startsWith('•')) {
              return (
                <div key={index} className="bullet-point">
                  {paragraph}
                </div>
              );
            }

            return (
              <p key={index} className="content-paragraph">
                {paragraph}
              </p>
            );
          })}
        </div>

        {slide.keyPoints && (
          <div className="key-points">
            <h4 className="key-points-title">💡 重點整理</h4>
            <ul className="key-points-list">
              {slide.keyPoints.map((point, index) => (
                <li key={index}>{point}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* 控制按鈕 */}
      <div className="slide-controls">
        <button
          className="control-btn prev-btn"
          onClick={onPrev}
          disabled={currentSlide === 0}
        >
          ⬅️ 上一頁
        </button>

        <button
          className="control-btn menu-btn"
          onClick={() => setShowMenu(!showMenu)}
        >
          📋 目錄 ({currentSlide + 1}/{slides.length})
        </button>

        <button
          className="control-btn next-btn"
          onClick={onNext}
          disabled={currentSlide === slides.length - 1}
        >
          下一頁 ➡️
        </button>
      </div>

      {/* 投影片目錄 */}
      {showMenu && (
        <div className="slide-menu-overlay" onClick={() => setShowMenu(false)}>
          <div className="slide-menu" onClick={(e) => e.stopPropagation()}>
            <div className="menu-header">
              <h3>📋 課程目錄</h3>
              <button className="close-btn" onClick={() => setShowMenu(false)}>
                ✕
              </button>
            </div>
            <div className="menu-content">
              {slides.map((s, index) => (
                <button
                  key={s.id}
                  className={`menu-item ${index === currentSlide ? 'active' : ''}`}
                  onClick={() => {
                    onSlideChange(index);
                    setShowMenu(false);
                  }}
                >
                  <span className="menu-item-number">{index + 1}</span>
                  <span className="menu-item-icon">{s.icon}</span>
                  <span className="menu-item-title">{s.title}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SlideNavigator;
