'use client';
import React, {
  useRef,
  useEffect,
  useState,
  useImperativeHandle,
  forwardRef,
  useMemo,
} from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { createNoise3D } from 'simplex-noise';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';


const simplex = createNoise3D();

// Define different pattern types based on mood
type MoodType = 'calm' | 'energetic' | 'melancholic' | 'ethereal';

interface WavyMeshProps {
  audioData: number;
  mood: MoodType;
}

function WavyMesh({ audioData, mood = 'calm' }: WavyMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const timeRef = useRef(0);
  
  // Different grid resolutions based on mood
  const gridResolution = useMemo(() => {
  switch(mood) {
    case 'calm': return [80, 80];        // Medium detail
    case 'energetic': return [120, 120]; // High detail
    case 'melancholic': return [60, 60]; // Low detail
    case 'ethereal': return [100, 100];  // Medium-high detail
    default: return [80, 80];
  }
}, [mood]);
  
  const planeGeometry = useMemo(() => 
    new THREE.PlaneGeometry(100, 100, gridResolution[0], gridResolution[1]), 
  [gridResolution]);
  
  // Color schemes based on mood
  const colorScheme = useMemo(() => {
    switch(mood) {
      case 'calm': return '#3498db';
      case 'energetic': return '#ff4757';
      case 'melancholic': return '#9b59b6';
      case 'ethereal': return '#26de81';
      default: return '#3498db';
    }
  }, [mood]);

  useFrame(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const time = timeRef.current;
    const position = mesh.geometry.attributes.position;
    
    // Pattern parameters based on mood
    const patternConfig = (() => {
      const baseAmplitude = 0.3 + (audioData / 255) * 1.5;
      
      switch(mood) {
        case 'calm':
          return {
            waveHeight: baseAmplitude * 0.8,
            frequency: 0.08,
            speedFactor: 0.005
          };
        case 'energetic':
          return {
            waveHeight: baseAmplitude * 1.2,
            frequency: 0.15,
            speedFactor: 0.02
          };
        case 'melancholic':
          return {
            waveHeight: baseAmplitude,
            frequency: 0.08,
            speedFactor: 0.003
          };
        case 'ethereal':
          return {
            waveHeight: baseAmplitude,
            frequency: 0.1,
            speedFactor: 0.01
          };
        default:
          return {
            waveHeight: baseAmplitude,
            frequency: 0.1,
            speedFactor: 0.01
          };
      }
    })();

    // Apply different pattern algorithms based on mood
    for (let i = 0; i < position.count; i++) {
      const x = position.getX(i);
      const y = position.getY(i);
      let z = 0;
      
      switch(mood) {
        case 'calm':
          // Gentle rolling waves
          z = simplex(x * patternConfig.frequency, y * patternConfig.frequency, time) 
              * patternConfig.waveHeight;
          break;
        
        case 'energetic':
          // Sharp, dynamic peaks with interference patterns
          z = simplex(x * patternConfig.frequency, y * patternConfig.frequency, time) 
              * patternConfig.waveHeight;
          z += simplex(x * patternConfig.frequency * 2, y * patternConfig.frequency * 2, time * 1.5) 
              * (patternConfig.waveHeight * 0.4);
          break;
        
        case 'melancholic':
          // Slow, deep waves with gentle undulations
          z = simplex(x * patternConfig.frequency, y * patternConfig.frequency, time) 
              * patternConfig.waveHeight;
          z *= Math.sin(x * 0.02 + time * 0.5) * 0.5 + 0.5;
          break;
        
        case 'ethereal':
          // Complex layered patterns with phase shifts
          z = simplex(x * patternConfig.frequency, y * patternConfig.frequency, time) 
              * patternConfig.waveHeight;
          z += simplex(x * patternConfig.frequency * 0.5, y * patternConfig.frequency * 0.5, time * 0.7) 
              * (patternConfig.waveHeight * 0.5);
          break;
          
        default:
          z = simplex(x * patternConfig.frequency, y * patternConfig.frequency, time) 
              * patternConfig.waveHeight;
      }
      
      position.setZ(i, z);
    }

    position.needsUpdate = true;
    mesh.geometry.computeVertexNormals();
    timeRef.current += patternConfig.speedFactor * (1 + audioData / 255);
  });

  return (
    <mesh ref={meshRef} geometry={planeGeometry} rotation-x={-Math.PI / 2}>
      <meshBasicMaterial 
        color={colorScheme}
        wireframe={true}
      />
      
      </mesh>
    );
  }

export interface AudioControls {
  play: () => void;
  pause: () => void;
  setVolume: (volume: number) => void;
}

interface PerlinMeshCanvasProps {
  mood?: MoodType;
}

const PerlinMeshCanvas = forwardRef<AudioControls, PerlinMeshCanvasProps>(({ mood = 'calm' }, ref) => {
  const [audioData, setAudioData] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const contextRef = useRef<AudioContext | null>(null);

  useImperativeHandle(ref, () => ({
    play: () => {
      if (contextRef.current?.state === 'suspended') {
        contextRef.current.resume();
      }
      audioRef.current?.play();
    },
    pause: () => {
      audioRef.current?.pause();
    },
    setVolume: (volume: number) => {
      if (audioRef.current) {
        audioRef.current.volume = volume / 100;
      }
    },
  }));

  useEffect(() => {
    const audio = new Audio('/music.mp3');
    audio.loop = true;
    audioRef.current = audio;

    const context = new AudioContext();
    contextRef.current = context;

    const source = context.createMediaElementSource(audio);
    const analyser = context.createAnalyser();
    analyser.fftSize = 128; // Increased for better frequency resolution

    source.connect(analyser);
    analyser.connect(context.destination);
    analyserRef.current = analyser;

    const buffer = new Uint8Array(analyser.frequencyBinCount);

    const updateAudioData = () => {
      if (analyserRef.current) {
        analyserRef.current.getByteFrequencyData(buffer);
        const avg = buffer.reduce((a, b) => a + b, 0) / buffer.length;
        setAudioData(avg);
      }
      requestAnimationFrame(updateAudioData);
    };

    updateAudioData();
  }, []);

  // Background color based on mood
  const backgroundColor = useMemo(() => {
    switch(mood) {
      case 'calm': return '#08192d';
      case 'energetic': return '#1a0808';
      case 'melancholic': return '#16081a';
      case 'ethereal': return '#081a0d';
      default: return '#08192d';
    }
  }, [mood]);

  return (
    <Canvas>
      <color attach="background" args={[backgroundColor]} />
      
      <PerspectiveCamera makeDefault position={[0, 15, 25]} fov={50} />
      
      {/* Minimalistic lighting setup */}
      <ambientLight intensity={0.5} />
      <pointLight position={[0, 20, 0]} intensity={0.8} />
      
      <WavyMesh audioData={audioData} mood={mood} />
      
      <OrbitControls 
        minDistance={10} 
        maxDistance={80}
        // maxPolarAngle={Math.PI / 2.2} 
      />
    </Canvas>
  );
});

PerlinMeshCanvas.displayName = 'PerlinMeshCanvas';

export default PerlinMeshCanvas;