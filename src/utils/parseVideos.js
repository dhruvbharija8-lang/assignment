// utils/parseVideos.js

// Ek filename ko parse karta hai
export function parseFilename(filename) {
  // "2026_05_07_09_30_00_03.ts" ko tod ke parts banao
  const parts = filename.replace('.ts', '').split('_');
  
  const year   = parseInt(parts[0]);  // 2026
  const month  = parseInt(parts[1]);  // 05
  const day    = parseInt(parts[2]);  // 07
  const hour   = parseInt(parts[3]);  // 09
  const minute = parseInt(parts[4]);  // 30
  const second = parseInt(parts[5]);  // 00
  const channelCode = parts[6];       // "03" ya "04"

  return {
    filename,
    channelCode,
    camera: channelCode === '03' ? 'forward' : 'inward',
    // Unix timestamp banao — isse time comparison easy hoti hai
    timestamp: new Date(year, month - 1, day, hour, minute, second).getTime(),
  };
}

// Saari videos ko ek map mein organize karo
export function buildTimelineMap(videoList) {
  const map = {};

  videoList.forEach(filename => {
    const parsed = parseFilename(filename);
    const key = parsed.timestamp; // timestamp as key use karo

    if (!map[key]) {
      map[key] = {
        timestamp: key,
        forward: null,  // 03 channel
        inward: null,   // 04 channel
      };
    }

    // Forward ya Inward slot mein daalo
    map[key][parsed.camera] = filename;
  });

  // Sort karke array return karo (purani se nayi)
  return Object.values(map).sort((a, b) => a.timestamp - b.timestamp);
}