import React from 'react';

export function SkeletonCard() {
  return (
    <div className="flex flex-col bg-[#161b27] border border-gray-800 rounded-xl overflow-hidden animate-pulse">
      {/* Thumbnail Skeleton */}
      <div className="aspect-video w-full bg-[#111520]"></div>
      
      {/* Body Skeleton */}
      <div className="p-5 flex flex-col flex-grow">
        {/* Icon & Type */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-5 h-5 rounded-full bg-[#111520]"></div>
          <div className="h-3 w-16 bg-[#111520] rounded"></div>
        </div>
        
        {/* Title */}
        <div className="h-5 w-3/4 bg-[#111520] rounded mb-2"></div>
        <div className="h-5 w-1/2 bg-[#111520] rounded mb-4"></div>
        
        {/* Tags */}
        <div className="mt-auto flex gap-2">
          <div className="h-6 w-12 bg-[#111520] rounded"></div>
          <div className="h-6 w-16 bg-[#111520] rounded"></div>
        </div>
      </div>
    </div>
  );
}