import React from "react";
import { Button } from "@/components/ui/button";
import LottieDisplay from "./LottieDisplay";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, RotateCcw, RotateCw } from "lucide-react";
import { Checkbox } from "./ui/checkbox";
import { Animation } from "@lottiefiles/lottie-types";
import LottieMetadata from "./LottieMetadata";

type LottieAnimationViewerProps = {
  animationData: Animation;
}

const useLottieControls = (
  initialState = {
    isPlaying: true,
    loop: true,
    speed: 1,
    direction: 1 as 1 | -1,
  }
) => {
  const [controls, setControls] = React.useState(initialState);

  const togglePlay = () =>
    setControls((prev) => ({ ...prev, isPlaying: !prev.isPlaying }));
  const toggleLoop = () =>
    setControls((prev) => ({ ...prev, loop: !prev.loop }));
  const toggleDirection = () =>
    setControls((prev) => ({
      ...prev,
      direction: prev.direction === 1 ? -1 : 1,
    }));
  const setSpeed = (speed: number) =>
    setControls((prev) => ({ ...prev, speed }));

  return { controls, togglePlay, toggleLoop, toggleDirection, setSpeed };
};

const LottieAnimationViewer = ({ animationData }: LottieAnimationViewerProps) => {
  const { controls, togglePlay, toggleLoop, toggleDirection, setSpeed } = useLottieControls();

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h2 className="text-xl font-bold mb-2">Preview:</h2>
          <div className="bg-gray-100 p-4 rounded-lg">
            <LottieDisplay
              animationData={animationData}
              width={300}
              height={300}
              isPlaying={controls.isPlaying}
              loop={controls.loop}
              speed={controls.speed}
              direction={controls.direction}
            />
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold mb-2">Controls:</h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="loop"
                checked={controls.loop}
                onCheckedChange={toggleLoop}
              />
              <label htmlFor="loop">Loop</label>
            </div>
            <div className="flex items-center space-x-2">
              <Button onClick={togglePlay} variant="outline" size="icon">
                {controls.isPlaying ? <Pause size={16} /> : <Play size={16} />}
              </Button>
              <span>{controls.isPlaying ? "Playing" : "Paused"}</span>
            </div>
            <div className="space-y-2">
              <label htmlFor="speed">Speed</label>
              <Slider
                id="speed"
                min={0.1}
                max={3}
                step={0.1}
                value={[controls.speed]}
                onValueChange={(value) => setSpeed(value[0])}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Button onClick={toggleDirection} variant="outline" size="icon">
                {controls.direction === 1 ? <RotateCw size={16} /> : <RotateCcw size={16} />}
              </Button>
              <span>Direction: {controls.direction === 1 ? "Forward" : "Reverse"}</span>
            </div>
          </div>
        </div>

        <div className="col-span-full">
          <h2 className="text-xl font-bold mb-2">Animation Metadata:</h2>
          <LottieMetadata animationData={animationData} />
        </div>
      </div>
    </div>
  );
};

export default LottieAnimationViewer;