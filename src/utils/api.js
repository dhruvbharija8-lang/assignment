// utils/api.js

const IMEI = '864993060968006';
// For testing: Use local mock server
// For production: Use 'http://smart.okdriver.in:5000'
const API_BASE = 'http://localhost:5000';

// API 1 — Device ko scan karne bolo
export async function requestVideoList() {
  const res = await fetch(`${API_BASE}/api/playback/request-list/${IMEI}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ useTFCard: true }),
  });
  return res.json();
}

// API 2 — Video list lo
export async function getVideoList() {
  const res = await fetch(`${API_BASE}/api/playback/videos/${IMEI}`);
  return res.json();
}

// API 3 — Specific clip mangwao + wait karo jab tak ready na ho
export async function requestClipAndWait(filename) {
  // Step 1: Device ko clip upload karne bolo
  const m3u8Filename = filename.replace('.ts', '.m3u8');
  await fetch(`${API_BASE}/api/playback/start/${IMEI}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      videoName: m3u8Filename,
      protocol: 'http',
      force: true,
    }),
  });

  // Step 2: Bar bar check karo ki video ready hui ya nahi
  const videoUrl = `${API_BASE}/uploads/${m3u8Filename}`;

  return new Promise((resolve, reject) => {
    let attempts = 0;
    const maxAttempts = 30; // 30 baar try karo = ~60 seconds

    const checkInterval = setInterval(async () => {
      attempts++;

      if (attempts > maxAttempts) {
        clearInterval(checkInterval);
        reject(new Error('Video load nahi hui 60 seconds mein'));
        return;
      }

      try {
        // HEAD request — sirf check karo ki file exist karti hai
        const res = await fetch(videoUrl, { method: 'HEAD' });
        if (res.ok) {
          clearInterval(checkInterval);
          resolve(videoUrl); // Video ready hai!
        }
        // Nahi mili toh wait karo aur dobara try karo
      } catch {
        // Abhi upload ho rahi hai, wait karo
      }
    }, 2000); // Har 2 second mein check karo
  });
}