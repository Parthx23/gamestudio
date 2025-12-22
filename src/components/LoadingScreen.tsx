import { useEffect, useState } from "react";

const LoadingScreen = ({ onComplete }: { onComplete: () => void }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 500);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
      <div className="text-center">
        <svg width="120" height="120" viewBox="0 0 120 120" className="mb-8 mx-auto">
          <circle cx="60" cy="60" r="50" fill="#3b82f6" opacity="0.2" />
          <circle cx="60" cy="60" r="50" fill="none" stroke="#3b82f6" strokeWidth="4" strokeDasharray="314" strokeDashoffset={314 - (314 * progress) / 100} className="transition-all duration-300" transform="rotate(-90 60 60)" />
          
          {/* Controller Body */}
          <rect x="35" y="45" width="50" height="30" rx="15" fill="#fff" className="animate-pulse" />
          
          {/* D-Pad */}
          <rect x="42" y="52" width="8" height="2" fill="#000" />
          <rect x="45" y="49" width="2" height="8" fill="#000" />
          
          {/* Action Buttons */}
          <circle cx="70" cy="52" r="2" fill="#000" />
          <circle cx="75" cy="57" r="2" fill="#000" />
          
          {/* Analog Sticks */}
          <circle cx="45" cy="65" r="3" fill="#666" />
          <circle cx="70" cy="65" r="3" fill="#666" />
        </svg>
        <h1 className="text-4xl font-gaming font-bold text-white mb-8">MyGameStudio</h1>
        <div className="w-64 h-2 bg-gray-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-gray-400 mt-4">Loading... {Math.round(progress)}%</p>
      </div>
    </div>
  );
};

export default LoadingScreen;