// Mock API Server - Simulates the device API
// Run: node mock-server.js
// Then access frontend at http://localhost:3000

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();

app.use(cors());
app.use(express.json());

// Custom handler for video streaming with range request support
const videoHandler = (req, res) => {
  const filename = req.params.filename;
  const filepath = path.join(__dirname, 'uploads', filename);

  // Security check
  if (!fs.existsSync(filepath)) {
    return res.status(404).json({ error: 'File not found' });
  }

  const stat = fs.statSync(filepath);
  const fileSize = stat.size;

  // Determine content type based on file extension
  const isM3u8 = filename.endsWith('.m3u8');
  const contentType = isM3u8 ? 'application/vnd.apple.mpegurl' : 'video/mp2t';

  // For HEAD requests, just return headers
  if (req.method === 'HEAD') {
    res.writeHead(200, {
      'Content-Length': fileSize,
      'Content-Type': contentType,
      'Accept-Ranges': 'bytes',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-cache'
    });
    res.end();
    return;
  }

  // Handle range requests (for seeking in video)
  const range = req.headers.range;
  if (range) {
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': end - start + 1,
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*'
    });
    fs.createReadStream(filepath, { start, end }).pipe(res);
  } else {
    res.writeHead(200, {
      'Content-Length': fileSize,
      'Content-Type': contentType,
      'Accept-Ranges': 'bytes',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-cache'
    });
    fs.createReadStream(filepath).pipe(res);
  }
};

app.get('/uploads/:filename', videoHandler);
app.head('/uploads/:filename', videoHandler);

const IMEI = '864993060968006';
const PORT = 5000;

// Available video clips
const mockVideos = [
  '2026_05_22_08_30_00_03.ts',
  '2026_05_22_08_31_00_03.ts'
];

// API 1: Request video list (simulates device scan)
app.post(`/api/playback/request-list/${IMEI}`, (req, res) => {
  console.log('✅ Device scan requested');

  res.json({
    status: 'scanning',
    message: 'Device is scanning SD card...'
  });
});

// API 2: Get video list
app.get(`/api/playback/videos/${IMEI}`, (req, res) => {
  console.log('📹 Video list requested');

  res.json({
    videos: mockVideos
  });
});

// API 3: Start uploading a specific clip
app.post(`/api/playback/start/${IMEI}`, (req, res) => {
  const { videoName } = req.body;

  console.log(`⬆️ Starting upload: ${videoName}`);

  // Support both .ts and .m3u8 filenames
  const tsVersion = videoName.replace('.m3u8', '.ts');
  const m3u8Version = videoName.replace('.ts', '.m3u8');
  
  // Check if either version exists
  const fileExists = mockVideos.some(v => 
    v === tsVersion || v === videoName || v.replace('.ts', '.m3u8') === videoName
  );

  if (!fileExists) {
    return res.status(404).json({
      status: 'error',
      message: 'Video not found'
    });
  }

  res.json({
    status: 'uploading',
    videoName,
    videoUrl: `http://localhost:${PORT}/uploads/${videoName}`
  });
});

// Check if video file exists
mockVideos.forEach(videoName => {
  const filepath = path.join(__dirname, 'uploads', videoName);

  if (!fs.existsSync(filepath)) {
    console.warn(`⚠️ Video file not found: ${videoName}`);
  }
});

app.listen(PORT, () => {
  console.log(`\n🎬 Mock Device API Server running on http://localhost:${PORT}`);
  console.log(`📹 Available videos: ${mockVideos.length}`);
  mockVideos.forEach((v, i) => console.log(`  ${i + 1}. ${v}`));
  console.log(`📂 Upload folder: ${path.join(__dirname, 'uploads')}`);
});