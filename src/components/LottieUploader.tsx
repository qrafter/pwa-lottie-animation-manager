import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import LottieDisplay from "./LottieDisplay";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, RotateCcw, RotateCw } from "lucide-react";
import { Checkbox } from "./ui/checkbox";
import { useUserAnimationsStore } from "@/stores/userAnimationStore";
import { Animation, Layer } from "@lottiefiles/lottie-types";
import { Input } from "./ui/input";
import LottieMetadata from "./LottieMetadata";

type LottieUploaderProps = {
  initialAnimationData?: Animation;
};

const useLottieControls = (
  initialState = {
    isPlaying: true,
    loop: true,
    speed: 1,
    direction: 1 as 1 | -1,
  }
) => {
  const [controls, setControls] = useState(initialState);

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

const useAnimationData = (initialData?: Animation | null) => {
  const [animationData, setAnimationData] = useState<Animation | null>(
    initialData || null
  );
  const [layers, setLayers] = useState<Layer.Value[]>([]);
  const [animationName, setAnimationName] = useState("");

  useEffect(() => {
    if (initialData) {
      setAnimationData(initialData);
      setLayers(initialData.layers || []);
    }
  }, [initialData]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const json = JSON.parse(e.target?.result as string);
          setAnimationData(json);
          setLayers(json.layers || []);
          setAnimationName(json.nm || file.name.replace(".json", ""));
        } catch (error) {
          console.error("Error parsing JSON:", error);
          alert("Invalid JSON file");
        }
      };
      reader.readAsText(file);
    }
  };

  return {
    animationData,
    layers,
    animationName,
    setAnimationName,
    handleFileUpload,
  };
};

const LottieUploader: React.FC<LottieUploaderProps> = () => {
  const { uploadedAnimation, setUploadedAnimation } = useUserAnimationsStore();
  const { animationData, animationName, setAnimationName, handleFileUpload } =
    useAnimationData(uploadedAnimation);
  const { controls, togglePlay, toggleLoop, toggleDirection, setSpeed } =
    useLottieControls();
  const { addAnimation } = useUserAnimationsStore();

  useEffect(() => {
    return () => {
      setUploadedAnimation(null);
    };
  }, [setUploadedAnimation]);

  const handleSaveAnimation = async () => {
    // if (!user || !animationData) {
    //   alert(
    //     user
    //       ? "No animation data to save."
    //       : "Please log in to save animations."
    //   );
    //   return;
    // }
    if (!animationData) {
      alert("No animation data to save.");
      return;
    }

    if (!animationName.trim()) {
      alert("Please provide a name for the animation.");
      return;
    }

    try {
      // TODO: Update userId
      await addAnimation("1", animationName, {
        name: animationName.trim(),
        jsonContent: animationData,
        _status: "created",
      });
      alert("Animation saved successfully!");
    } catch (error: unknown) {
      alert((error as Error)?.message || "Failed to save animation");
    }
  };

  return (
    <div className="space-y-4">
      {animationData && (
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
            <div className="mb-4">
              <label
                htmlFor="animation-name"
                className="block text-gray-700 text-xl font-bold mb-2"
              >
                Animation Name:
              </label>
              <Input
                tabIndex={1}
                type="text"
                id="animation-name"
                value={animationName}
                onChange={(e) => setAnimationName(e.target.value)}
                placeholder="Enter animation name"
                className="w-full"
              />
            </div>

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
                  {controls.isPlaying ? (
                    <Pause size={16} />
                  ) : (
                    <Play size={16} />
                  )}
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
                  {controls.direction === 1 ? (
                    <RotateCw size={16} />
                  ) : (
                    <RotateCcw size={16} />
                  )}
                </Button>
                <span>
                  Direction: {controls.direction === 1 ? "Forward" : "Reverse"}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 max-w-md">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="lottie-upload"
                />
                {animationData && (
                  <Button onClick={handleSaveAnimation}>Save Animation</Button>
                )}
              </div>
            </div>
          </div>

          <div className="col-span-full">
            <h2 className="text-xl font-bold mb-2">Animation Metadata:</h2>
            <LottieMetadata animationData={animationData} />
          </div>
        </div>
      )}
    </div>
  );
};

export default LottieUploader;
