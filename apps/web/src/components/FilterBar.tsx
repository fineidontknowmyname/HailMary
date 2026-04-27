import React from 'react';
import { Search } from 'lucide-react';

interface FilterBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedType: string | null;
  setSelectedType: (type: string | null) => void;
  selectedDepth: string | null;
  setSelectedDepth: (depth: string | null) => void;
}

export function FilterBar({ 
  searchQuery, 
  setSearchQuery, 
  selectedType, 
  setSelectedType,
  selectedDepth,
  setSelectedDepth
}: FilterBarProps) {
  
  const types = ['course', 'doc', 'video', 'practice', 'project', 'opensource'];
  const depths = ['surface', 'guided', 'deep', 'foundational'];

  return (
    <div className="bg-[#111520] p-4 rounded-xl border border-gray-800 mb-8 space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
        <input 
          type="text" 
          placeholder="Search Intel (titles, tags, descriptions)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-[#0b0e14] border border-gray-800 text-white rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:border-[#4fffb0] transition-colors font-mono text-sm"
        />
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        {/* Type Filter */}
        <div className="flex-1">
          <h4 className="text-xs font-mono text-gray-500 uppercase mb-2">Filter by Format</h4>
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => setSelectedType(null)}
              className={`px-3 py-1 text-xs font-mono rounded ${!selectedType ? 'bg-[#4fffb0] text-black font-bold' : 'bg-[#161b27] text-gray-400 hover:text-white'}`}
            >
              ALL
            </button>
            {types.map(type => (
              <button 
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-3 py-1 text-xs font-mono rounded uppercase ${selectedType === type ? 'bg-[#4fffb0] text-black font-bold' : 'bg-[#161b27] text-gray-400 hover:text-white'}`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Depth Filter (Philosophy Integration) */}
        <div className="flex-1">
          <h4 className="text-xs font-mono text-gray-500 uppercase mb-2">Filter by Depth</h4>
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => setSelectedDepth(null)}
              className={`px-3 py-1 text-xs font-mono rounded ${!selectedDepth ? 'bg-[#7c6aff] text-white font-bold' : 'bg-[#161b27] text-gray-400 hover:text-white'}`}
            >
              ALL
            </button>
            {depths.map(depth => (
              <button 
                key={depth}
                onClick={() => setSelectedDepth(depth)}
                className={`px-3 py-1 text-xs font-mono rounded uppercase ${selectedDepth === depth ? 'bg-[#7c6aff] text-white font-bold' : 'bg-[#161b27] text-gray-400 hover:text-white'}`}
              >
                {depth}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}