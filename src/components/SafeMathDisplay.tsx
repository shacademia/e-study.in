'use client';
import React from 'react';
import MathRenderer from './MathRenderer';

interface SafeMathDisplayProps {
  children: string | null | undefined;
  className?: string;
  inline?: boolean;
}

/**
 * Safe wrapper for MathRenderer to prevent null/undefined errors
 * This component handles all edge cases that can cause MathJax to fail
 */
const SafeMathDisplay: React.FC<SafeMathDisplayProps> = ({ children, className = "", inline = false }) => {
  // Check for null, undefined, or empty content
  if (!children || typeof children !== 'string' || children.trim() === '') {
    return <span className="text-gray-500 italic text-sm">No content</span>;
  }
  
  try {
    return <MathRenderer className={className} inline={inline}>{children}</MathRenderer>;
  } catch (error) {
    console.error('MathRenderer rendering error:', error, 'Content:', children);
    return <span className="text-red-500 italic text-sm">Math rendering error</span>;
  }
};

export default SafeMathDisplay;