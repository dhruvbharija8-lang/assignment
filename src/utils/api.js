const IMEI = '864993060968006';
const API_BASE = 'http://localhost:5000';

export async function requestVideoList() {
  const res = await fetch(
    `${API_BASE}/api/playback/request-list/${IMEI}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        useTFCard: true,
      }),
    }
  );
  return res.json();
}

export async function getVideoList() {
  const res = await fetch(
    `${API_BASE}/api/playback/videos/${IMEI}`
  );
  return res.json();
}

export async function requestClipAndWait(filename) {
  const res = await fetch(
    `${API_BASE}/api/playback/start/${IMEI}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        videoName: filename,
        protocol: 'http',
        force: true,
      }),
    }
  );
  const data = await res.json();
  console.log(data);
  return data.videoUrl;
}