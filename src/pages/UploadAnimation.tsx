import React from "react";
import LottieUploader from "@/components/LottieUploader";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const UploadAnimation: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto p-6">
      <Button
        variant="ghost"
        className="-ml-5 mb-2"
        onClick={() => navigate("/animations")}
      >
        <ArrowLeft className="w-6" /> &nbsp; Back
      </Button>
      <LottieUploader />
    </div>
  );
};

export default UploadAnimation;
