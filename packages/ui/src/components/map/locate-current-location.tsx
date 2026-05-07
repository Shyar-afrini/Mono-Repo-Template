import { AnimatedButton } from "../buttons";
import { Locate } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../shadcn";

const LocateCurrentLocation = ({
  handleGetCurrentLocation,
  isGettingLocation,
  translations,
}: {
  handleGetCurrentLocation: () => void;
  isGettingLocation: boolean;
  translations: {
    locateCurrentLocation: string;
  };
}) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <AnimatedButton
          onClick={handleGetCurrentLocation}
          disabled={isGettingLocation}
          className="bg-zinc-800 hover:bg-zinc-700 disabled:bg-zinc-800 disabled:opacity-50 border border-zinc-700 rounded-lg p-3 transition-colors flex items-center justify-center"
        >
          <Locate
            size={20}
            className={`text-zinc-200 ${
              isGettingLocation ? "animate-pulse" : ""
            }`}
          />
        </AnimatedButton>
      </TooltipTrigger>
      <TooltipContent>{translations.locateCurrentLocation}</TooltipContent>
    </Tooltip>
  );
};

export default LocateCurrentLocation;
