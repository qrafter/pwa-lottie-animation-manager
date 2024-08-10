import { useUserAnimationsStore } from "@/stores/userAnimationStore";
import { lazy, useCallback, useEffect } from "react";

const LazyLoadingSkeleton = lazy(
  () => import("@/components/LazyLoadingSkeleton")
);
const EmptyUserAnimation = lazy(
  () => import("@/components/EmptyUserAnimation")
);
const UserAnimationGrid = lazy(() => import("@/components/UserAnimationGrid"));

const user = {
  id: "1",
};

function UserAnimations() {
  const { animations, loading, fetchAnimations } = useUserAnimationsStore();

  const memoizedFetchAnimations = useCallback(() => {
    if (user) {
      fetchAnimations(user.id);
    }
  }, [fetchAnimations]);

  useEffect(() => {
    memoizedFetchAnimations();
  }, [memoizedFetchAnimations]);

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
