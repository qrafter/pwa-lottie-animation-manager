import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useUserAnimationsStore } from "@/stores/userAnimationStore";
import { Animation } from "@lottiefiles/lottie-types";
import { Input } from "@/components/ui/input";
import LottieAnimationViewer from "@/components/LottieAnimationViewer";
import { Navigate, useNavigate } from "react-router-dom";
import { useUserStore } from "../stores/useStore";

type LottieUploaderProps = {
  initialAnimationData?: Animation;
};

const LottieUploader: React.FC<LottieUploaderProps> = () => {
  const { uploadedAnimation, addAnimation } = useUserAnimationsStore();
  const [animationName, setAnimationName] = useState("");
  const { localUser } = useUserStore();
  const navigate = useNavigate()

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
      if (!localUser) {
        alert("No local user found");
        return
      }
      await addAnimation(localUser!.localUserId, animationName, {
        name: animationName.trim(),
        jsonContent: uploadedAnimation,
      });
      alert("Animation saved successfully!");
      navigate("/animations");
    } catch (error: unknown) {
      alert((error as Error)?.message || "Failed to save animation");
    }
  };

  if (!uploadedAnimation) {
    return (
      <Navigate to="/animations" replace />
    );
  }

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