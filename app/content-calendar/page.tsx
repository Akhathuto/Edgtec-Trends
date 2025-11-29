"use client";

import React from 'react';
import ContentCalendar from '@/components/ContentCalendar';

const Page = () => {
  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold text-white mb-4">Content Calendar</h1>
      <ContentCalendar />
    </main>
  );
};

export default Page;
