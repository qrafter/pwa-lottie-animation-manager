import { lazy, useCallback, useEffect, useState } from "react";
import { useUserAnimationsStore } from "@/stores/userAnimationStore";
import { UserAnimation } from "@/types/userAnimation";

const LazyLoadingSkeleton = lazy(() => import("@/components/LazyLoadingSkeleton"));
const EmptyUserAnimation = lazy(() => import("@/components/EmptyUserAnimation"));
const UserAnimationGrid = lazy(() => import("@/components/UserAnimationGrid"));
// TODO: Replace with actual user from auth
const user = {
  id: '1'
};

function UserAnimations() {
  const { loading, error, getAnimations } = useUserAnimationsStore();
  const [animations, setAnimations] = useState<UserAnimation[]>([]);

  const memoizedFetchAnimations = useCallback(async () => {
    if (user) {
      const fetchedAnimations = await getAnimations(user.id);
      setAnimations(fetchedAnimations);
    }
  }, [getAnimations]);

  useEffect(() => {
    memoizedFetchAnimations();
  }, [memoizedFetchAnimations]);
  

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (loading) {
    return <LazyLoadingSkeleton />;
  }

  if (animations.length === 0) {
    return <EmptyUserAnimation />;
  }

  return (
    <div className="container mx-auto p-6">
      <UserAnimationGrid animations={animations} />
    </div>
  );
}

export default UserAnimations;