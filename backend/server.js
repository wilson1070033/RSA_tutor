import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import * as db from './database.js';
import * as rsa from './rsa.js';

const app = express();
const PORT = process.env.PORT || 3000;

// 中介軟體
app.use(cors());
app.use(bodyParser.json());

// ============ 用戶相關 API ============

/**
 * 建立或取得用戶
 */
app.post('/api/users', (req, res) => {
  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ error: '需要提供用戶名稱' });
    }

    const user = db.createUser(username);
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * 取得用戶資訊
 */
app.get('/api/users/:userId', (req, res) => {
  try {
    const user = db.getUser(req.params.userId);

    if (!user) {
      return res.status(404).json({ error: '用戶不存在' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ 學習進度相關 API ============

/**
 * 更新學習進度
 */
app.post('/api/progress', (req, res) => {
  try {
    const { userId, slideNumber, completed } = req.body;

    if (!userId || slideNumber === undefined) {
      return res.status(400).json({ error: '缺少必要參數' });
    }

    db.updateProgress(userId, slideNumber, completed);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * 取得學習進度
 */
app.get('/api/progress/:userId', (req, res) => {
  try {
    const progress = db.getProgress(req.params.userId);
    res.json(progress);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ 測驗相關 API ============

/**
 * 提交測驗答案
 */
app.post('/api/quiz', (req, res) => {
  try {
    const { userId, questionNumber, answer, correct } = req.body;

    if (!userId || questionNumber === undefined || answer === undefined || correct === undefined) {
      return res.status(400).json({ error: '缺少必要參數' });
    }

    db.saveQuizAttempt(userId, questionNumber, answer, correct);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * 取得測驗統計
 */
app.get('/api/quiz/stats/:userId', (req, res) => {
  try {
    const stats = db.getQuizStats(req.params.userId);
    res.json(stats || { total_attempts: 0, correct_answers: 0, accuracy: 0 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ RSA 計算相關 API ============

/**
 * 檢查是否為質數
 */
app.get('/api/rsa/is-prime/:number', (req, res) => {
  try {
    const number = parseInt(req.params.number);

    if (isNaN(number)) {
      return res.status(400).json({ error: '無效的數字' });
    }

    const isPrime = rsa.isPrime(number);
    res.json({ number, isPrime });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * 生成指定範圍的質數列表
 */
app.get('/api/rsa/primes', (req, res) => {
  try {
    const min = parseInt(req.query.min) || 2;
    const max = parseInt(req.query.max) || 100;

    if (max - min > 1000) {
      return res.status(400).json({ error: '範圍不能超過 1000' });
    }

    const primes = rsa.generatePrimes(min, max);
    res.json({ min, max, count: primes.length, primes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * 生成 RSA 金鑰對
 */
app.post('/api/rsa/generate-keys', (req, res) => {
  try {
    const { p, q } = req.body;

    if (!p || !q) {
      return res.status(400).json({ error: '需要提供 p 和 q' });
    }

    const keyPair = rsa.generateKeyPair(p, q);
    res.json(keyPair);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * RSA 加密
 */
app.post('/api/rsa/encrypt', (req, res) => {
  try {
    const { message, n, e } = req.body;

    if (message === undefined || !n || !e) {
      return res.status(400).json({ error: '缺少必要參數' });
    }

    const ciphertext = rsa.encrypt(message, { n, e });
    res.json({ message, ciphertext, publicKey: { n, e } });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * RSA 解密
 */
app.post('/api/rsa/decrypt', (req, res) => {
  try {
    const { ciphertext, n, d } = req.body;

    if (ciphertext === undefined || !n || !d) {
      return res.status(400).json({ error: '缺少必要參數' });
    }

    const message = rsa.decrypt(ciphertext, { n, d });
    res.json({ ciphertext, message, privateKey: { n, d } });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * 取得建議的質數對
 */
app.get('/api/rsa/suggested-pairs', (req, res) => {
  try {
    const pairs = rsa.getSuggestedPrimePairs();
    res.json(pairs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * 儲存 RSA 練習記錄
 */
app.post('/api/rsa/practice', (req, res) => {
  try {
    const { userId, p, q, message, encrypted, decrypted } = req.body;

    if (!userId || !p || !q || message === undefined || encrypted === undefined || decrypted === undefined) {
      return res.status(400).json({ error: '缺少必要參數' });
    }

    db.savePractice(userId, p, q, message, encrypted, decrypted);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * 取得練習歷史
 */
app.get('/api/rsa/practice/:userId', (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const history = db.getPracticeHistory(req.params.userId, limit);
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ 健康檢查 ============

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'RSA Tutor API is running' });
});

// 啟動伺服器
app.listen(PORT, () => {
  console.log(`🚀 RSA Tutor 後端伺服器運行在 http://localhost:${PORT}`);
  console.log(`📚 API 文件: http://localhost:${PORT}/api/health`);
});
