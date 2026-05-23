'use client';

import {
  useState,
  useRef,
  useEffect,
} from 'react';

const clips = [

  {
    id: 1,
    time: '08:00',
    src: '/videos/sample.mp4',
  },

  {
    id: 2,
    time: '08:03',
    src: '/videos/sample.mp4',
  },

  {
    id: 3,
    time: '08:06',
    src: '/videos/sample.mp4',
  },

  {
    id: 4,
    time: '08:09',
    src: '/videos/sample.mp4',
  },

];

export default function Home() {

  const videoRef =
    useRef(null);

  const [currentClip,
    setCurrentClip] =
    useState(0);

  const [progress,
    setProgress] =
    useState(0);


  // AUTOPLAY NEXT
  const handleEnded = () => {

    if (
      currentClip <
      clips.length - 1
    ) {

      setCurrentClip(
        prev => prev + 1
      );
    }
  };


  // PLAY VIDEO
  useEffect(() => {

    const video =
      videoRef.current;

    if (!video) return;

    video.load();

    video.play()
      .catch(console.log);

  }, [currentClip]);


  // SCRUBBER
  useEffect(() => {

    const interval =
      setInterval(() => {

        const video =
          videoRef.current;

        if (
          video &&
          video.duration
        ) {

          setProgress(
            (
              video.currentTime /
              video.duration
            ) * 100
          );
        }

      }, 300);

    return () =>
      clearInterval(interval);

  }, []);


  return (

    <div className="
      min-h-screen
      bg-black
      text-white
      flex
      flex-col
    ">

      {/* HEADER */}

      <div className="
        p-5
        border-b
        border-gray-800
      ">

        <h1 className="
          text-2xl
          font-bold
          text-blue-400
        ">
          okDriver DVR Playback
        </h1>

        <p className="
          text-gray-500
          text-sm
          mt-1
        ">
          Continuous Timeline Playback
        </p>

      </div>


      {/* VIDEO */}

      <div className="
        flex-1
        bg-black
        flex
        items-center
        justify-center
        p-6
      ">

        <video
          ref={videoRef}
          controls
          muted
          onEnded={handleEnded}
          className="
            w-full
            max-w-5xl
            rounded-xl
            bg-black
          "
        >

          <source
            src={
              clips[currentClip].src
            }
            type="video/mp4"
          />

        </video>

      </div>


      {/* TIMELINE */}

      <div className="
        bg-gray-900
        p-5
      ">

        <div className="
          mb-3
          text-sm
          text-gray-400
        ">
          History Timeline
        </div>

        <div className="
          relative
          flex
          gap-2
        ">

          {clips.map(
            (clip, index) => (

            <div
              key={clip.id}

              onClick={() =>
                setCurrentClip(index)
              }

              className={`
                flex-1
                h-12
                rounded
                cursor-pointer
                transition-all
                ${
                  currentClip === index
                    ? 'bg-blue-500'
                    : 'bg-blue-800'
                }
              `}
            />

          ))}

          {/* RED SCRUBBER */}

          <div
            className="
              absolute
              top-0
              bottom-0
              w-1
              bg-red-500
            "
            style={{
              left:
                `${progress}%`,
            }}
          />

        </div>


        {/* TIME LABELS */}

        <div className="
          flex
          justify-between
          mt-2
          text-xs
          text-gray-500
        ">

          {clips.map(clip => (

            <span key={clip.id}>
              {clip.time}
            </span>

          ))}

        </div>


        {/* BUTTONS */}

        <div className="
          flex
          gap-2
          mt-5
        ">

          <button
            onClick={() =>
              setCurrentClip(0)
            }
            className="
              px-4
              py-2
              bg-blue-700
              rounded
            "
          >
            ▶ Play
          </button>

          <button
            onClick={() =>
              setCurrentClip(
                prev =>
                  Math.max(
                    0,
                    prev - 1
                  )
              )
            }
            className="
              px-4
              py-2
              bg-gray-700
              rounded
            "
          >
            ⏮ Prev
          </button>

          <button
            onClick={() =>
              setCurrentClip(
                prev =>
                  Math.min(
                    clips.length - 1,
                    prev + 1
                  )
              )
            }
            className="
              px-4
              py-2
              bg-gray-700
              rounded
            "
          >
            ⏭ Next
          </button>

        </div>

      </div>

    </div>

  );
}