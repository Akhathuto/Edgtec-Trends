"use client";

import React from 'react';
import { Button } from '@/components/ui/button';

type ActionPack = {
  keyword: string;
  titles: string[];
  descriptions: string[];
  hashtags: string[];
  script: string;
  suggestedTime: string;
};

const downloadJson = (name: string, obj: any) => {
  const blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

const ActionPackModal: React.FC<{ open: boolean; onClose: () => void; pack?: ActionPack }> = ({ open, onClose, pack }) => {
  if (!open || !pack) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-2xl mx-4 bg-slate-900 rounded-lg p-6 z-10 border border-slate-700">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-bold">Action Pack — {pack.keyword}</h3>
          <div className="flex gap-2">
            <Button onClick={() => navigator.clipboard.writeText(JSON.stringify(pack, null, 2))}>Copy JSON</Button>
            <Button onClick={() => downloadJson(`action-pack-${pack.keyword.replace(/[^a-z0-9]/gi,'_')}.json`, pack)}>Download</Button>
            <Button onClick={onClose}>Close</Button>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <div className="text-sm text-slate-400">Suggested Publish Time</div>
            <div className="font-medium text-white">{pack.suggestedTime}</div>
          </div>

          <div>
            <div className="text-sm text-slate-400">Titles</div>
            <ul className="list-disc ml-4 mt-1">
              {pack.titles.map((t, i) => <li key={i} className="text-white">{t}</li>)}
            </ul>
          </div>

          <div>
            <div className="text-sm text-slate-400">Descriptions</div>
            <ul className="list-decimal ml-4 mt-1">
              {pack.descriptions.map((d, i) => <li key={i} className="text-white">{d}</li>)}
            </ul>
          </div>

          <div>
            <div className="text-sm text-slate-400">Hashtags</div>
            <div className="flex flex-wrap gap-2 mt-2">{pack.hashtags.map((h, i) => <span key={i} className="px-2 py-1 bg-slate-800 text-slate-200 rounded">#{h}</span>)}</div>
          </div>

          <div>
            <div className="text-sm text-slate-400">Short Script</div>
            <pre className="whitespace-pre-wrap text-sm text-slate-200 bg-slate-800 p-3 rounded mt-1">{pack.script}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActionPackModal;
