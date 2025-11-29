"use client";

import React from 'react';

type Props = {
  tags: string[];
  activeTags?: string[];
  onToggle?: (tag: string) => void;
};

const TagCloud: React.FC<Props> = ({ tags, activeTags = [], onToggle }) => {
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => {
        const active = activeTags.includes(tag);
        return (
          <button
            key={tag}
            onClick={() => onToggle && onToggle(tag)}
            className={`px-3 py-1 rounded-full text-sm ${active ? 'bg-violet-500 text-white' : 'bg-slate-800 text-slate-300'} hover:opacity-90`}
          >
            #{tag}
          </button>
        );
      })}
    </div>
  );
};

export default TagCloud;
