'use client';
import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import MathJax component with no SSR
const MathJax = dynamic(
  () => import('better-react-mathjax').then((mod) => mod.MathJax),
  { 
    ssr: false,
    loading: () => <span className="text-gray-500 animate-pulse">Loading math...</span>
  }
);

interface MathDisplayProps {
  children: string;
  className?: string;
}

const MathDisplay: React.FC<MathDisplayProps> = ({ 
  children, 
  className = "" 
}) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Show loading state during SSR and initial client render
  if (!isClient) {
    return (
      <div className={`prose prose-sm max-w-none ${className}`}>
        <span className="text-gray-500 animate-pulse">Loading math...</span>
      </div>
    );
  }

  return (
    <div className={`prose prose-sm max-w-none whitespace-pre-line ${className}`}>
      <MathJax>{children}</MathJax>
    </div>
  );
};

export default MathDisplay;