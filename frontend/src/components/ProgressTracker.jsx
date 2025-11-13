import './ProgressTracker.css';

function ProgressTracker({ totalSlides, progress }) {
  const completedCount = progress.filter(p => p.completed).length;
  const percentage = totalSlides > 0 ? Math.round((completedCount / totalSlides) * 100) : 0;

  return (
    <div className="progress-tracker">
      <div className="tracker-header">
        <h3>📊 學習進度</h3>
      </div>

      <div className="tracker-content">
        <div className="progress-circle-container">
          <svg className="progress-ring" width="120" height="120">
            <circle
              className="progress-ring-bg"
              cx="60"
              cy="60"
              r="50"
            />
            <circle
              className="progress-ring-fill"
              cx="60"
              cy="60"
              r="50"
              style={{
                strokeDasharray: `${2 * Math.PI * 50}`,
                strokeDashoffset: `${2 * Math.PI * 50 * (1 - percentage / 100)}`
              }}
            />
          </svg>
          <div className="progress-percentage">{percentage}%</div>
        </div>

        <div className="progress-stats">
          <div className="stat">
            <div className="stat-number">{completedCount}</div>
            <div className="stat-text">已完成</div>
          </div>
          <div className="stat-divider">/</div>
          <div className="stat">
            <div className="stat-number">{totalSlides}</div>
            <div className="stat-text">總投影片</div>
          </div>
        </div>

        {percentage === 100 && (
          <div className="completion-badge">
            🎉 恭喜完成所有課程！
          </div>
        )}
      </div>
    </div>
  );
}

export default ProgressTracker;
