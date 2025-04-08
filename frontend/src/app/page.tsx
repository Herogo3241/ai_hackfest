'use client';
import React, { useRef, useState } from 'react';
import PerlinMeshCanvas, { AudioControls } from './components/PerlinMesh';
import { Play, Pause, Volume2 } from 'lucide-react';

// Define mood types and their associated UI styles

type MoodType = 'calm' | 'energetic' | 'melancholic' | 'ethereal';

interface MoodTheme {
  bgColor: string;
  borderColor: string;
  controlsBg: string;
  buttonColor: string;
  sliderAccent: string;
  textColor: string;
}

const moodThemes: Record<MoodType, MoodTheme> = {
  ethereal: {
    bgColor: 'bg-indigo-950',
    borderColor: 'border-indigo-700',
    controlsBg: 'bg-indigo-900',
    buttonColor: 'bg-purple-600 hover:bg-purple-500',
    sliderAccent: 'accent-purple-400',
    textColor: 'text-indigo-50',
  },
  energetic: {
    bgColor: 'bg-orange-950',
    borderColor: 'border-orange-700',
    controlsBg: 'bg-orange-900',
    buttonColor: 'bg-red-600 hover:bg-red-500',
    sliderAccent: 'accent-red-400',
    textColor: 'text-orange-50',
  },
  calm: {
    bgColor: 'bg-teal-950',
    borderColor: 'border-teal-700',
    controlsBg: 'bg-teal-900',
    buttonColor: 'bg-blue-600 hover:bg-blue-500',
    sliderAccent: 'accent-blue-400',
    textColor: 'text-teal-50',
  },
  melancholic: {
    bgColor: 'bg-gray-950',
    borderColor: 'border-gray-800',
    controlsBg: 'bg-gray-900',
    buttonColor: 'bg-gray-600 hover:bg-gray-500',
    sliderAccent: 'accent-gray-400',
    textColor: 'text-gray-50',
  },
};

export default function App() {
  const audioRef = useRef<AudioControls>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentMood, setCurrentMood] = useState<MoodType>('ethereal');
  const theme = moodThemes[currentMood];

  const togglePlayPause = () => {
    if (!isPlaying) {
      audioRef.current?.play();
      setIsPlaying(true);
    } else {
      audioRef.current?.pause();
      setIsPlaying(false);
    }
  };

  const changeMood = (mood: MoodType) => {
    setCurrentMood(mood);
  };

  return (
    <div className={`min-h-screen flex flex-col items-center  ${theme.bgColor} ${theme.textColor}`}>
      <div className="w-full h-[80vh] rounded-lg mb-4 ">
        <PerlinMeshCanvas ref={audioRef} mood={currentMood} />
      </div>

      
      

      <div className={`mt-2 ${theme.controlsBg} p-4 rounded-xl shadow-lg flex items-center gap-6 border ${theme.borderColor} border-opacity-50`}>
      {/* Mood Selector */}
      <div>
        <select 
          value={currentMood}
          onChange={(e) => changeMood(e.target.value as MoodType)}
          className={`px-4 py-2 rounded-md capitalize cursor-pointer ${theme.controlsBg} ${theme.borderColor} border text-center appearance-none focus:outline-none focus:ring-2 focus:ring-white`}
          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'white\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', 
                   backgroundRepeat: 'no-repeat', 
                   backgroundPosition: 'right 0.75rem center',
                   backgroundSize: '1.2em 1.2em',
                   paddingRight: '2.5rem' }}
        >
          {(Object.keys(moodThemes) as MoodType[]).map((mood) => (
            <option key={mood} value={mood} className="capitalize">
              {mood}
            </option>
          ))}
        </select>
      </div>
        <button
          onClick={togglePlayPause}
          className={`${
            isPlaying ? 'bg-red-600 hover:bg-red-500' : theme.buttonColor
          } text-white p-3 rounded-full shadow-lg`}
        >
          {isPlaying ? <Pause size={20} /> : <Play size={20} />}
        </button>

        <div className="flex items-center gap-2">
          <Volume2 size={20} />
          <input
            type="range"
            min="0"
            max="100"
            defaultValue="50"
            className={`w-40 ${theme.sliderAccent}`}
            onChange={(e) =>
              audioRef.current?.setVolume(Number(e.target.value))
            }
          />
        </div>
      </div>
    </div>
  );
}