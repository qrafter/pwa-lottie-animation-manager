import { UserAnimation } from "@/types/userAnimation";
import { memo, useCallback } from "react";
import Lottie from "react-lottie-player";

type UserAnimationCardProps = {
  animation: UserAnimation;
};

const UserAnimationCard = memo(function AnimationCard({
  animation,
}: UserAnimationCardProps) {
  const handleLottieError = useCallback((error: unknown) => {
    console.error("Lottie animation failed to load:", error);
  }, []);

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden hover:border-black hover:cursor-pointer border-solid border">
      <div className="relative h-40">
        {animation.jsonContent && (
          <Lottie
            animationData={animation.jsonContent}
            loop
            play
            style={{ width: "100%", height: "100%" }}
            onError={handleLottieError}
          />
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-sm mb-2 truncate">
          {animation.name}
        </h3>
        {animation && (
          <div className="flex items-center">
            <span className="text-xs text-gray-600">
              Uploaded At: {new Date(animation.createdAt).toLocaleString()}
            </span>
          </div>
        )}
      </div>
    </div>
  );
});

export default UserAnimationCard;
