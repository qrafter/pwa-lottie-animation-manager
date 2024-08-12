import { UserAnimation } from "@/types/userAnimation";
import { memo } from "react";
import Lottie from "react-lottie";

type UserAnimationCardProps = {
  animation: UserAnimation;
  onClick?: (animationId: string) => void;
};

const UserAnimationCard = memo(function AnimationCard({
  animation,
  onClick,
}: UserAnimationCardProps) {

  return (
    <div
      className="bg-white rounded-2xl shadow-md overflow-hidden hover:border-black hover:cursor-pointer border-solid border"
      onClick={() => onClick?.(animation.id)}
    >
      <div className="relative h-40 p-4">
        {animation.jsonContent && (
          <Lottie
            options={{
              loop: true,
              autoplay: true,
              animationData: animation.jsonContent,
            }}
            style={{ width: "100%", height: "100%" }}
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
