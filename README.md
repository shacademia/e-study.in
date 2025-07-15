# Advanced Exam Portal System

A comprehensive exam management system with multi-section exams, question banks, scoring in marks, ranking system, and break functionality.

## 🚀 Features

### 📌 1. Question Navigation Panel
- **Numbered Navigation**: Easy navigation through questions (1-20+)
- **Color-coded Status**: 
  - 🟩 Green = Answered
  - 🟨 Yellow = Marked for Later
  - ⬜ Gray = Not Answered
  - 🔵 Blue = Current question
- **Click to Jump**: Navigate directly to any question
- **Fully Responsive**: Works on mobile, tablet, and desktop

### 📌 2. Scoring in Marks
- **Marks-based Scoring**: Each question = 1 mark (configurable)
- **Clear Display**: Shows "7 / 10" instead of percentages
- **Comprehensive Results**: Marks shown in profile, results, and admin panels
- **Performance Tracking**: Track marks across multiple exams

### 📌 3. Student Ranking System
- **Global Rankings**: Based on total marks across all exams
- **Badge System**: 
  - 🥇 Gold for 1st place
  - 🥈 Silver for 2nd place
  - 🥉 Bronze for 3rd place
- **Position Tracking**: Students can see their rank in profile
- **Admin Overview**: View global and exam-specific rankings

### 📌 4. Break Feature
- **Take a Break**: Students can pause during exams
- **Timer Continues**: Main exam timer keeps running
- **Break Timer**: Separate countdown for break duration
- **Auto Return**: Automatically returns to exam when break ends
- **Configurable Limits**: Set maximum break time per exam

### 📌 5. Multi-Section Exam Support
- **Section-based Exams**: Create exams with multiple sections
- **Individual Timing**: Each section can have its own time limit
- **Flexible Navigation**: Switch between sections anytime
- **Progress Tracking**: See progress across all sections
- **Example**: SSC exam with Math, GK, and Reasoning sections

### 📌 6. Draft & Publish Workflow
- **Draft Mode**: Save exams without making them visible
- **Publish Control**: Release exams only when ready
- **Separate Management**: View and edit drafts separately
- **Section Publishing**: Publish sections independently

### 📌 7. Advanced Question Bank System
- **Bulk Management**: Upload/add multiple questions
- **Smart Tagging**: Organize by subject, topic, difficulty
- **Search & Filter**: Find questions quickly
- **Reusable Questions**: Use across multiple exams
- **Bulk Selection**: Select multiple questions at once

## 🛠️ Technology Stack

- **Frontend**: React 18.3.1 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: React Query for server state
- **Routing**: React Router DOM
- **Forms**: React Hook Form with Zod validation
- **Icons**: Lucide React

## 📦 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Quick Start
```bash
# Clone the repository
git clone [repository-url]

# Install dependencies
npm install

# Start the development server
npm run dev
```

### Database Setup
⚠️ **Important**: To use full functionality, you need to enable the database first.

1. **Enable Database**:
   - Go to Project Detail Page → Settings → Database
   - Toggle "Enable Database"
   - Select "EasySite Built-In Database" (recommended)
   - Save settings

2. **Database Tables**: The following tables will be created automatically:
   - `students` - Student information
   - `exams` - Exam definitions
   - `questions` - Question bank
   - `exam_sections` - Exam sections
   - `exam_attempts` - Student exam attempts
   - `student_responses` - Individual question responses
   - `rankings` - Student rankings

## 🎯 Usage

### For Students
1. **Login**: Use student credentials to access the portal
2. **Dashboard**: View available exams and your performance
3. **Take Exam**: 
   - Navigate through questions using the side panel
   - Mark questions for later review
   - Take breaks when needed
   - Submit when complete
4. **View Results**: See detailed results with marks and rankings

### For Admins
1. **Login**: Use admin credentials to access the dashboard
2. **Question Bank**: 
   - Add questions manually or via bulk upload
   - Tag and categorize questions
   - Search and filter questions
3. **Exam Builder**:
   - Create multi-section exams
   - Select questions from the question bank
   - Set timing and instructions
   - Save as draft or publish
4. **Analytics**: View student performance and rankings

## 🔧 Configuration

### Exam Settings
- **Duration**: Set total exam time and per-section timing
- **Marking**: Configure marks per question
- **Breaks**: Set maximum break time allowed
- **Sections**: Create multiple sections with different subjects

### Question Bank Settings
- **Difficulty Levels**: Easy, Medium, Hard
- **Subjects**: Mathematics, Science, General Knowledge, etc.
- **Topics**: Subcategories within subjects
- **Tags**: Custom tags for better organization

## 📊 Features in Detail

### Question Navigation
The question navigation panel provides:
- **Visual Status**: Color-coded question status
- **Quick Access**: Click any question number to jump
- **Progress Tracking**: See answered/marked/remaining questions
- **Mobile Responsive**: Optimized for all screen sizes

### Scoring System
- **Marks Display**: "7 / 10" format instead of percentages
- **Grade Calculation**: A+, A, B, C, D, F based on percentage
- **Performance Analysis**: Detailed breakdown of performance
- **Ranking Integration**: Marks contribute to overall ranking

### Break Functionality
- **Pause Capability**: Students can take breaks during exams
- **Timer Management**: Main timer continues, separate break timer
- **Auto Return**: Automatically returns to exam
- **Usage Tracking**: Track break usage per student

### Multi-Section Exams
- **Section Definition**: Create sections with specific subjects
- **Independent Timing**: Each section can have its own time limit
- **Progress Tracking**: Overall progress across all sections
- **Navigation**: Switch between sections freely

## 🚀 Future Enhancements

- **Real-time Proctoring**: Camera and screen monitoring
- **Advanced Analytics**: Performance trends and insights
- **Mobile App**: Native mobile applications
- **API Integration**: Third-party system integration
- **Bulk Import**: Excel/CSV import for questions and students
- **Automated Grading**: AI-powered essay grading

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🔗 Links

- **Live Demo**: [Your demo URL]
- **Documentation**: [Documentation URL]
- **Support**: [Support URL]

---

**Note**: This is a demonstration application with mock data. To use full functionality with data persistence, enable the database as described in the setup instructions.