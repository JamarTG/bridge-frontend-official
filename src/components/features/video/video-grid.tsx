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
  rows: number;
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
  // rows,
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
  }, [stream, hasVideoOn]);

  return (
    <div
      className="cursor-pointer flex flex-col bg-gray-900 overflow-hidden border border-gray-600 relative rounded-lg"
      style={{
        aspectRatio: aspectRatio,
        flex: `1 1 calc((100% - ${(cols - 1) * 4}px) / ${cols})`,
        maxWidth: `calc((100% - ${(cols - 1) * 4}px) / ${cols})`,
        minWidth: 0,
      }}
    >
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
  const videoSpaceRef = useRef<HTMLDivElement>(null);

  const gridStyle = React.useMemo(() => {
    const ratio = aspectRatio === "1/1" ? 1 : aspectRatio === "4/3" ? 4/3 : 16/9;
    return {
      display: "grid",
      gridTemplateColumns: `repeat(auto-fit, minmax(${Math.floor(160)}px, 1fr))`,
      gridAutoRows: `minmax(${Math.floor(160 / ratio)}px, 1fr)`,
      gap: "4px",
      width: "100%",
      height: "100%",
    };
  }, [aspectRatio]);

  return (
    <div ref={videoSpaceRef} style={gridStyle}>
      {videoTileData && videoTileData.length > 0 ? (
        videoTileData.map(({ name, hasHandRaised, hasVideoOn, isSpeaking, isMicOff, stream, isLocal }, index) => (
          <VideoTile
            key={`${name}-${index}`}
            name={name}
            hasHandRaised={hasHandRaised}
            hasVideoOn={hasVideoOn}
            isSpeaking={isSpeaking}
            isMicOff={isMicOff}
            cols={0} // not needed
            rows={0} // not needed
            aspectRatio={aspectRatio}
            stream={stream}
            isLocal={isLocal}
          />
        ))
      ) : (
        <div className="flex flex-col justify-center items-center gap-3 text-white">
          <p className="font-semibold text-2xl">No participants yet</p>
        </div>
      )}
    </div>
  );
};

export default DynamicVideoGrid;