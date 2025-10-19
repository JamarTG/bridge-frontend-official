import React, { useEffect, useRef } from 'react';
import { Hand, MicOff } from 'lucide-react';

const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

interface VideoTileProps {
  name: string;
  hasHandRaised: boolean;
  isMicOff: boolean;
  hasVideoOn: boolean;
  isSpeaking: boolean;
  cols: number;
  aspectRatio: string;
  stream?: MediaStream | null;
  isLocal?: boolean;
}

const VideoTile: React.FC<VideoTileProps> = ({ 
  name, 
  hasHandRaised, 
  isMicOff, 
  hasVideoOn,
  cols, 
  aspectRatio,
  stream,
  isLocal = false
}) => {
  const initials = getInitials(name);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(err => {
        console.error('Error playing video:', err);
      });
    }
  }, [stream]);

  return (
    <div 
      className="cursor-pointer flex flex-col bg-gray-900 overflow-hidden border border-gray-600 relative rounded-lg"
      style={{
        aspectRatio: aspectRatio,
        flex: `1 1 calc((100% - ${(cols - 1) * 4}px) / ${cols})`,
        maxWidth: `calc((100% - ${(cols - 1) * 4}px) / ${cols})`,
      }}
    >
      {/* Top icons */}
      <div className="absolute top-1 left-1 right-1 flex justify-start items-start z-10 gap-1">
        {hasHandRaised && (
          <div className="text-gray-500 rounded-full bg-white flex items-center p-0.5">
            <Hand className="w-3 h-3 text-green-400" />
          </div>
        )}
        {isMicOff && (
          <div className="rounded-full bg-orange-200 border border-white text-orange-500 flex items-center p-0.5">
            <MicOff className="w-3 h-3" />
          </div>
        )}
      </div>

      {/* Video element or placeholder */}
      {hasVideoOn && stream ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal}
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
          <div className="w-14 h-14 rounded-full bg-purple-900/30 border border-purple-500 flex items-center justify-center">
            <span className="text-2xl font-bold text-purple-400">{initials}</span>
          </div>
        </div>
      )}

      {/* Bottom name bar */}
      <div className="absolute bottom-0 left-0 right-0 py-1 px-2 bg-black/70 z-10">
        <p className="text-xs text-white font-medium truncate">{name}</p>
      </div>
    </div>
  );
};

interface VideoGridProps {
  videoTileData: Array<{
    name: string;
    hasHandRaised: boolean;
    hasVideoOn: boolean;
    isSpeaking: boolean;
    isMicOff: boolean;
    stream?: MediaStream | null;
    isLocal?: boolean;
  }>;
}

const DynamicVideoGrid: React.FC<VideoGridProps> = ({ videoTileData }) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [cols, setCols] = React.useState(Math.ceil(Math.sqrt(videoTileData.length)));

  React.useEffect(() => {
    const calculateOptimalCols = () => {
      if (!containerRef.current) return;
      
      const container = containerRef.current;
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;
      const count = videoTileData.length;
      
      if (count === 0) return;
      
      let bestCols = Math.ceil(Math.sqrt(count));
      let bestScore = 0;
      
      for (let testCols = 1; testCols <= count && testCols <= 6; testCols++) {
        const rows = Math.ceil(count / testCols);
        const tileWidth = containerWidth / testCols;
        const tileHeight = tileWidth / (16 / 9);
        const totalHeight = tileHeight * rows;
        
        if (totalHeight <= containerHeight) {
          const score = totalHeight / containerHeight;
          if (score > bestScore) {
            bestScore = score;
            bestCols = testCols;
          }
        }
      }
      
      setCols(bestCols);
    };
    
    calculateOptimalCols();
    window.addEventListener('resize', calculateOptimalCols);
    return () => window.removeEventListener('resize', calculateOptimalCols);
  }, [videoTileData.length]);

  

  const aspectRatio = "16/9";

  return (
    <div
      ref={containerRef}
      className="flex justify-center items-center relative gap-1 w-full p-5  flex-wrap place-items-center transition-all ease-in-out duration-200"
      style={{
        maxWidth: "100vw",
        height: "calc(100vh - 15rem)",
        alignContent: "center",
      }}
    >
      {videoTileData.map(({ name, hasHandRaised, hasVideoOn, isSpeaking, isMicOff, stream, isLocal }, index) => (
        <VideoTile
          key={`${name}-${index}`}
          name={name}
          hasHandRaised={hasHandRaised}
          hasVideoOn={hasVideoOn}
          isSpeaking={isSpeaking}
          isMicOff={isMicOff}
          cols={cols}
          aspectRatio={aspectRatio}
          stream={stream}
          isLocal={isLocal}
        />
      ))}
    </div>
  );
};

export default DynamicVideoGrid;