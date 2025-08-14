'use client';
import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { initMathJax } from '@/lib/mathjax-init';

// Dynamically import MathJaxContext with no SSR
const MathJaxContext = dynamic(
  () => import('better-react-mathjax').then((mod) => mod.MathJaxContext),
  {
    ssr: false,
    loading: () => <div></div>
  }
);

interface MathJaxProviderProps {
  children: React.ReactNode;
}

const MathJaxProvider: React.FC<MathJaxProviderProps> = ({ children }) => {
  const [isClient, setIsClient] = useState(false);
  const [mathJaxReady, setMathJaxReady] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Initialize MathJax for production builds
    if (process.env.NODE_ENV === 'production') {
      initMathJax();
    }
  }, []);

  const mathJaxConfig = {
    loader: {
      load: ["[tex]/html", "[tex]/color", "[tex]/ams", "[tex]/newcommand"]
    },
    tex: {
      packages: { "[+]": ["html", "color", "ams", "newcommand"] },
      inlineMath: [["$", "$"], ["\\(", "\\)"]],
      displayMath: [["$$", "$$"], ["\\[", "\\]"]],
      processEscapes: true,
      processEnvironments: true,
      tags: 'ams',
      macros: {
        // Common math macros
        "\\frac": ["\\frac{#1}{#2}", 2],
        "\\dfrac": ["\\displaystyle\\frac{#1}{#2}", 2],
        "\\tfrac": ["\\textstyle\\frac{#1}{#2}", 2]
      }
    },
    svg: {
      fontCache: 'global',
      displayAlign: 'center',
      displayIndent: '0em'
    },
    options: {
      enableMenu: false,
      skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code'],
      ignoreHtmlClass: 'tex2jax_ignore',
      processHtmlClass: 'tex2jax_process'
    },
    startup: {
      ready: () => {
        if (typeof window !== 'undefined' && window.MathJax) {
          window.MathJax.startup.defaultReady();
          window.MathJax.startup.promise.then(() => {
            console.log('MathJax global provider ready');
            setMathJaxReady(true);

            // Force initial typesetting for production
            if (process.env.NODE_ENV === 'production') {
              setTimeout(() => {
                if (window.MathJax) {
                  window.MathJax.typesetPromise?.();
                }
              }, 100);
            }
          }).catch((error: unknown) => {
            console.error('MathJax startup error:', error);
            setMathJaxReady(true); // Still set to true to prevent infinite loading
          });
        }
      }
    }
  };

  if (!isClient) {
    return <>{children}</>;
  }

  return (
    <MathJaxContext config={mathJaxConfig}>
      {children}
    </MathJaxContext>
  );
};

export default MathJaxProvider;
