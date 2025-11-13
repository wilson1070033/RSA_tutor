import { useState } from 'react';
import './CaesarCipher.css';

function CaesarCipher() {
  const [message, setMessage] = useState('');
  const [shift, setShift] = useState(3);
  const [encrypted, setEncrypted] = useState('');
  const [decrypted, setDecrypted] = useState('');
  const [mode, setMode] = useState('encrypt'); // 'encrypt' or 'decrypt'
  const [showAllShifts, setShowAllShifts] = useState(false);

  // 凱薩密碼加密函數
  const caesarEncrypt = (text, shiftAmount) => {
    return text
      .split('')
      .map(char => {
        // 只處理英文字母
        if (char.match(/[a-z]/i)) {
          const code = char.charCodeAt(0);
          // 大寫字母
          if (code >= 65 && code <= 90) {
            return String.fromCharCode(((code - 65 + shiftAmount) % 26) + 65);
          }
          // 小寫字母
          if (code >= 97 && code <= 122) {
            return String.fromCharCode(((code - 97 + shiftAmount) % 26) + 97);
          }
        }
        // 非字母字符保持不變
        return char;
      })
      .join('');
  };

  // 凱薩密碼解密函數
  const caesarDecrypt = (text, shiftAmount) => {
    return caesarEncrypt(text, 26 - shiftAmount);
  };

  // 處理加密
  const handleEncrypt = () => {
    if (!message.trim()) {
      alert('請輸入要加密的訊息');
      return;
    }
    const result = caesarEncrypt(message, shift);
    setEncrypted(result);
    setDecrypted('');
  };

  // 處理解密
  const handleDecrypt = () => {
    if (!message.trim()) {
      alert('請輸入要解密的訊息');
      return;
    }
    const result = caesarDecrypt(message, shift);
    setDecrypted(result);
    setEncrypted('');
  };

  // 暴力破解（顯示所有可能的移位）
  const bruteForce = () => {
    if (!message.trim()) {
      alert('請輸入要破解的密文');
      return;
    }
    setShowAllShifts(true);
  };

  // 生成所有可能的解密結果
  const getAllShifts = () => {
    const results = [];
    for (let i = 1; i <= 25; i++) {
      results.push({
        shift: i,
        text: caesarDecrypt(message, i)
      });
    }
    return results;
  };

  // 清除所有內容
  const handleClear = () => {
    setMessage('');
    setEncrypted('');
    setDecrypted('');
    setShowAllShifts(false);
  };

  return (
    <div className="caesar-container fade-in">
      <div className="caesar-header">
        <h2>👑 凱薩密碼互動工具</h2>
        <p>體驗古羅馬時期的加密技術</p>
      </div>

      <div className="caesar-content">
        {/* 輸入區域 */}
        <div className="input-section">
          <div className="mode-selector">
            <button
              className={`mode-btn ${mode === 'encrypt' ? 'active' : ''}`}
              onClick={() => {
                setMode('encrypt');
                setShowAllShifts(false);
              }}
            >
              🔒 加密模式
            </button>
            <button
              className={`mode-btn ${mode === 'decrypt' ? 'active' : ''}`}
              onClick={() => {
                setMode('decrypt');
                setShowAllShifts(false);
              }}
            >
              🔓 解密模式
            </button>
            <button
              className={`mode-btn ${mode === 'bruteforce' ? 'active' : ''}`}
              onClick={() => {
                setMode('bruteforce');
                setShowAllShifts(false);
              }}
            >
              💪 暴力破解
            </button>
          </div>

          <div className="input-group">
            <label>
              {mode === 'encrypt' ? '輸入要加密的訊息（英文）：' : '輸入密文：'}
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value.toUpperCase())}
              placeholder={mode === 'encrypt' ? '例如：HELLO WORLD' : '例如：KHOOR ZRUOG'}
              rows={3}
            />
          </div>

          {mode !== 'bruteforce' && (
            <div className="shift-control">
              <label>移位數：{shift}</label>
              <input
                type="range"
                min="1"
                max="25"
                value={shift}
                onChange={(e) => setShift(parseInt(e.target.value))}
                className="shift-slider"
              />
              <div className="shift-numbers">
                {[...Array(25)].map((_, i) => (
                  <button
                    key={i + 1}
                    className={`shift-num ${shift === i + 1 ? 'active' : ''}`}
                    onClick={() => setShift(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="action-buttons">
            {mode === 'encrypt' && (
              <button className="action-btn encrypt-btn" onClick={handleEncrypt}>
                🔒 加密
              </button>
            )}
            {mode === 'decrypt' && (
              <button className="action-btn decrypt-btn" onClick={handleDecrypt}>
                🔓 解密
              </button>
            )}
            {mode === 'bruteforce' && (
              <button className="action-btn bruteforce-btn" onClick={bruteForce}>
                💪 嘗試所有可能
              </button>
            )}
            <button className="action-btn clear-btn" onClick={handleClear}>
              🗑️ 清除
            </button>
          </div>
        </div>

        {/* 結果顯示區域 */}
        {encrypted && (
          <div className="result-section">
            <h3>🔒 加密結果</h3>
            <div className="result-box encrypted">
              <div className="result-text">{encrypted}</div>
              <div className="result-info">
                原文 "{message}" 經過移位 {shift} 後變成 "{encrypted}"
              </div>
            </div>
            <div className="alphabet-chart">
              <div className="chart-row">
                <span className="chart-label">原文：</span>
                <div className="chart-letters">
                  {message.split('').map((char, index) => (
                    <span key={index} className="chart-letter original">
                      {char}
                    </span>
                  ))}
                </div>
              </div>
              <div className="chart-row">
                <span className="chart-label">密文：</span>
                <div className="chart-letters">
                  {encrypted.split('').map((char, index) => (
                    <span key={index} className="chart-letter encrypted">
                      {char}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {decrypted && (
          <div className="result-section">
            <h3>🔓 解密結果</h3>
            <div className="result-box decrypted">
              <div className="result-text">{decrypted}</div>
              <div className="result-info">
                密文 "{message}" 反向移位 {shift} 後還原成 "{decrypted}"
              </div>
            </div>
          </div>
        )}

        {showAllShifts && (
          <div className="result-section">
            <h3>💪 暴力破解結果（嘗試所有 25 種可能）</h3>
            <p className="bruteforce-hint">
              🔍 仔細觀察下面的結果，哪一個看起來像有意義的英文句子？
            </p>
            <div className="bruteforce-results">
              {getAllShifts().map((result) => (
                <div key={result.shift} className="bruteforce-item">
                  <span className="bruteforce-shift">移位 {result.shift}:</span>
                  <span className="bruteforce-text">{result.text}</span>
                </div>
              ))}
            </div>
            <div className="bruteforce-note">
              💡 這就是為什麼凱薩密碼不安全：只有 25 種可能，很容易被破解！
            </div>
          </div>
        )}

        {/* 說明區域 */}
        <div className="info-section">
          <h3>📖 凱薩密碼說明</h3>
          <div className="info-content">
            <div className="info-item">
              <strong>📜 歷史：</strong>
              <p>凱薩密碼是古羅馬皇帝凱薩大帝用來加密軍事訊息的方法，據說他使用移位數 3。</p>
            </div>
            <div className="info-item">
              <strong>🔤 原理：</strong>
              <p>將字母表中的每個字母向後（或向前）移動固定的位數。例如移位 3 時，A 變成 D，B 變成 E。</p>
            </div>
            <div className="info-item">
              <strong>⚠️ 弱點：</strong>
              <p>只有 25 種可能的移位（1-25），電腦可以在瞬間嘗試所有可能性並破解。</p>
            </div>
            <div className="info-item">
              <strong>💡 試試看：</strong>
              <ul>
                <li>試著加密你的名字或一句話</li>
                <li>改變移位數看看結果如何變化</li>
                <li>使用暴力破解模式體驗破解的過程</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 字母對照表 */}
        <div className="alphabet-reference">
          <h3>🔤 字母對照表（移位數：{shift}）</h3>
          <div className="alphabet-grid">
            <div className="alphabet-row">
              <span className="row-label">原文：</span>
              {Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZ').map(letter => (
                <span key={letter} className="alphabet-cell original">{letter}</span>
              ))}
            </div>
            <div className="alphabet-row">
              <span className="row-label">密文：</span>
              {Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZ').map(letter => (
                <span key={letter} className="alphabet-cell encrypted">
                  {caesarEncrypt(letter, shift)}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CaesarCipher;
