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
  stream?: MediaStream | null;
  isLocal?: boolean;
}

const VideoTile: React.FC<VideoTileProps> = ({
  name,
  hasHandRaised,
  isMicOff,
  hasVideoOn,
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
  }, [stream, hasVideoOn]);

  return (
    <div className="relative w-full h-full bg-gray-900 rounded-lg overflow-hidden border border-gray-600">
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
  aspectRatio?: "1/1" | "4/3" | "16/9";
}

const DynamicVideoGrid: React.FC<VideoGridProps> = ({ 
  videoTileData = [],
  aspectRatio = "16/9" 
}) => {
  const gridRef = useRef<HTMLDivElement>(null);
  const [gridLayout, setGridLayout] = React.useState({ cols: 1, rows: 1 });

  React.useEffect(() => {
    const calculateOptimalGrid = () => {
      if (!gridRef.current || videoTileData.length === 0) return;

      const container = gridRef.current;
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;
      const participantCount = videoTileData.length;

      // Aspect ratio values
      const ratioMap = {
        "1/1": 1,
        "4/3": 4/3,
        "16/9": 16/9
      };
      const tileAspect = ratioMap[aspectRatio];

      let bestLayout = { cols: 1, rows: 1, area: 0 };

      // Try different column configurations
      for (let cols = 1; cols <= participantCount; cols++) {
        const rows = Math.ceil(participantCount / cols);
        
        // Calculate tile dimensions that would fit
        const tileWidth = (containerWidth - (cols + 1) * 8) / cols; // 8px gap
        const tileHeight = (containerHeight - (rows + 1) * 8) / rows;
        
        // Check which dimension is the limiting factor
        let actualWidth, actualHeight;
        
        if (tileWidth / tileHeight > tileAspect) {
          // Height is limiting
          actualHeight = tileHeight;
          actualWidth = tileHeight * tileAspect;
        } else {
          // Width is limiting
          actualWidth = tileWidth;
          actualHeight = tileWidth / tileAspect;
        }
        
        // Calculate area and check if it fits
        const area = actualWidth * actualHeight;
        
        if (actualWidth > 0 && actualHeight > 0 && 
            actualWidth <= tileWidth && actualHeight <= tileHeight &&
            area > bestLayout.area) {
          bestLayout = { cols, rows, area };
        }
      }

      setGridLayout({ cols: bestLayout.cols, rows: bestLayout.rows });
    };

    calculateOptimalGrid();
    
    const resizeObserver = new ResizeObserver(calculateOptimalGrid);
    if (gridRef.current) {
      resizeObserver.observe(gridRef.current);
    }

    return () => resizeObserver.disconnect();
  }, [videoTileData.length, aspectRatio]);

  if (!videoTileData || videoTileData.length === 0) {
    return (
      <div className="w-full h-full flex flex-col justify-center items-center gap-3 text-white">
        <p className="font-semibold text-2xl">No participants yet</p>
      </div>
    );
  }

  return (
    <div
      ref={gridRef}
      className="w-full h-full p-2 grid place-items-center gap-2"
      style={{
        gridTemplateColumns: `repeat(${gridLayout.cols}, minmax(0, 1fr))`,
        gridTemplateRows: `repeat(${gridLayout.rows}, minmax(0, 1fr))`,
        gridAutoRows: 'minmax(0, 1fr)'
      }}
    >
      {videoTileData.map(({ name, hasHandRaised, hasVideoOn, isSpeaking, isMicOff, stream, isLocal }, index) => (
        <div
          key={`${name}-${index}`}
          className="w-full h-full"
          style={{
            aspectRatio: aspectRatio
          }}
        >
          <VideoTile
            name={name}
            hasHandRaised={hasHandRaised}
            hasVideoOn={hasVideoOn}
            isSpeaking={isSpeaking}
            isMicOff={isMicOff}
            stream={stream}
            isLocal={isLocal}
          />
        </div>
      ))}
    </div>
  );
};

export default DynamicVideoGrid;