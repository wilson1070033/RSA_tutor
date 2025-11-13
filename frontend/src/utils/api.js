import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = {
  // ============ 用戶相關 ============
  createUser: async (username) => {
    const response = await axios.post(`${API_BASE_URL}/users`, { username });
    return response.data;
  },

  getUser: async (userId) => {
    const response = await axios.get(`${API_BASE_URL}/users/${userId}`);
    return response.data;
  },

  // ============ 進度相關 ============
  updateProgress: async (userId, slideNumber, completed) => {
    const response = await axios.post(`${API_BASE_URL}/progress`, {
      userId,
      slideNumber,
      completed
    });
    return response.data;
  },

  getProgress: async (userId) => {
    const response = await axios.get(`${API_BASE_URL}/progress/${userId}`);
    return response.data;
  },

  // ============ 測驗相關 ============
  submitQuizAnswer: async (userId, questionNumber, answer, correct) => {
    const response = await axios.post(`${API_BASE_URL}/quiz`, {
      userId,
      questionNumber,
      answer,
      correct
    });
    return response.data;
  },

  getQuizStats: async (userId) => {
    const response = await axios.get(`${API_BASE_URL}/quiz/stats/${userId}`);
    return response.data;
  },

  // ============ RSA 計算相關 ============
  checkPrime: async (number) => {
    const response = await axios.get(`${API_BASE_URL}/rsa/is-prime/${number}`);
    return response.data;
  },

  getPrimes: async (min, max) => {
    const response = await axios.get(`${API_BASE_URL}/rsa/primes`, {
      params: { min, max }
    });
    return response.data;
  },

  generateKeys: async (p, q) => {
    const response = await axios.post(`${API_BASE_URL}/rsa/generate-keys`, { p, q });
    return response.data;
  },

  encrypt: async (message, n, e) => {
    const response = await axios.post(`${API_BASE_URL}/rsa/encrypt`, { message, n, e });
    return response.data;
  },

  decrypt: async (ciphertext, n, d) => {
    const response = await axios.post(`${API_BASE_URL}/rsa/decrypt`, { ciphertext, n, d });
    return response.data;
  },

  getSuggestedPairs: async () => {
    const response = await axios.get(`${API_BASE_URL}/rsa/suggested-pairs`);
    return response.data;
  },

  savePractice: async (userId, p, q, message, encrypted, decrypted) => {
    const response = await axios.post(`${API_BASE_URL}/rsa/practice`, {
      userId,
      p,
      q,
      message,
      encrypted,
      decrypted
    });
    return response.data;
  },

  getPracticeHistory: async (userId, limit = 10) => {
    const response = await axios.get(`${API_BASE_URL}/rsa/practice/${userId}`, {
      params: { limit }
    });
    return response.data;
  }
};

export default api;
