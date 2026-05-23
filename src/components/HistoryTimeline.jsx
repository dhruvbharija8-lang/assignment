// components/HistoryTimeline.jsx

export default function HistoryTimeline({ clips, currentTimestamp, onSeek }) {
  if (!clips.length) return null;

  // Din ki shuruat (00:00) aur total duration calculate karo
  const dayStart = new Date(clips[0].timestamp);
  dayStart.setHours(0, 0, 0, 0);
  const dayStartMs = dayStart.getTime();
  const dayDurationMs = 24 * 60 * 60 * 1000; // 24 ghante milliseconds mein

  // Timestamp ko left percentage mein convert karo
  const toPercent = (ts) => ((ts - dayStartMs) / dayDurationMs) * 100;

  // User ne timeline pe click kiya
  const handleClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickRatio = (e.clientX - rect.left) / rect.width;
    const clickedTime = dayStartMs + clickRatio * dayDurationMs;

    // Clicked time ke sabse paas wali clip dhundo
    const nearestClip = clips.reduce((prev, curr) => {
      const prevDiff = Math.abs(prev.timestamp - clickedTime);
      const currDiff = Math.abs(curr.timestamp - clickedTime);
      return currDiff < prevDiff ? curr : prev;
    });

    onSeek(nearestClip.timestamp); // Parent ko batao
  };

  return (
    <div
      className="relative w-full h-16 bg-gray-900 rounded cursor-pointer select-none"
      onClick={handleClick}
    >
      {/* Time labels — 00:00, 03:00, 06:00 ... */}
      {[0, 3, 6, 9, 12, 15, 18, 21].map(hour => (
        <div
          key={hour}
          className="absolute top-1 text-xs text-gray-500"
          style={{ left: `${(hour / 24) * 100}%` }}
        >
          {hour.toString().padStart(2, '0')}:00
        </div>
      ))}

      {/* Forward cam clips — Blue bars */}
      {clips.filter(c => c.forward).map(clip => (
        <div
          key={`fwd-${clip.timestamp}`}
          className="absolute bg-blue-500 rounded"
          style={{
            left: `${toPercent(clip.timestamp)}%`,
            bottom: '28px',
            height: '10px',
            width: '0.8%',
          }}
        />
      ))}

      {/* Inward cam clips — Green bars */}
      {clips.filter(c => c.inward).map(clip => (
        <div
          key={`in-${clip.timestamp}`}
          className="absolute bg-green-500 rounded"
          style={{
            left: `${toPercent(clip.timestamp)}%`,
            bottom: '14px',
            height: '10px',
            width: '0.8%',
          }}
        />
      ))}

      {/* Red scrubber — current position */}
      {currentTimestamp && (
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10 pointer-events-none"
          style={{ left: `${toPercent(currentTimestamp)}%` }}
        />
      )}
    </div>
  );
}