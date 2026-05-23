const express = require('express');

const cors = require('cors');

const path = require('path');

const fs = require('fs');

const app = express();

app.use(cors());

app.use(express.json());

const PORT = 5000;

const IMEI =
  '864993060968006';


// GET ACTUAL VIDEO LIST FROM UPLOADS FOLDER
function getActualVideos() {
  const uploadsDir = path.join(__dirname, 'uploads');
  try {
    const files = fs.readdirSync(uploadsDir)
      .filter(f => f.endsWith('.ts'))
      .sort();
    return files.length > 0 ? files : ['2026_05_22_08_00_00_02.ts'];
  } catch (err) {
    console.error('Error reading uploads:', err);
    return ['2026_05_22_08_00_00_02.ts'];
  }
}

const mockVideos = getActualVideos();


// SERVE UPLOADS FOLDER
app.use(
  '/videos',
  express.static(
    path.join(__dirname, 'uploads')
  )
);


// API 1
app.post(
  `/api/playback/request-list/${IMEI}`,
  (req, res) => {

    res.json({
      success: true,
      message: 'Video list ready',
    });

  }
);


// API 2
app.get(
  `/api/playback/videos/${IMEI}`,
  (req, res) => {

    res.json({
      success: true,
      videos: mockVideos,
    });

  }
);


// API 3
app.post(
  `/api/playback/start/${IMEI}`,
  (req, res) => {

    const { videoName } = req.body;

    console.log(
      'Playing:',
      videoName
    );

    res.json({

      success: true,

      videoName,

      videoUrl:
        `http://localhost:${PORT}/videos/${videoName}`,

    });

  }
);


app.listen(PORT, () => {

  console.log(
    `Mock server running:
http://localhost:${PORT}`
  );

});