export function parseFilename(filename) {
  const parts = filename.replace('.ts', '').split('_');
  
  const year = parseInt(parts[0]);
  const month = parseInt(parts[1]);
  const day = parseInt(parts[2]);
  const hour = parseInt(parts[3]);
  const minute = parseInt(parts[4]);
  const second = parseInt(parts[5]);
  const channelCode = parts[6];

  return {
    filename,
    channelCode,
    camera: channelCode === '03' ? 'forward' : 'inward',
    timestamp: new Date(year, month - 1, day, hour, minute, second).getTime(),
  };
}

export function buildTimelineMap(videoList) {
  const map = {};

  videoList.forEach(filename => {
    const parsed = parseFilename(filename);
    const key = parsed.timestamp;

    if (!map[key]) {
      map[key] = {
        timestamp: key,
        forward: null,
        inward: null,
      };
    }

    map[key][parsed.camera] = filename;
  });

  return Object.values(map).sort((a, b) => a.timestamp - b.timestamp);
}