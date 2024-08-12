import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUserAnimationsStore } from "@/stores/userAnimationStore";
import LottieAnimationViewer from "@/components/LottieAnimationViewer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trash2 } from "lucide-react";
import { UserAnimation } from "@/types/userAnimation";
import { useUserStore } from "../stores/useStore";

const UserAnimationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getAnimation, deleteAnimation } = useUserAnimationsStore();
  const [animation, setAnimation] = useState<UserAnimation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { localUser } = useUserStore();

  useEffect(() => {
    const fetchAnimation = async () => {
      if (!id) {
        setError("No animation ID provided");
        setLoading(false);
        return;
      }

      try {
        const fetchedAnimation = await getAnimation(id);
        if (fetchedAnimation) {
          setAnimation(fetchedAnimation);
        } else {
          setError("Animation not found");
        }
      } catch (err) {
        setError("Failed to fetch animation");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnimation();
  }, [id, getAnimation, localUser]);

  const handleDelete = async () => {
    if (!animation) return;

    if (window.confirm("Are you sure you want to delete this animation?")) {
      try {
        // TODO: Replace '1' with actual userId from auth
        await deleteAnimation(localUser!.localUserId, animation.id);
        navigate("/animations");
      } catch (err) {
        console.error("Failed to delete animation:", err);
        alert("Failed to delete animation. Please try again.");
      }
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error || !animation) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <Button
          variant="ghost"
          className="-ml-5 mb-2"
          onClick={() => navigate("/animations")}
        >
          <ArrowLeft className="w-6" /> &nbsp; Back
        </Button>
        <Button variant="destructive" onClick={handleDelete}>
          <Trash2 className="mr-2" size={16} />
          Delete Animation
        </Button>
      </div>
      <h1 className="text-2xl font-bold mb-4">{animation.name}</h1>
      <LottieAnimationViewer animationData={animation.jsonContent} />
    </div>
  );
};

export default UserAnimationPage;
