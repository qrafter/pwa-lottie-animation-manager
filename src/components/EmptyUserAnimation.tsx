import { useNavigate } from "react-router-dom";
import { useUserAnimationsStore } from "@/stores/userAnimationStore";
import { Button, buttonVariants } from "@/components/ui/button";
import React, { useState } from "react";
import { SyncModal } from "./SyncModal";
import { RefreshCcw } from "lucide-react";

function EmptyUserAnimation() {

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

  return (
    <div className="syncing-container h-screen">
      <div className="flex flex-col justify-center items-center gap-4">
        <div className="syncing-animation"></div>
        <h1 className="text-xl"></h1>
        <h1 className="text-4xl font-bold mb-4">Lottie Animation Manager</h1>
        <p className="text-gray-600 mb-6 text-center">
          Explore, manage, and interact with Lottie animations. Upload your JSON
          files, preview animations, and access them offline.
        </p>
        <input
          type="file"
          accept=".json"
          onChange={handleFileUpload}
          className="hidden"
          id="lottie-upload"
        />
        <label htmlFor="lottie-upload" className={buttonVariants()}>
          <span className="">Upload your animation</span>
        </label>
        <div className="mt-10">
          <h1 className="text-gray-600 ">If you have an existing account, you can sign in and sync your animations</h1>
        </div>
        <Button variant={"outline"} className="flex flex-row gap-4" onClick={() => setIsSyncModalOpen(true)}>
          <RefreshCcw className="w-5" /> Sync Animations
        </Button>
      </div>
      <SyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
      />
    </div>
  );
}

export default React.memo(EmptyUserAnimation);
