# Add Questions Section

A comprehensive and enhanced component for adding questions to exam sections with advanced filtering, selection, and preview capabilities.

## Features

### 🔍 Advanced Search & Filtering
- **Search**: Full-text search across question content, subjects, and topics
- **Subject Filter**: Filter questions by subject categories
- **Difficulty Filter**: Filter by Easy, Medium, or Hard difficulty levels
- **Topic Filter**: Filter by specific topics within subjects
- **Tag Filter**: Filter by question tags for precise categorization

### 📊 Multiple View Modes
- **List View**: Compact list display for efficient browsing
- **Grid View**: Card-based grid layout for visual scanning
- **Detailed View**: Comprehensive question preview with all details

### 🎯 Smart Selection Tools
- **Individual Selection**: Click to select questions one by one
- **Bulk Actions**: Select all filtered questions or clear all selections
- **Smart Selection**: AI-powered selection with:
  - Subject distribution balancing
  - Difficulty level balancing
  - Optimal question set composition

### 👁️ Question Preview
- Full question content display
- All answer options with correct answer highlighting
- Question metadata (subject, topic, difficulty, tags)
- Add/remove from selection directly from preview

### 🔧 Flexible Integration
- **Dialog Mode**: Modal popup for focused question selection
- **Inline Mode**: Embedded component for seamless integration
- **API Integration**: Handles both provided questions and API loading
- **Callback Support**: Event handlers for question addition and selection changes

## Usage

### Basic Implementation

```tsx
import AddQuestionsSection from '@/app/admin/exam/components/AddQuestionsSection';

// Dialog Mode
<AddQuestionsSection
  examId="your-exam-id"
  sectionId="your-section-id"
  section={sectionData}
  isOpen={showDialog}
  mode="dialog"
  onClose={() => setShowDialog(false)}
  onQuestionsAdded={(questions, count) => {
    console.log(`Added ${count} questions`);
  }}
/>

// Inline Mode
<AddQuestionsSection
  examId="your-exam-id"
  sectionId="your-section-id"
  section={sectionData}
  isOpen={true}
  mode="inline"
  onQuestionsAdded={(questions, count) => {
    // Handle questions added
  }}
/>
```

### Props Interface

```tsx
interface AddQuestionsSectionProps {
  examId?: string;                    // Target exam ID
  sectionId?: string;                 // Target section ID
  section?: ExamSection;              // Section metadata
  availableQuestions?: Question[];    // Pre-loaded questions (optional)
  onQuestionsAdded?: (addedQuestions: Question[], totalQuestions: number) => void;
  onClose?: () => void;               // Close handler for dialog mode
  isOpen: boolean;                    // Visibility state
  mode?: 'dialog' | 'inline';         // Display mode
}
```

## Component Architecture

### State Management
- **Local State**: Question selection, filters, view preferences
- **API Integration**: Automatic question loading when not provided
- **Selection State**: Efficient Set-based selection tracking

### Performance Optimizations
- **Memoized Filtering**: Efficient question filtering with useMemo
- **Callback Optimization**: useCallback for stable function references
- **Lazy Loading**: Dynamic imports for better initial load performance

### Smart Selection Algorithm

The smart selection feature uses sophisticated algorithms to create balanced question sets:

1. **Subject Distribution**: Evenly distributes questions across available subjects
2. **Difficulty Balancing**: Maintains proportional mix of Easy, Medium, and Hard questions
3. **Topic Coverage**: Ensures variety across different topics within subjects
4. **Configurable Parameters**: Adjustable selection criteria

```tsx
// Smart selection configuration
const smartSelection = {
  subjectDistribution: true,     // Balance across subjects
  difficultyBalance: true,       // Balance difficulty levels
  maxQuestionsPerTopic: 5,       // Limit per topic
  preferredDifficulty: 'mixed'   // Overall difficulty preference
};
```

## Integration with Exam Builder

The Add Questions Section is fully integrated with the Enhanced Exam Builder:

### In EnhancedExamBuilder.tsx:
```tsx
import AddQuestionsSection from '../components/AddQuestionsSection';

// Usage within exam builder
<AddQuestionsSection
  examId={editingExam?.id}
  sectionId={sections[activeSection]?.id}
  section={sections[activeSection]}
  availableQuestions={questions}
  isOpen={showQuestionSelector}
  mode="dialog"
  onClose={() => setShowQuestionSelector(false)}
  onQuestionsAdded={(addedQuestions, totalQuestions) => {
    // Update section with new questions
    handleUpdateSection(currentSection.id, {
      questions: [...currentQuestions, ...addedQuestions],
      marks: updatedQuestions.length * 1,
      questionsCount: updatedQuestions.length
    });
  }}
/>
```

## API Integration

The component integrates with the question service API:

### Question Loading
- Automatically loads questions when not provided via props
- Supports filtering parameters in API requests
- Handles loading states and error conditions

### Question Addition
- Uses exam service to add questions to sections
- Provides validation and error handling
- Updates section metadata automatically

```tsx
// API call for adding questions
await examService.addQuestionsToSection(examId, sectionId, {
  questionIds: selectedQuestionIds,
  marks: 1 // Default marks per question
});
```

## Styling and Theming

The component uses the application's design system:

- **Tailwind CSS**: Utility-first styling approach
- **shadcn/ui Components**: Consistent UI component library
- **Responsive Design**: Mobile-first responsive layout
- **Dark Mode Support**: Automatic theme adaptation
- **Accessibility**: ARIA labels and keyboard navigation

## Demo Component

A comprehensive demo component is available to showcase all features:

```tsx
import AddQuestionsDemo from '@/app/admin/exam/components/AddQuestionsDemo';

<AddQuestionsDemo 
  examId="demo-exam"
  section={demoSection}
  onBack={() => navigateBack()}
/>
```

Access the demo through the Admin Dashboard: "Add Questions Demo" button.

## Best Practices

### Performance
1. **Provide Questions**: Pass `availableQuestions` prop when questions are already loaded
2. **Debounce Search**: Search input has built-in debouncing for API efficiency
3. **Limit Results**: Component handles large question sets efficiently

### User Experience
1. **Clear Feedback**: Always provide feedback for user actions
2. **Selection Visibility**: Clear indication of selected questions
3. **Filter Persistence**: Filters remain applied during session

### Integration
1. **Error Handling**: Implement proper error handling in parent components
2. **Loading States**: Show loading indicators during API operations
3. **Validation**: Validate section and exam IDs before opening component

## Future Enhancements

Planned improvements for the Add Questions Section:

1. **Question Ordering**: Drag-and-drop question reordering
2. **Bulk Import**: Import questions from external sources
3. **Question Creation**: Inline question creation and editing
4. **Analytics**: Question performance and usage analytics
5. **Collaborative Features**: Multi-user question selection
6. **Advanced Filters**: Custom filter combinations and saved filter presets

## Troubleshooting

### Common Issues

1. **Questions Not Loading**: Check API connectivity and authentication
2. **Selection Not Working**: Verify question IDs are unique and valid
3. **API Errors**: Check exam and section IDs are valid
4. **Performance Issues**: Consider pagination for large question sets

### Debug Mode

Enable debug logging by setting:
```tsx
const DEBUG_MODE = true;
```

This will log selection changes, API calls, and filter operations to the console.
