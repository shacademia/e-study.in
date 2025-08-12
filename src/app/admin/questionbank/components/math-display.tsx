'use client';
import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import MathJax components with no SSR
const MathJax = dynamic(
  () => import('better-react-mathjax').then((mod) => mod.MathJax),
  { 
    ssr: false,
    loading: () => <span className="text-gray-500 animate-pulse">Loading math...</span>
  }
);

const MathJaxContext = dynamic(
  () => import('better-react-mathjax').then((mod) => mod.MathJaxContext),
  { ssr: false }
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

  const mathJaxConfig = {
    loader: { load: ["[tex]/html"] },
    tex: {
      packages: { "[+]": ["html"] },
      inlineMath: [["$", "$"], ["\\(", "\\)"]],
      displayMath: [["$$", "$$"], ["\\[", "\\]"]]
    },
    svg: {
      fontCache: 'global'
    },
    startup: {
      ready: () => {
        if (typeof window !== 'undefined' && window.MathJax) {
          window.MathJax.startup.defaultReady();
          window.MathJax.startup.promise.then(() => {
            console.log('MathJax initial typesetting complete');
          });
        }
      }
    }
  };

  // Show loading state during SSR and initial client render
  if (!isClient) {
    return (
      <div className={`prose prose-sm max-w-none ${className}`}>
        <span className="text-gray-500 animate-pulse">Loading math...</span>
      </div>
    );
  }

  return (
    <MathJaxContext config={mathJaxConfig}>
      <div className={`prose prose-sm max-w-none ${className}`}>
        <MathJax>{children}</MathJax>
      </div>
    </MathJaxContext>
  );
};

export default MathDisplay;