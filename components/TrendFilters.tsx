"use client";

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import TagCloud from './TagCloud';

const initialTags = ['ai', 'youtube', 'shorts', 'tiktok', 'growth', 'viral', 'trend'];

const TrendFilters: React.FC = () => {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<string[]>([]);

  const toggleTag = (tag: string) => {
    setSelected((s) => (s.includes(tag) ? s.filter((t) => t !== tag) : [...s, tag]));
  };

  const filteredTags = initialTags.filter((t) => t.includes(query.toLowerCase()));

  return (
    <div className="bg-brand-glass p-4 rounded-md">
      <div className="flex gap-3 mb-3">
        <Input
          placeholder="Filter tags..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1"
        />
        <Button onClick={() => { setQuery(''); setSelected([]); }}>Reset</Button>
      </div>

      <TagCloud tags={filteredTags} activeTags={selected} onToggle={toggleTag} />

      <div className="mt-3 text-sm text-slate-300">
        Selected: {selected.length ? selected.join(', ') : 'None'}
      </div>
    </div>
  );
};

export default TrendFilters;
