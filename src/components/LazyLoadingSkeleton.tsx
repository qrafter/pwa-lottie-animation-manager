import React from 'react';

const SkeletonCard: React.FC = () => (
  <div className="bg-white rounded-2xl shadow-md overflow-hidden hover:border-black hover:cursor-pointer border-solid border animate-pulse">
    <div className="relative h-40 bg-gray-200"></div>
    <div className="p-4">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
      <div className="flex items-center">
        <div className="w-6 h-6 rounded-full bg-gray-200 mr-2"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
      </div>
    </div>
  </div>
);

const LazyLoadingSkeleton: React.FC = () => {
  return (
    <div className="container mx-auto p-6">
      <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {[...Array(12)].map((_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
    </div>
  );
};

export default React.memo(LazyLoadingSkeleton);