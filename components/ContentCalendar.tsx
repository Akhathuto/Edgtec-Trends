"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import exportToCsv from '@/utils/exportCsv';

type CalendarItem = { id: string; date: string; title: string; channel?: string };

const STORAGE_KEY = 'utrend_content_calendar_v1';

const ContentCalendar: React.FC = () => {
  const [items, setItems] = useState<CalendarItem[]>([]);
  const [date, setDate] = useState('');
  const [title, setTitle] = useState('');
  const [channel, setChannel] = useState('');

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch (e) {
      console.error('Failed to read calendar from storage', e);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to write calendar to storage', e);
    }
  }, [items]);

  const addItem = () => {
    if (!date || !title) return;
    setItems((s) => [{ id: String(Date.now()), date, title, channel }, ...s]);
    setDate(''); setTitle(''); setChannel('');
  };

  const removeItem = (id: string) => setItems((s) => s.filter((i) => i.id !== id));

  const exportCalendar = () => exportToCsv('content-calendar.csv', items.map(i => ({ date: i.date, title: i.title, channel: i.channel })));

  return (
    <div className="bg-brand-glass p-4 rounded-md">
      <h3 className="text-lg font-bold text-white mb-3">Content Calendar</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Input placeholder="Channel (optional)" value={channel} onChange={(e) => setChannel(e.target.value)} />
      </div>
      <div className="flex gap-3 mb-4">
        <Button onClick={addItem} className="button-primary">+ Add</Button>
        <Button onClick={() => { setItems([]); localStorage.removeItem(STORAGE_KEY); }}>Clear</Button>
        <Button onClick={exportCalendar} className="ml-auto">Export CSV</Button>
      </div>

      <div className="space-y-2">
        {items.length === 0 && <p className="text-slate-400 text-sm">No scheduled items yet.</p>}
        {items.map((it) => (
          <div key={it.id} className="p-3 rounded-md bg-slate-900/40 flex items-center justify-between">
            <div>
              <div className="text-sm text-slate-400">{it.date} {it.channel ? `· ${it.channel}` : ''}</div>
              <div className="font-semibold text-white">{it.title}</div>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => navigator.clipboard.writeText(`${it.title} - ${it.date}`)}>Copy</Button>
              <Button onClick={() => removeItem(it.id)}>Remove</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContentCalendar;
