import React from 'react';

interface NoSearchResultsProps {
  searchTerm: string;
}

const NoSearchResults: React.FC<NoSearchResultsProps> = ({ searchTerm }) => {
  return (
    <div className="text-center py-10">
      <h2 className="text-2xl font-bold mb-2">No results found</h2>
      <p className="text-gray-600">
        We couldn't find any animations matching "{searchTerm}".
      </p>
      <p className="text-gray-600 mt-2">
        Try adjusting your search terms or browse all animations.
      </p>
    </div>
  );
};

export default NoSearchResults;