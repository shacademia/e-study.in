// MathJax initialization for production builds
export const initMathJax = () => {
  if (typeof window !== 'undefined' && !window.MathJax) {
    // Ensure MathJax is properly initialized in production
    const script = document.createElement('script');
    script.src = 'https://polyfill.io/v3/polyfill.min.js?features=es6';
    document.head.appendChild(script);
    
    script.onload = () => {
      const mathJaxScript = document.createElement('script');
      mathJaxScript.id = 'MathJax-script';
      mathJaxScript.async = true;
      mathJaxScript.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js';
      document.head.appendChild(mathJaxScript);
    };
  }
};

export const forceRenderMath = () => {
  if (typeof window !== 'undefined' && window.MathJax) {
    try {
      window.MathJax.typesetPromise?.();
    } catch (error) {
      console.warn('MathJax typeset failed:', error);
    }
  }
};