// RSA 加密相關的數學函數

/**
 * 判斷一個數是否為質數
 */
export function isPrime(n) {
  if (n <= 1) return false;
  if (n <= 3) return true;
  if (n % 2 === 0 || n % 3 === 0) return false;

  for (let i = 5; i * i <= n; i += 6) {
    if (n % i === 0 || n % (i + 2) === 0) return false;
  }
  return true;
}

/**
 * 生成指定範圍內的質數
 */
export function generatePrimes(min, max) {
  const primes = [];
  for (let i = min; i <= max; i++) {
    if (isPrime(i)) {
      primes.push(i);
    }
  }
  return primes;
}

/**
 * 計算最大公因數 (GCD)
 */
export function gcd(a, b) {
  while (b !== 0) {
    const temp = b;
    b = a % b;
    a = temp;
  }
  return a;
}

/**
 * 擴展歐幾里得演算法，用於計算模反元素
 */
export function extendedGcd(a, b) {
  if (b === 0) {
    return { gcd: a, x: 1, y: 0 };
  }

  const result = extendedGcd(b, a % b);
  const x = result.y;
  const y = result.x - Math.floor(a / b) * result.y;

  return { gcd: result.gcd, x, y };
}

/**
 * 計算模反元素
 */
export function modInverse(e, phi) {
  const result = extendedGcd(e, phi);
  if (result.gcd !== 1) {
    throw new Error('模反元素不存在');
  }

  // 確保結果為正數
  let d = result.x % phi;
  if (d < 0) {
    d += phi;
  }

  return d;
}

/**
 * 模冪運算：計算 (base^exp) mod m
 */
export function modPow(base, exp, mod) {
  if (mod === 1) return 0;

  let result = 1;
  base = base % mod;

  while (exp > 0) {
    if (exp % 2 === 1) {
      result = (result * base) % mod;
    }
    exp = Math.floor(exp / 2);
    base = (base * base) % mod;
  }

  return result;
}

/**
 * 生成 RSA 金鑰對
 */
export function generateKeyPair(p, q) {
  // 驗證 p 和 q 是否為質數
  if (!isPrime(p) || !isPrime(q)) {
    throw new Error('p 和 q 必須都是質數');
  }

  if (p === q) {
    throw new Error('p 和 q 必須是不同的質數');
  }

  // 計算 n = p × q
  const n = p * q;

  // 計算 φ(n) = (p-1) × (q-1)
  const phi = (p - 1) * (q - 1);

  // 選擇 e（公鑰指數）
  // 常用的 e 值：3, 17, 65537
  // 這裡選擇一個與 φ(n) 互質的小值
  let e = 3;
  while (e < phi) {
    if (gcd(e, phi) === 1) {
      break;
    }
    e += 2;
  }

  // 計算 d（私鑰指數）
  const d = modInverse(e, phi);

  return {
    publicKey: { n, e },
    privateKey: { n, d },
    phi,
    p,
    q
  };
}

/**
 * RSA 加密
 */
export function encrypt(message, publicKey) {
  const { n, e } = publicKey;

  if (message >= n) {
    throw new Error(`訊息必須小於 n (${n})`);
  }

  return modPow(message, e, n);
}

/**
 * RSA 解密
 */
export function decrypt(ciphertext, privateKey) {
  const { n, d } = privateKey;

  return modPow(ciphertext, d, n);
}

/**
 * 生成隨機質數（在指定範圍內）
 */
export function getRandomPrime(min, max) {
  const primes = generatePrimes(min, max);
  if (primes.length === 0) {
    throw new Error('指定範圍內沒有質數');
  }
  return primes[Math.floor(Math.random() * primes.length)];
}

/**
 * 取得建議的質數對（用於教學）
 */
export function getSuggestedPrimePairs() {
  return [
    { p: 11, q: 17, description: '小數字範例（簡報使用）' },
    { p: 13, q: 19, description: '小數字範例' },
    { p: 17, q: 23, description: '小數字範例' },
    { p: 31, q: 37, description: '中等數字範例' },
    { p: 41, q: 43, description: '中等數字範例' },
    { p: 61, q: 67, description: '較大數字範例' }
  ];
}
