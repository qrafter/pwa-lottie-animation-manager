import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUserAnimationsStore } from "@/stores/userAnimationStore";
import { Button, buttonVariants } from "@/components/ui/button";
import UserAnimationCard from "@/components/UserAnimationCard";
import { UserAnimation } from "@/types/userAnimation";
import { RefreshCcw, UploadIcon } from "lucide-react";
import { SyncModal } from "./SyncModal";

type UserAnimationGridProps = {
  animations: UserAnimation[];
};

export default function UserAnimationGrid(props: UserAnimationGridProps) {
  const { animations } = props;
  const { setUploadedAnimation } = useUserAnimationsStore();
  const navigate = useNavigate();

  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);

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
          <UserAnimationCard
            key={animation.id}
            animation={animation}
            onClick={() => navigate(`/animations/${animation.id}`)}
          />
        ))}
      </div>
    ),
    [animations, navigate]
  );

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold">Recently Uploaded</h2>
      <div className="flex flex-row gap-4">
        <div>
          <input
            type="file"
            accept=".json"
            onChange={handleFileUpload}
            className="hidden"
            id="lottie-upload"
          />
          <label
            htmlFor="lottie-upload"
            className={buttonVariants().concat("flex flex-row gap-4")}
          >
            <UploadIcon className="w-5" />{" "}
            <span className="">Upload Animations</span>
          </label>
        </div>
        <Button variant={"outline"} className="flex flex-row gap-4" onClick={() => setIsSyncModalOpen(true)}>
          <RefreshCcw className="w-5" /> Sync Animations
        </Button>
      </div>
      {animationGrid}
      <SyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
      />
    </div>
  );
}
