// components/VideoPlayer.jsx
import { useEffect, useRef } from 'react';
import Hls from 'hls.js';

export default function VideoPlayer({ src, onEnded, onTimeUpdate }) {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);

  useEffect(() => {
    if (!src || !videoRef.current) return;

    // Purana HLS instance destroy karo
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    // HLS.js for .m3u8 playlists
    if (src.includes('.m3u8') && Hls.isSupported()) {
      try {
        const hls = new Hls({
          debug: false,
          enableWorker: true,
          // Streaming options for large files
          maxBufferLength: 30,
          maxMaxBufferLength: 60,
          maxBufferSize: 60 * 1000 * 1000, // 60MB max buffer
          maxBufferHoleDuration: 30,
          // Force HLS codec detection
          defaultAudioCodec: 'aac',
          fragLoadPolicy: {
            default: {
              maxTimeToFirstByteMs: 8000,
              maxLoadTimeMs: 20000,
              timeoutRetry: {
                maxNumRetry: 4,
                retryDelayMs: 1000,
                maxRetryDelayMs: 8000,
              },
              errorRetry: {
                maxNumRetry: 4,
                retryDelayMs: 1000,
                maxRetryDelayMs: 8000,
              },
            },
          },
        });
        hlsRef.current = hls;
        
        hls.loadSource(src);
        hls.attachMedia(videoRef.current);
        
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          console.log('✅ Playlist loaded, attempting playback...');
          videoRef.current.play().catch(err => {
            console.warn('Autoplay prevented:', err.message);
          });
        });

        hls.on(Hls.Events.ERROR, (event, data) => {
          if (data.fatal) {
            console.error('Fatal HLS error:', data.type, data.details);
            // Try to recover or fallback
            switch(data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                console.log('Network error - attempting to recover...');
                hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                console.log('Media error - attempting to recover...');
                hls.recoverMediaError();
                break;
            }
          }
        });

        hls.on(Hls.Events.FRAG_LOADED, () => {
          console.log('Fragment loaded successfully');
        });
      } catch (err) {
        console.error('HLS initialization error:', err);
      }
    } else {
      // Fallback - try direct playback
      videoRef.current.src = src;
      videoRef.current.play().catch(err => {
        console.warn('Direct playback failed:', err.message);
      });
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [src]);

  return (
    <video
      ref={videoRef}
      className="w-full h-full bg-black"
      onEnded={onEnded}
      onTimeUpdate={onTimeUpdate}
      controls
      controlsList="nodownload"
      crossOrigin="anonymous"
      preload="metadata"
    />
  );
}