'use client';

import { useState, useEffect, useCallback } from 'react';
import { buildTimelineMap } from '@/utils/parseVideos';
import { requestVideoList, getVideoList, requestClipAndWait } from '@/utils/api';
import HistoryTimeline from '@/components/HistoryTimeline';
import VideoPlayer from '@/components/VideoPlayer';

export default function HomePage() {
  const [clips, setClips] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentTimestamp, setCurrentTimestamp] = useState(null);

  // Load videos on page load
  useEffect(() => {
    async function loadVideos() {
      setLoading(true);
      try {
        await requestVideoList();
        const data = await getVideoList();
        const timeline = buildTimelineMap(data.videos);
        setClips(timeline);
        if (timeline.length > 0) {
          setCurrentIndex(0);
        }
      } catch (err) {
        setError(`Failed to load videos: ${err.message}`);
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadVideos();
  }, []);

  // Play a clip at the given index
  const playClipAtIndex = useCallback(async (index) => {
    if (index < 0 || index >= clips.length) return;

    setLoading(true);
    setError(null);
    setCurrentIndex(index);

    try {
      const clip = clips[index];
      const filename = clip.forward || clip.inward;
      const url = await requestClipAndWait(filename);
      setVideoUrl(url);

      // Prefetch next clip in background
      if (index + 1 < clips.length) {
        const nextFilename = clips[index + 1].forward || clips[index + 1].inward;
        requestClipAndWait(nextFilename).catch(() => {
          // Silently ignore prefetch errors
        });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [clips]);

  // Current clip ends → play next clip
  const handleEnded = useCallback(() => {
    if (currentIndex !== null && currentIndex + 1 < clips.length) {
      playClipAtIndex(currentIndex + 1);
    }
  }, [currentIndex, clips, playClipAtIndex]);

  // Timeline click → seek to that time
  const handleSeek = useCallback((timestamp) => {
    const index = clips.findIndex(
      (c, i) =>
        c.timestamp <= timestamp &&
        (i === clips.length - 1 || clips[i + 1].timestamp > timestamp)
    );
    if (index !== -1) playClipAtIndex(index);
  }, [clips, playClipAtIndex]);

  // Update scrubber position
  const handleTimeUpdate = useCallback((e) => {
    if (currentIndex !== null && clips[currentIndex]) {
      const offsetMs = e.target.currentTime * 1000;
      setCurrentTimestamp(clips[currentIndex].timestamp + offsetMs);
    }
  }, [currentIndex, clips]);

  return (
    <div className="flex flex-col h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 p-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold mb-2">Video Playback Test</h1>
          <p className="text-gray-400 text-sm">
            {clips.length > 0 
              ? `${clips.length} clips loaded • Click timeline to play` 
              : 'Loading videos from device...'}
          </p>
        </div>
      </div>

      {/* Video Player Area */}
      <div className="flex-1 relative bg-black overflow-hidden">
        {/* Loading Spinner */}
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-10">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-gray-300">Loading video...</p>
            <p className="text-gray-500 text-sm">Please wait (10-30 seconds)</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-950/20 z-10">
            <div className="bg-red-900/50 border border-red-500 rounded p-4 max-w-md">
              <p className="text-red-300 font-semibold mb-2">⚠️ Error</p>
              <p className="text-red-200 text-sm">{error}</p>
              <button
                onClick={() => setError(null)}
                className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-sm transition"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Video Player */}
        {videoUrl && !loading && (
          <VideoPlayer
            src={videoUrl}
            onEnded={handleEnded}
            onTimeUpdate={handleTimeUpdate}
          />
        )}

        {/* Placeholder */}
        {!videoUrl && !loading && !error && clips.length > 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <p className="text-lg mb-2">Click a clip in the timeline below to play</p>
              <p className="text-sm text-gray-600">Or click the play button to start</p>
            </div>
          </div>
        )}

        {!videoUrl && !loading && !error && clips.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-500">
            <p>No videos found</p>
          </div>
        )}
      </div>

      {/* Timeline & Controls */}
      <div className="bg-gray-900 border-t border-gray-800 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-semibold text-gray-300">HISTORY TIMELINE</h3>
            {currentIndex !== null && clips.length > 0 && (
              <span className="text-xs text-gray-400">
                Clip {currentIndex + 1} of {clips.length}
              </span>
            )}
          </div>

          {/* Timeline */}
          {clips.length > 0 ? (
            <HistoryTimeline
              clips={clips}
              currentTimestamp={currentTimestamp}
              onSeek={handleSeek}
            />
          ) : (
            <div className="h-16 bg-gray-800 rounded flex items-center justify-center text-gray-500 text-sm">
              {loading ? 'Loading videos...' : 'No videos available'}
            </div>
          )}

          {/* Legend */}
          <div className="flex gap-4 mt-3 text-xs text-gray-400">
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 bg-blue-500 rounded" />
              Forward Camera
            </span>
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 bg-green-500 rounded" />
              Inward Camera
            </span>
            <span className="flex items-center gap-2">
              <span className="w-1 h-3 bg-red-500" />
              Current Position
            </span>
          </div>

          {/* Test Controls */}
          {clips.length > 0 && (
            <div className="flex gap-2 mt-4 flex-wrap">
              <button
                onClick={() => playClipAtIndex(0)}
                disabled={loading}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded text-sm transition"
              >
                ▶ Play First
              </button>
              <button
                onClick={() => currentIndex !== null && playClipAtIndex(Math.max(0, currentIndex - 1))}
                disabled={loading || currentIndex === 0}
                className="px-3 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 rounded text-sm transition"
              >
                ⏮ Previous
              </button>
              <button
                onClick={() => currentIndex !== null && playClipAtIndex(Math.min(clips.length - 1, currentIndex + 1))}
                disabled={loading || currentIndex === clips.length - 1}
                className="px-3 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 rounded text-sm transition"
              >
                ⏭ Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}