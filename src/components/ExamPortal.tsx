import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import StudentDashboard from './StudentDashboard';
import ExamInterface from './ExamInterface';
import AdminDashboard from './AdminDashboard';
import StudentRankings from './StudentRankings';
import ExamResults from './ExamResults';
import LoginPage from './LoginPage';

const ExamPortal: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50" data-id="70gh7t20r" data-path="src/components/ExamPortal.tsx">
      <Routes data-id="ps7mz1t3u" data-path="src/components/ExamPortal.tsx">
        <Route path="/" element={<Navigate to="/login" data-id="28jkr964v" data-path="src/components/ExamPortal.tsx" />} data-id="ok9re8pvu" data-path="src/components/ExamPortal.tsx" />
        <Route path="/login" element={<LoginPage data-id="dvujgdw1j" data-path="src/components/ExamPortal.tsx" />} data-id="hn8b33mvt" data-path="src/components/ExamPortal.tsx" />
        <Route path="/student" element={<StudentDashboard data-id="e8bcdop8q" data-path="src/components/ExamPortal.tsx" />} data-id="kzep3yw89" data-path="src/components/ExamPortal.tsx" />
        <Route path="/student/exam/:examId" element={<ExamInterface data-id="n73mitc4d" data-path="src/components/ExamPortal.tsx" />} data-id="wrhjb4w18" data-path="src/components/ExamPortal.tsx" />
        <Route path="/student/results/:examId" element={<ExamResults data-id="6978fpnlw" data-path="src/components/ExamPortal.tsx" />} data-id="sqs4vbdsp" data-path="src/components/ExamPortal.tsx" />
        <Route path="/student/rankings" element={<StudentRankings data-id="7jsgnb41t" data-path="src/components/ExamPortal.tsx" />} data-id="s9906baky" data-path="src/components/ExamPortal.tsx" />
        <Route path="/admin" element={<AdminDashboard data-id="dj0u5wrm7" data-path="src/components/ExamPortal.tsx" />} data-id="0aat200yv" data-path="src/components/ExamPortal.tsx" />
      </Routes>
    </div>);

};

export default ExamPortal;