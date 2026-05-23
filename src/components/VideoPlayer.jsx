'use client';

import {
  useEffect,
  useRef,
} from 'react';

export default function VideoPlayer({
  src,
  onEnded,
  onTimeUpdate,
}) {

  const videoRef = useRef(null);

  useEffect(() => {

    if (!src || !videoRef.current)
      return;

    const video = videoRef.current;

    video.pause();

    video.src = src;

    video.load();

    video.play()
      .catch((err) => {

        console.log(err);

      });

  }, [src]);

  return (

    <video
      ref={videoRef}
      className="
        w-full
        h-full
        object-contain
        bg-black
      "
      onEnded={onEnded}
      onTimeUpdate={onTimeUpdate}
      controls
      muted
      playsInline
      preload="auto"
    />

  );
}