import React, { lazy, useEffect, useState } from "react";
import { useUserAnimationsStore } from "@/stores/userAnimationStore";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/useDebounce";
import { useUserStore } from "../stores/useStore";

const LazyLoadingSkeleton = lazy(() => import("@/components/LazyLoadingSkeleton"));
const EmptyUserAnimation = lazy(() => import("@/components/EmptyUserAnimation"));
const UserAnimationGrid = lazy(() => import("@/components/UserAnimationGrid"));
const NoSearchResults = lazy(() => import("@/components/NoSearchResults"));

function UserAnimations() {
  const { animations, loading, error, loadAnimations, searchAnimations } = useUserAnimationsStore();
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const { localUser: user } = useUserStore();
  const [filteredAnimations, setFilteredAnimations] = useState(animations);

  useEffect(() => {
    if (user) {
      loadAnimations(user.localUserId);
    }
  }, [user, loadAnimations]);

  useEffect(() => {
    setFilteredAnimations(searchAnimations(debouncedSearchTerm));
  }, [debouncedSearchTerm, animations, searchAnimations]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (loading && animations.length === 0) {
    return <LazyLoadingSkeleton />;
  }

  const renderContent = () => {
    if (animations.length === 0) {
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
        {filteredAnimations.length === 0 ? (
          <NoSearchResults searchTerm={searchTerm} />
        ) : (
          <UserAnimationGrid animations={filteredAnimations} />
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