# MathJax Production Build Fix

## Problem
Math expressions were rendering correctly in development mode but showing as raw LaTeX code in production builds. This is a common issue with MathJax and Next.js production optimizations.

## Root Cause
1. **Multiple MathJax Contexts**: Each component was creating its own `MathJaxContext`, causing conflicts
2. **Missing Global Provider**: No global MathJax provider in the main layout
3. **Production Build Optimization**: Next.js handles dynamic imports differently in production

## Solution Applied

### 1. Added Global MathJax Provider
- Added `MathJaxProvider` to the main layout (`src/app/layout.tsx`)
- Ensures single MathJax context for the entire application

### 2. Updated All Math Components
- **SafeMathDisplay**: Now uses `MathRenderer` instead of creating its own context
- **MathDisplay**: Removed individual `MathJaxContext`, uses global context
- **MathInput**: Updated to use global context for previews
- **Admin Components**: Updated all admin math components

### 3. Enhanced Configuration
- **Better MathJax Config**: Added more LaTeX packages and macros
- **Production Optimizations**: Added webpack config and experimental optimizations
- **Force Re-rendering**: Added key-based re-rendering for production builds

### 4. Files Modified
```
src/app/layout.tsx                                    # Added MathJaxProvider
src/providers/MathJaxProvider.tsx                     # Enhanced with production fixes
src/components/SafeMathDisplay.tsx                    # Updated to use MathRenderer
src/components/math-display.tsx                       # Simplified, removed context
src/components/math-input.tsx                         # Updated to use global context
src/components/MathRenderer.tsx                       # New robust renderer
src/app/admin/questionbank/components/math-display.tsx # Updated
src/app/admin/questionbank/components/math-input.tsx   # Updated
src/lib/mathjax-init.ts                               # Production initialization
next.config.ts                                        # Added MathJax optimizations
```

## Testing
1. **Development**: `yarn dev` - Should work as before
2. **Production**: `yarn build && yarn start` - Math should now render properly

## Key Features Added
- ✅ Single global MathJax context
- ✅ Production-specific initialization
- ✅ Force re-rendering mechanism
- ✅ Better error handling
- ✅ Enhanced LaTeX support
- ✅ Webpack optimizations

## Expected Result
Math expressions like `$x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$` should now render properly in both development and production builds.