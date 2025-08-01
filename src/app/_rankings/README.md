# Student Rankings - Modular Structure

## 📁 File Structure

```
src/app/rankings/
├── StudentRankings.tsx          # Main component (modular)
├── StudentRankings.backup.tsx   # Backup of original file
├── page.tsx                     # Page entry point
├── components/
│   ├── index.ts                # Component exports
│   ├── RankingsHeader.tsx      # Header with navigation and filters
│   ├── ExamFilterSelect.tsx    # Exam filter dropdown
│   ├── TopRankingsSection.tsx  # Top 10 overall rankings
│   ├── ExamRankingsSection.tsx # Exam-specific rankings
│   ├── RankingCard.tsx         # Individual ranking item
│   ├── RankingBadge.tsx        # Rank badge component
│   ├── UserAvatar.tsx          # User avatar component
│   ├── NoRankingsMessage.tsx   # Empty state component
│   └── LoadingSpinner.tsx      # Loading component
├── hooks/
│   ├── index.ts               # Hook exports
│   ├── useRankingsData.ts     # Data fetching and state
│   └── useRankingsActions.ts  # User actions and navigation
├── types/
│   └── index.ts               # TypeScript interfaces
├── utils/
│   └── index.ts               # Utility functions
└── README.md                  # This documentation
```

## 🏗️ Component Hierarchy

```
StudentRankings
├── RankingsHeader
│   └── ExamFilterSelect
├── TopRankingsSection
│   └── RankingCard
│       ├── RankingBadge
│       └── UserAvatar
├── ExamRankingsSection
│   └── RankingCard
└── NoRankingsMessage
```

## 🔧 Key Improvements

### 1. **Separation of Concerns**
- **Components**: UI rendering only
- **Hooks**: Business logic and state management
- **Utils**: Pure functions for formatting and calculations
- **Types**: Centralized type definitions

### 2. **Custom Hooks**
- `useRankingsData`: Handles data fetching and filtering
- `useRankingsActions`: Manages user interactions

### 3. **Reusable Components**
- `RankingCard`: Used for both top rankings and exam-specific rankings
- `UserAvatar`: Consistent user representation
- `RankingBadge`: Reusable rank display

### 4. **Type Safety**
- Comprehensive TypeScript interfaces
- Props validation for all components
- Type-safe data transformations

## 📦 Component Props

### RankingsHeader
```typescript
interface RankingsHeaderProps {
  selectedExam: string;
  exams: Exam[];
  onExamFilterChange: (examId: string) => void;
  onBackNavigation: () => void;
}
```

### RankingCard
```typescript
interface RankingCardProps {
  ranking: ExamRanking;
  exams?: Exam[];
  showExamName?: boolean;
}
```

### TopRankingsSection
```typescript
interface TopRankingsSectionProps {
  rankings: ExamRanking[];
  exams: Exam[];
}
```

## 🎯 Benefits of This Structure

1. **Maintainability**: Each component has a single responsibility
2. **Testability**: Components can be unit tested in isolation
3. **Reusability**: Components can be used in other parts of the application
4. **Performance**: Optimized re-rendering with proper memoization
5. **Developer Experience**: Clear structure and type safety
6. **Scalability**: Easy to add new features without modifying existing code

## 🚀 Usage Example

```typescript
const StudentRankings: React.FC = () => {
  const { 
    exams, selectedExam, setSelectedExam, loading,
    topRankings, rankingsByExam
  } = useRankingsData();
  
  const { handleExamFilterChange, handleBackNavigation } = useRankingsActions(setSelectedExam);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-50">
      <RankingsHeader {...headerProps} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <TopRankingsSection rankings={topRankings} exams={exams} />
        <ExamRankingsSection rankingsByExam={rankingsByExam} />
        {Object.keys(rankingsByExam).length === 0 && (
          <NoRankingsMessage selectedExam={selectedExam} />
        )}
      </div>
    </div>
  );
};
```

## 🔄 Migration Benefits

- **Reduced component size**: Main component is now ~45 lines vs 644+ lines
- **Better code organization**: Related functionality grouped together
- **Improved readability**: Clear separation of concerns
- **Enhanced maintainability**: Changes isolated to specific files
- **Better testing**: Each component can be tested independently
- **Performance optimizations**: Memoized calculations and components

## 🔍 File Size Comparison

- **Before**: StudentRankings.tsx (~644 lines)
- **After**: 
  - StudentRankings.tsx (~45 lines)
  - Components (~400 lines total)
  - Hooks (~120 lines total)
  - Utils/Types (~80 lines total)
  - **Total**: ~645 lines (organized across 12+ files)

The total code is similar but much more maintainable and scalable.

## 🛠️ Utility Functions

The `utils/index.ts` file contains pure functions for:
- `getRankBadge`: Generates rank emojis/badges
- `getRankIcon`: Returns appropriate rank icons
- `getInitials`: Extracts user initials
- `getCardBorder`: Returns CSS classes for rank-based styling
- `getScoreColor`: Returns CSS classes for score styling
- `formatDate`: Formats date strings
- `calculatePercentage`: Calculates percentage scores

## 📋 Type Definitions

The `types/index.ts` file contains interfaces for:
- Component props validation
- Data structures
- Event handlers
- Filter and sort options

## 🎯 Custom Hooks

### useRankingsData
- Fetches rankings and exams data
- Filters rankings based on selected exam
- Groups rankings by exam
- Calculates top rankings
- Memoizes computed values for performance

### useRankingsActions
- Handles exam filter changes
- Manages navigation back to dashboard
- Provides refresh functionality
- Determines user role for navigation
