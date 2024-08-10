import { Animation } from "@lottiefiles/lottie-types";
import Lottie from "react-lottie-player";

type LottieDisplayProps = {
  animationData: Animation;
  width?: number | string;
  height?: number | string;
  isPlaying: boolean;
  loop: boolean;
  speed: number;
  direction: 1 | -1;
};

const LottieDisplay = ({
  animationData,
  width = 300,
  height = 300,
  isPlaying,
  loop,
  speed,
  direction,
}: LottieDisplayProps) => {
  return (
    <Lottie
      animationData={animationData}
      play={isPlaying}
      loop={loop}
      style={{ width, height }}
      speed={speed}
      direction={direction}
    />
  );
};

export default LottieDisplay;
