'use client';

import React from 'react';

export default function Template({ children }) {
  return (
    <div className="animate-page-enter">
      {children}
    </div>
  );
}
