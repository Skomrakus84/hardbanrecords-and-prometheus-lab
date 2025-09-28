import React, { useState, useRef, useEffect } from 'react';

interface AudioPlayerProps {
  src: string;
  title: string;
  artist: string;
  artwork?: string;
  autoPlay?: boolean;
  onEnded?: () => void;
  onTimeUpdate?: (currentTime: number) => void;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({
  src,
  title,
  artist,
  artwork,
  autoPlay = false,
  onEnded,
  onTimeUpdate
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedData = () => {
      setDuration(audio.duration);
      setIsLoading(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      onTimeUpdate?.(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      onEnded?.();
    };

    audio.addEventListener('loadeddata', handleLoadedData);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadeddata', handleLoadedData);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [onEnded, onTimeUpdate]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleProgressClick = (e: React.MouseEvent) => {
    const audio = audioRef.current;
    const progressBar = progressRef.current;
    if (!audio || !progressBar) return;

    const rect = progressBar.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * duration;

    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const volumeIcon = volume === 0 ? '🔇' : volume < 0.5 ? '🔉' : '🔊';

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden max-w-md mx-auto">
      <audio
        ref={audioRef}
        src={src}
        autoPlay={autoPlay}
        preload="metadata"
      />

      {/* Artwork & Info */}
      <div className="relative">
        <div className="w-full h-48 bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
          {artwork ? (
            <img
              src={artwork}
              alt={`${title} artwork`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-6xl text-white opacity-75">🎵</div>
          )}
        </div>

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-full p-3">
              <div className="animate-spin w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full"></div>
            </div>
          </div>
        )}
      </div>

      {/* Track Info */}
      <div className="p-4 text-center">
        <h3 className="font-bold text-lg text-gray-900 truncate">{title}</h3>
        <p className="text-gray-600 truncate">{artist}</p>
      </div>

      {/* Progress Bar */}
      <div className="px-4 pb-2">
        <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>

        <div
          ref={progressRef}
          onClick={handleProgressClick}
          className="w-full h-2 bg-gray-200 rounded-full cursor-pointer relative overflow-hidden"
        >
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-100"
            style={{ width: `${progressPercent}%` }}
          />

          {/* Progress Thumb */}
          <div
            className="absolute top-1/2 transform -translate-y-1/2 w-4 h-4 bg-white border-2 border-indigo-500 rounded-full shadow-md transition-all duration-100"
            style={{ left: `calc(${progressPercent}% - 8px)` }}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="px-4 pb-4">
        <div className="flex items-center justify-center space-x-4">
          {/* Previous Track */}
          <button className="p-2 text-gray-600 hover:text-gray-900 transition-colors">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8.445 14.832A1 1 0 0010 14v-2.798l5.445 3.63A1 1 0 0017 14V6a1 1 0 00-1.555-.832L10 8.798V6a1 1 0 00-1.555-.832l-6 4a1 1 0 000 1.664l6 4z"/>
            </svg>
          </button>

          {/* Play/Pause */}
          <button
            onClick={togglePlay}
            disabled={isLoading}
            className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 text-white rounded-full flex items-center justify-center transition-all hover:scale-105"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : isPlaying ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"/>
              </svg>
            ) : (
              <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"/>
              </svg>
            )}
          </button>

          {/* Next Track */}
          <button className="p-2 text-gray-600 hover:text-gray-900 transition-colors">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832L10 11.202V14a1 1 0 001.555.832l6-4a1 1 0 000-1.664l-6-4A1 1 0 0010 6v2.798l-5.445-3.63z"/>
            </svg>
          </button>
        </div>

        {/* Volume Control */}
        <div className="flex items-center justify-center mt-4 space-x-3">
          <button
            onClick={() => setShowVolumeSlider(!showVolumeSlider)}
            className="p-1 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <span className="text-lg">{volumeIcon}</span>
          </button>

          {showVolumeSlider && (
            <div className="flex items-center space-x-2">
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={handleVolumeChange}
                className="w-20 h-1 bg-gray-200 rounded-full appearance-none cursor-pointer slider"
              />
              <span className="text-xs text-gray-500 w-8">
                {Math.round(volume * 100)}%
              </span>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: linear-gradient(to right, #6366f1, #8b5cf6);
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }

        .slider::-moz-range-thumb {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: linear-gradient(to right, #6366f1, #8b5cf6);
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
      `}</style>
    </div>
  );
};

export default AudioPlayer;
