"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import exportToCsv from '@/utils/exportCsv';
import ActionPackModal from './ActionPackModal';

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

const STORAGE_KEY = 'utrend_keyword_analyses_v1';

type SavedAnalysis = { id: string; name?: string; date: string; rows: ResultRow[] };

const KeywordBatchAnalyzer: React.FC = () => {
  const [input, setInput] = useState('');
  const [rows, setRows] = useState<ResultRow[]>([]);
  const [saved, setSaved] = useState<SavedAnalysis[]>([]);
  const [packOpen, setPackOpen] = useState(false);
  const [currentPack, setCurrentPack] = useState<any | undefined>(undefined);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setSaved(JSON.parse(raw));
    } catch (e) {
      console.error('Failed to load saved analyses', e);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
    } catch (e) {
      console.error('Failed to save analyses', e);
    }
  }, [saved]);

  const run = () => {
    const keywords = input.split(/[,\n]+/).map((s) => s.trim()).filter(Boolean);
    const res = analyzeKeywords(keywords);
    setRows(res);
  };

  const saveCurrent = (name?: string) => {
    if (!rows || rows.length === 0) return;
    const entry: SavedAnalysis = { id: String(Date.now()), name: name || `Analysis ${new Date().toLocaleString()}`, date: new Date().toISOString(), rows };
    setSaved((s) => [entry, ...s]);
  };

  const loadAnalysis = (id: string) => {
    const a = saved.find((s) => s.id === id);
    if (a) setRows(a.rows);
  };

  const deleteAnalysis = (id: string) => setSaved((s) => s.filter((x) => x.id !== id));

  const generateActionPackFor = (keyword: string, score?: number) => {
    // Simple template-based generator. Replace with LLM calls later.
    const urgency = (score || 0) > 50 ? 'High' : (score || 0) > 20 ? 'Medium' : 'Low';
    const titles = [
      `${keyword} — Quick Wins for 2025`,
      `How to ${keyword} and Grow Fast`,
      `${keyword}: Tips, Tricks & Examples`
    ];
    const descriptions = [
      `Short guide: ${titles[0]}. Learn practical steps and tools to get traction quickly.`,
      `Step-by-step: ${titles[1]}. Includes publishing checklist and hashtag suggestions.`,
      `Examples and templates to help you create fast content on ${keyword}.`
    ];
    const hashtags = [keyword.replace(/\s+/g, ''), 'growth', 'creator', 'shorts', 'howto'].slice(0,5);
    const script = `Hook: Quick stat or question about ${keyword}.
Explain: 2-3 bullets with value.
CTA: Subscribe + check link.`;
    const suggestedTime = new Date(Date.now() + 1000 * 60 * 60 * 24).toLocaleString();
    const pack = { keyword, titles, descriptions, hashtags, script, suggestedTime, urgency };
    setCurrentPack(pack);
    setPackOpen(true);
    return pack;
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
        <Button onClick={() => saveCurrent()} disabled={rows.length === 0}>Save Analysis</Button>
        <Button onClick={() => {
          // generate an action pack for top score
          if (rows.length === 0) return;
          const top = rows.sort((a,b) => b.score - a.score)[0];
          generateActionPackFor(top.keyword, top.score);
        }}>Generate Action Pack</Button>
        <Button onClick={() => exportToCsv('keywords.csv', rows)} className="ml-auto">Export CSV</Button>
      </div>

      {saved.length > 0 && (
        <div className="mb-3">
          <h5 className="text-sm font-semibold text-slate-300 mb-2">Saved Analyses</h5>
          <div className="space-y-2">
            {saved.map((s) => (
              <div key={s.id} className="flex items-center gap-3 p-2 bg-slate-900/30 rounded-md">
                <div className="flex-grow">
                  <div className="text-sm text-slate-400">{s.name}</div>
                  <div className="text-xs text-slate-500">{new Date(s.date).toLocaleString()} · {s.rows.length} keywords</div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => loadAnalysis(s.id)}>Load</Button>
                  <Button onClick={() => exportToCsv(`${s.name.replace(/[^a-z0-9\-_]/gi,'_')}.csv`, s.rows)}>Export</Button>
                  <Button onClick={() => deleteAnalysis(s.id)}>Delete</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
                  <td className="px-3 py-2 text-right">
                    <Button onClick={() => generateActionPackFor(r.keyword, r.score)}>Action Pack</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <ActionPackModal open={packOpen} onClose={() => setPackOpen(false)} pack={currentPack} />
    </div>
  );
};

export default KeywordBatchAnalyzer;
