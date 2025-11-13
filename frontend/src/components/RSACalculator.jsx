import { useState, useEffect } from 'react';
import api from '../utils/api';
import './RSACalculator.css';

function RSACalculator({ userId }) {
  const [step, setStep] = useState(1);
  const [p, setP] = useState('');
  const [q, setQ] = useState('');
  const [keyPair, setKeyPair] = useState(null);
  const [message, setMessage] = useState('');
  const [ciphertext, setCiphertext] = useState('');
  const [decrypted, setDecrypted] = useState('');
  const [suggestedPairs, setSuggestedPairs] = useState([]);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    loadSuggestedPairs();
    loadHistory();
  }, []);

  const loadSuggestedPairs = async () => {
    try {
      const pairs = await api.getSuggestedPairs();
      setSuggestedPairs(pairs);
    } catch (err) {
      console.error('載入建議質數對失敗:', err);
    }
  };

  const loadHistory = async () => {
    try {
      const data = await api.getPracticeHistory(userId, 5);
      setHistory(data);
    } catch (err) {
      console.error('載入練習歷史失敗:', err);
    }
  };

  const checkPrime = async (number) => {
    try {
      const result = await api.checkPrime(number);
      return result.isPrime;
    } catch (err) {
      return false;
    }
  };

  const handleGenerateKeys = async () => {
    setError('');

    const pNum = parseInt(p);
    const qNum = parseInt(q);

    if (!pNum || !qNum) {
      setError('請輸入有效的數字');
      return;
    }

    const pIsPrime = await checkPrime(pNum);
    const qIsPrime = await checkPrime(qNum);

    if (!pIsPrime) {
      setError(`${pNum} 不是質數！請選擇質數。`);
      return;
    }

    if (!qIsPrime) {
      setError(`${qNum} 不是質數！請選擇質數。`);
      return;
    }

    if (pNum === qNum) {
      setError('p 和 q 必須是不同的質數！');
      return;
    }

    try {
      const keys = await api.generateKeys(pNum, qNum);
      setKeyPair(keys);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.error || '生成金鑰失敗');
    }
  };

  const handleEncrypt = async () => {
    setError('');

    const msgNum = parseInt(message);
    if (!msgNum && msgNum !== 0) {
      setError('請輸入有效的數字訊息');
      return;
    }

    if (msgNum >= keyPair.publicKey.n) {
      setError(`訊息必須小於 n (${keyPair.publicKey.n})`);
      return;
    }

    try {
      const result = await api.encrypt(msgNum, keyPair.publicKey.n, keyPair.publicKey.e);
      setCiphertext(result.ciphertext.toString());
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.error || '加密失敗');
    }
  };

  const handleDecrypt = async () => {
    setError('');

    try {
      const result = await api.decrypt(
        parseInt(ciphertext),
        keyPair.privateKey.n,
        keyPair.privateKey.d
      );
      setDecrypted(result.message.toString());

      // 儲存練習記錄
      await api.savePractice(
        userId,
        keyPair.p,
        keyPair.q,
        parseInt(message),
        parseInt(ciphertext),
        result.message
      );

      await loadHistory();
      setStep(4);
    } catch (err) {
      setError(err.response?.data?.error || '解密失敗');
    }
  };

  const reset = () => {
    setStep(1);
    setP('');
    setQ('');
    setKeyPair(null);
    setMessage('');
    setCiphertext('');
    setDecrypted('');
    setError('');
  };

  const useSuggestedPair = (pair) => {
    setP(pair.p.toString());
    setQ(pair.q.toString());
  };

  return (
    <div className="calculator-container fade-in">
      <div className="calculator-header">
        <h2>🧮 RSA 加密計算器</h2>
        <p>親自體驗 RSA 加密的完整流程</p>
      </div>

      <div className="calculator-layout">
        {/* 主要計算區域 */}
        <div className="calculator-main">
          {/* 步驟 1: 生成金鑰 */}
          <div className={`calc-step ${step >= 1 ? 'active' : ''}`}>
            <h3 className="step-title">
              <span className="step-number">1</span>
              選擇兩個質數並生成金鑰對
            </h3>

            <div className="input-row">
              <div className="input-group">
                <label>質數 p:</label>
                <input
                  type="number"
                  value={p}
                  onChange={(e) => setP(e.target.value)}
                  placeholder="例如: 11"
                  disabled={step > 1}
                />
              </div>

              <div className="input-group">
                <label>質數 q:</label>
                <input
                  type="number"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="例如: 17"
                  disabled={step > 1}
                />
              </div>
            </div>

            {step === 1 && (
              <>
                <div className="suggested-pairs">
                  <p className="hint">💡 建議的質數對（點擊使用）：</p>
                  <div className="pairs-grid">
                    {suggestedPairs.map((pair, index) => (
                      <button
                        key={index}
                        className="pair-btn"
                        onClick={() => useSuggestedPair(pair)}
                      >
                        p={pair.p}, q={pair.q}
                        <small>{pair.description}</small>
                      </button>
                    ))}
                  </div>
                </div>

                <button className="action-btn" onClick={handleGenerateKeys}>
                  🔑 生成金鑰對
                </button>
              </>
            )}

            {keyPair && (
              <div className="result-box">
                <div className="result-item">
                  <strong>n = p × q:</strong> {keyPair.publicKey.n}
                </div>
                <div className="result-item">
                  <strong>φ(n) = (p-1) × (q-1):</strong> {keyPair.phi}
                </div>
                <div className="result-item public-key">
                  <strong>🔓 公鑰 (Public Key):</strong> (n={keyPair.publicKey.n}, e={keyPair.publicKey.e})
                </div>
                <div className="result-item private-key">
                  <strong>🔑 私鑰 (Private Key):</strong> (n={keyPair.privateKey.n}, d={keyPair.privateKey.d})
                </div>
              </div>
            )}
          </div>

          {/* 步驟 2: 加密 */}
          <div className={`calc-step ${step >= 2 ? 'active' : ''}`}>
            <h3 className="step-title">
              <span className="step-number">2</span>
              使用公鑰加密訊息
            </h3>

            {step >= 2 && (
              <>
                <div className="input-group">
                  <label>輸入要加密的訊息（數字）:</label>
                  <input
                    type="number"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={`輸入小於 ${keyPair?.publicKey.n} 的數字`}
                    disabled={step > 2}
                  />
                  <small>提示：訊息必須小於 n = {keyPair?.publicKey.n}</small>
                </div>

                {step === 2 && (
                  <button className="action-btn" onClick={handleEncrypt}>
                    🔒 加密訊息
                  </button>
                )}

                {ciphertext && (
                  <div className="result-box">
                    <div className="formula">
                      密文 C = M<sup>e</sup> mod n = {message}<sup>{keyPair.publicKey.e}</sup> mod {keyPair.publicKey.n}
                    </div>
                    <div className="result-item ciphertext">
                      <strong>🔒 加密結果（密文）:</strong> {ciphertext}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* 步驟 3: 解密 */}
          <div className={`calc-step ${step >= 3 ? 'active' : ''}`}>
            <h3 className="step-title">
              <span className="step-number">3</span>
              使用私鑰解密訊息
            </h3>

            {step >= 3 && (
              <>
                <div className="result-box">
                  <div className="result-item">
                    <strong>收到的密文:</strong> {ciphertext}
                  </div>
                  <div className="result-item">
                    <strong>使用私鑰:</strong> (n={keyPair.privateKey.n}, d={keyPair.privateKey.d})
                  </div>
                </div>

                {step === 3 && (
                  <button className="action-btn" onClick={handleDecrypt}>
                    🔓 解密訊息
                  </button>
                )}

                {decrypted && (
                  <div className="result-box">
                    <div className="formula">
                      明文 M = C<sup>d</sup> mod n = {ciphertext}<sup>{keyPair.privateKey.d}</sup> mod {keyPair.privateKey.n}
                    </div>
                    <div className="result-item decrypted">
                      <strong>🔓 解密結果（明文）:</strong> {decrypted}
                    </div>
                    {decrypted === message && (
                      <div className="success-message">
                        ✅ 成功！解密後的訊息與原始訊息相同！
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {error && (
            <div className="error-message">
              ⚠️ {error}
            </div>
          )}

          {step === 4 && (
            <button className="reset-btn" onClick={reset}>
              🔄 重新開始
            </button>
          )}
        </div>

        {/* 側邊欄 - 練習歷史 */}
        <div className="calculator-sidebar">
          <h3>📊 練習歷史</h3>
          {history.length === 0 ? (
            <p className="no-history">還沒有練習記錄</p>
          ) : (
            <div className="history-list">
              {history.map((record) => (
                <div key={record.id} className="history-item">
                  <div className="history-header">
                    <span className="history-keys">p={record.p}, q={record.q}</span>
                    <span className="history-time">
                      {new Date(record.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="history-content">
                    <div>明文: {record.message}</div>
                    <div>密文: {record.encrypted}</div>
                    <div>解密: {record.decrypted}</div>
                    <div className="history-status">
                      {record.message === record.decrypted ? '✅ 成功' : '❌ 失敗'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default RSACalculator;
