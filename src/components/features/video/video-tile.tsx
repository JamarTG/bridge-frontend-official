import { getInitials } from "../../../lib/initial";
import { Hand, MicOff } from "lucide-react";
import { useState } from "react";
import { Card } from "../../ui/card";

interface VideoTileProps {
  name: string;
  hasHandRaised: boolean;
  isSpeaking: boolean;
  isMicOff: boolean;
  hasVideoOn: boolean;
}

const VideoTile: React.FC<VideoTileProps> = ({ isSpeaking, hasHandRaised, name, isMicOff }) => {
  const initials = getInitials(name);

  const [isT, setIsT] = useState(false);

  return (
    <Card className="cursor-pointer w-full h-full flex flex-col bg-gray-700 overflow-hidden border-2 border-accent relative">
      <div className="absolute top-2 left-2 right-2 flex justify-between items-start z-10">


        <div className="flex gap-2">
          {hasHandRaised && (
            <div className="text-gray-500 rounded-full  bg-white flex items-center p-1">
              <Hand className="w-4 h-4 text-green-400" />
            </div>
          )}

          {isMicOff && (
            <div className=" rounded-full  bg-orange-200 border border-white text-orange-500 flex items-center p-1">
              <MicOff className="w-4 h-4" />
            </div>
          )}
        </div>

      </div>

      <div className="flex-1 flex items-center justify-center p-2">
        <div className={`w-20 h-20 rounded-full bg-accent/20 border-2 flex items-center justify-center transition-all
    ${isT ? "border-4 border-green-400" : "border-accent"}`}>
          <span className="text-3xl font-bold text-accent">{initials}</span>
        </div>
      </div>

      {/* <Button variant={"outline"} onClick={() => setIsT(isT => !isT)}>Click to trigger speech {isT ? "speaking" : "not speaking"}</Button> */}

      <div className="p-2 absolute bottom-0 left-2 right-2">
        <p className="text-sm text-white font-medium truncate">{name}</p>
      </div>
    </Card>
  );
};

export default VideoTile;