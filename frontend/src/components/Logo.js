import React from 'react';

export default function Logo({ className = "h-10 w-auto" }) {
  return (
    <img 
      src="/logo.png" 
      alt="Udaan Logo" 
      className={`object-contain rounded-lg ${className}`}
    />
  );
}
