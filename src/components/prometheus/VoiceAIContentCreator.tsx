import React, { useState, useRef } from 'react';
import { Mic, Play, Pause, Volume2, Download } from 'lucide-react';

interface VoiceSettings {
  voice: string;
  speed: number;
  pitch: number;
  volume: number;
}

const VoiceAIContentCreator: React.FC = () => {
  const [text, setText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const [settings, setSettings] = useState<VoiceSettings>({
    voice: 'female-1',
    speed: 1.0,
    pitch: 1.0,
    volume: 0.8
  });

  const voices = [
    { id: 'female-1', name: 'Emma (Female)', language: 'English' },
    { id: 'male-1', name: 'James (Male)', language: 'English' },
    { id: 'female-2', name: 'Sophie (Female)', language: 'English' },
    { id: 'male-2', name: 'Alex (Male)', language: 'English' }
  ];

  const generateVoice = async () => {
    if (!text.trim()) return;

    setIsGenerating(true);
    // Simulate voice generation
    setTimeout(() => {
      // Mock audio URL - in real app this would be actual TTS
      setAudioUrl('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO1fLNfCsFJXTH8N6UQQkUXrHp66lVFApGn+DyvmQdBzaO1fLNfCsFJXTH8N6UQQkUXrHp66lV');
      setIsGenerating(false);
    }, 3000);
  };

  const playPauseAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const downloadAudio = () => {
    if (audioUrl) {
      const a = document.createElement('a');
      a.href = audioUrl;
      a.download = `ai-voice-${Date.now()}.wav`;
      a.click();
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2 flex items-center">
          <Mic className="w-6 h-6 mr-2 text-red-500" />
          Voice AI Content Creator
        </h2>
        <p className="text-gray-600">
          Transform your marketing content into natural-sounding voiceovers using advanced AI text-to-speech.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Marketing Text to Convert
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter your marketing content here... e.g., 'Discover the revolutionary sound of Hardban Records Lab...'"
              className="w-full h-40 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
            />
            <p className="text-sm text-gray-500 mt-1">
              {text.length}/2000 characters
            </p>
          </div>

          {/* Voice Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Voice Settings</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Voice Selection
              </label>
              <select
                value={settings.voice}
                onChange={(e) => setSettings({...settings, voice: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                {voices.map((voice) => (
                  <option key={voice.id} value={voice.id}>
                    {voice.name} - {voice.language}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Speed: {settings.speed.toFixed(1)}x
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.1"
                  value={settings.speed}
                  onChange={(e) => setSettings({...settings, speed: parseFloat(e.target.value)})}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pitch: {settings.pitch.toFixed(1)}
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.1"
                  value={settings.pitch}
                  onChange={(e) => setSettings({...settings, pitch: parseFloat(e.target.value)})}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Volume: {Math.round(settings.volume * 100)}%
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.1"
                  value={settings.volume}
                  onChange={(e) => setSettings({...settings, volume: parseFloat(e.target.value)})}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          <button
            onClick={generateVoice}
            disabled={!text.trim() || isGenerating}
            className="w-full bg-red-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Generating Voice...
              </>
            ) : (
              <>
                <Mic className="w-5 h-5 mr-2" />
                Generate Voice
              </>
            )}
          </button>
        </div>

        {/* Output Section */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Generated Audio</h3>
            <div className="bg-gray-50 border rounded-lg p-6 min-h-[200px] flex flex-col items-center justify-center">
              {audioUrl ? (
                <div className="w-full space-y-4">
                  <audio
                    ref={audioRef}
                    src={audioUrl}
                    onEnded={() => setIsPlaying(false)}
                    className="w-full"
                  />
                  <div className="flex items-center justify-center space-x-4">
                    <button
                      onClick={playPauseAudio}
                      className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700"
                    >
                      {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                    </button>
                    <div className="flex items-center">
                      <Volume2 className="w-5 h-5 text-gray-600 mr-2" />
                      <span className="text-sm text-gray-600">Voice Preview</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <Mic className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-500">
                    {isGenerating ? 'Generating voice...' : 'Generated audio will appear here'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {audioUrl && (
            <button
              onClick={downloadAudio}
              className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 flex items-center justify-center"
            >
              <Download className="w-5 h-5 mr-2" />
              Download Audio File
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VoiceAIContentCreator;
