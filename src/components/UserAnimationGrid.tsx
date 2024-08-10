import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useUserAnimationsStore } from "@/stores/userAnimationStore";
import { buttonVariants } from "@/components/ui/button";
import UserAnimationCard from "@/components/UserAnimationCard";
import { UserAnimation } from "@/types/userAnimation";

type UserAnimationListProps = {
  animations: UserAnimation[]
}

export default function UserAnimationList(props: UserAnimationListProps) {
  const { animations } = props
  const {  setUploadedAnimation } =
    useUserAnimationsStore();
  const navigate = useNavigate();


  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const json = JSON.parse(e.target?.result as string);
          setUploadedAnimation(json);
          navigate("/upload");
        } catch (error) {
          console.error("Error parsing JSON:", error);
          alert("Invalid JSON file");
        }
      };
      reader.readAsText(file);
    }
  };

  const animationGrid = useMemo(
    () => (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {animations.map((animation) => (
          <UserAnimationCard key={animation.id} animation={animation} />
        ))}
      </div>
    ),
    [animations]
  );
  

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold">Your Uploaded Animations</h2>
      <div>
        <input
          type="file"
          accept=".json"
          onChange={handleFileUpload}
          className="hidden"
          id="lottie-upload"
        />
        <label htmlFor="lottie-upload" className={buttonVariants()}>
          <span className="">Add new animation</span>
        </label>
      </div>
      {animationGrid}
    </div>
  );
}
