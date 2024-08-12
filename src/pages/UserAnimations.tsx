import { lazy, useCallback, useEffect, useState } from "react";
import { useUserAnimationsStore } from "@/stores/userAnimationStore";
import { UserAnimation } from "@/types/userAnimation";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/useDebounce";
import { db } from "@/db/indexedDB";
import { useUserStore } from "../stores/useStore";

const LazyLoadingSkeleton = lazy(() => import("@/components/LazyLoadingSkeleton"));
const EmptyUserAnimation = lazy(() => import("@/components/EmptyUserAnimation"));
const UserAnimationGrid = lazy(() => import("@/components/UserAnimationGrid"));
const NoSearchResults = lazy(() => import("@/components/NoSearchResults"));


function UserAnimations() {
  const { loading, error, getAnimations } = useUserAnimationsStore();
  const [animations, setAnimations] = useState<UserAnimation[]>([]);
  const [allAnimations, setAllAnimations] = useState<UserAnimation[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const { localUser: user } = useUserStore();

  const memoizedFetchAnimations = useCallback(async () => {
    if (user) {
      const fetchedAnimations = await getAnimations(user.localUserId);
      setAnimations(fetchedAnimations);
      setAllAnimations(fetchedAnimations);
    }
  }, [getAnimations, user]);

  useEffect(() => {
    memoizedFetchAnimations();
  }, [memoizedFetchAnimations]);

  const searchAnimations = useCallback(async (term: string) => {
    if (!term.trim()) {
      return allAnimations;
    }

    const lowerTerm = term.toLowerCase();
    return await db.userAnimations
      .where('userId').equals(user!.localUserId)
      .and(animation => animation.name.toLowerCase().includes(lowerTerm))
      .toArray();
  }, [allAnimations, user]);

  useEffect(() => {
    const performSearch = async () => {
      const searchResults = await searchAnimations(debouncedSearchTerm);
      setAnimations(searchResults);
    };

    performSearch();
  }, [debouncedSearchTerm, searchAnimations]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (loading && allAnimations.length === 0) {
    return <LazyLoadingSkeleton />;
  }

  const renderContent = () => {
    if (allAnimations.length === 0) {
      return <EmptyUserAnimation />;
    }

    return (
      <>
        <div className="max-w-sm mb-4">
          <Input 
            placeholder="Search animations"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        {animations.length === 0 ? (
          <NoSearchResults searchTerm={searchTerm} />
        ) : (
          <UserAnimationGrid animations={animations} />
        )}
      </>
    );
  };

  return (
    <div className="container mx-auto p-6">
      {renderContent()}
    </div>
  );
}

export default UserAnimations;