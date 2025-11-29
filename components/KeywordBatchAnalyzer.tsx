"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import exportToCsv from '@/utils/exportCsv';

type ResultRow = { keyword: string; volume: number; difficulty: number; score: number };

const analyzeKeywords = (keywords: string[]): ResultRow[] => {
  // Simulate lightweight analysis for demonstration.
  return keywords.map((k) => {
    const volume = Math.max(10, Math.floor(Math.random() * 10000));
    const difficulty = Math.floor(Math.random() * 100);
    const score = Math.round((volume / (1 + difficulty)) * 100) / 100;
    return { keyword: k, volume, difficulty, score };
  });
};

const KeywordBatchAnalyzer: React.FC = () => {
  const [input, setInput] = useState('');
  const [rows, setRows] = useState<ResultRow[]>([]);

  const run = () => {
    const keywords = input.split(/[,\n]+/).map((s) => s.trim()).filter(Boolean);
    const res = analyzeKeywords(keywords);
    setRows(res);
  };

  return (
    <div className="bg-brand-glass p-4 rounded-md">
      <h4 className="font-semibold text-white mb-2">Keyword Batch Analyzer</h4>
      <p className="text-sm text-slate-400 mb-3">Paste keywords (comma or newline separated) and run a quick analysis.</p>
      <textarea
        className="w-full mb-3 rounded-md p-3 bg-transparent border border-slate-700 text-slate-200"
        rows={4}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="example: ai tools, youtube growth, short-form strategy"
      />
      <div className="flex gap-3 mb-4">
        <Button onClick={run}>Analyze</Button>
        <Button onClick={() => { setInput(''); setRows([]); }}>Clear</Button>
        <Button onClick={() => exportToCsv('keywords.csv', rows)} className="ml-auto">Export CSV</Button>
      </div>

      {rows.length > 0 && (
        <div className="overflow-auto rounded-md border border-slate-700">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-900/40">
              <tr>
                <th className="px-3 py-2 text-left">Keyword</th>
                <th className="px-3 py-2 text-right">Volume</th>
                <th className="px-3 py-2 text-right">Difficulty</th>
                <th className="px-3 py-2 text-right">Score</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-t border-slate-800">
                  <td className="px-3 py-2">{r.keyword}</td>
                  <td className="px-3 py-2 text-right">{r.volume}</td>
                  <td className="px-3 py-2 text-right">{r.difficulty}</td>
                  <td className="px-3 py-2 text-right font-semibold">{r.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default KeywordBatchAnalyzer;
