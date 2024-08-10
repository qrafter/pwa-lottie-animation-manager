import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useUserAnimationsStore } from "@/stores/userAnimationStore";
import { Animation } from "@lottiefiles/lottie-types";
import { Input } from "@/components/ui/input";
import LottieAnimationViewer from "@/components/LottieAnimationViewer";

type LottieUploaderProps = {
  initialAnimationData?: Animation;
};

const LottieUploader: React.FC<LottieUploaderProps> = () => {
  const { uploadedAnimation, setUploadedAnimation, addAnimation } = useUserAnimationsStore();
  const [animationName, setAnimationName] = useState("");

  useEffect(() => {
    return () => {
      setUploadedAnimation(null);
    };
  }, [setUploadedAnimation]);

  const handleSaveAnimation = async () => {
    if (!uploadedAnimation) {
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
        jsonContent: uploadedAnimation,
        _status: "created",
      });
      alert("Animation saved successfully!");
    } catch (error: unknown) {
      alert((error as Error)?.message || "Failed to save animation");
    }
  };

  return (
    <div className="space-y-4">
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

      <div className="grid grid-cols-2 gap-2 max-w-md">
        
        {uploadedAnimation && (
          <Button onClick={handleSaveAnimation}>Save Animation</Button>
        )}
      </div>

      {uploadedAnimation && <LottieAnimationViewer animationData={uploadedAnimation} />}
    </div>
  );
};

export default LottieUploader;