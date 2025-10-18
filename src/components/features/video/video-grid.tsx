import React from 'react';
import VideoTile from './video-tile';
import { getOptimalGridLayout } from '../../../lib/optimize-grid';

interface VideoGridProps {
  videoTileData: Array<{
    hasHandRaised: boolean;
    hasVideoOn: boolean;
    name: string;
    isSpeaking: boolean;
    isMicOff: boolean;
  }>;
}

const DynamicVideoGrid: React.FC<VideoGridProps> = ({ videoTileData }) => {
  const { cols, rows } = getOptimalGridLayout(videoTileData.length);

  return (
    <div 
      className="w-full h-full p-3"
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gridTemplateRows: `repeat(${rows}, 1fr)`,
        gap: '10px',
      }}
    >
      {videoTileData.map(({ hasHandRaised, hasVideoOn, name, isSpeaking, isMicOff}, index) => (
        <VideoTile
          key={`${name}-${index}`}
          name={name}
          hasHandRaised={hasHandRaised}
          hasVideoOn={hasVideoOn}
          isSpeaking={isSpeaking}
          isMicOff={isMicOff}
        />
      ))}
    </div>
  );
};

export default DynamicVideoGrid;