declare global {
  interface Window {
    MathJax?: {
      startup: {
        defaultReady: () => void;
        promise: Promise<void>;
      };
      typesetPromise: (elements?: HTMLElement[]) => Promise<void>;
      tex2svg: (tex: string, options?: any) => any;
      Hub?: {
        Queue: (callback: () => void) => void;
      };
    };
  }
}

export {};