'use client';
import React, { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import MathJax component with no SSR
const MathJax = dynamic(
  () => import('better-react-mathjax').then((mod) => mod.MathJax),
  { 
    ssr: false,
    loading: () => <span className="text-gray-500 animate-pulse">Loading math...</span>
  }
);

interface MathRendererProps {
  children: string;
  className?: string;
  inline?: boolean;
}

const MathRenderer: React.FC<MathRendererProps> = ({ 
  children, 
  className = "",
  inline = false
}) => {
  const [isClient, setIsClient] = useState(false);
  const [renderKey, setRenderKey] = useState(0);
  const contentRef = useRef<string>('');

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Force re-render when content changes in production
  useEffect(() => {
    if (contentRef.current !== children) {
      contentRef.current = children;
      setRenderKey(prev => prev + 1);
    }
  }, [children]);

  // Show loading state during SSR and initial client render
  if (!isClient) {
    return (
      <div className={`prose prose-sm max-w-none ${className}`}>
        <span className="text-gray-500 animate-pulse">Loading math...</span>
      </div>
    );
  }

  if (!children || children.trim() === '') {
    return <span className="text-gray-500 italic text-sm">No content</span>;
  }

  return (
    <div 
      key={renderKey} 
      className={`prose prose-sm max-w-none ${className} ${inline ? 'inline-block' : ''}`}
    >
      <MathJax>{children}</MathJax>
    </div>
  );
};

export default MathRenderer;