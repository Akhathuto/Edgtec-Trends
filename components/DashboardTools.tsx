"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import KeywordBatchAnalyzer from './KeywordBatchAnalyzer';
import TrendFilters from './TrendFilters';
import ContentCalendar from './ContentCalendar';
import exportToCsv from '@/utils/exportCsv';

const sampleRows = [
  { id: 1, title: 'Top Trend', clicks: 1234, conversions: 12 },
  { id: 2, title: 'Second Trend', clicks: 987, conversions: 8 },
];

const DashboardTools: React.FC = () => {
  const [showAnalyzer, setShowAnalyzer] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <Button onClick={() => exportToCsv('trends.csv', sampleRows)} className="button-primary">
          ⬇️ Export Trends (CSV)
        </Button>
        <Button onClick={() => setShowAnalyzer((s) => !s)}>🔎 Keyword Batch Analyzer</Button>
        <Button onClick={() => setShowFilters((s) => !s)}>🧰 Trend Filters</Button>
        <Button onClick={() => setShowCalendar((s) => !s)}>📅 Content Calendar</Button>
      </div>

      {showCalendar && (
        <div className="mt-4">
          <ContentCalendar />
        </div>
      )}

      {showAnalyzer && (
        <div className="mt-4">
          <KeywordBatchAnalyzer />
        </div>
      )}

      {showFilters && (
        <div className="mt-4">
          <TrendFilters />
        </div>
      )}
    </div>
  );
};

export default DashboardTools;
