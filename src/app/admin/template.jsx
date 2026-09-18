import React from 'react';

export default function AdminTemplate({ children }) {
  return (
    <div className="animate-page-enter">
      {children}
    </div>
  );
}
