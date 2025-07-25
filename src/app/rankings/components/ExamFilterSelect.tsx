import React from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { ExamFilterSelectProps } from "../types";

const ExamFilterSelect: React.FC<ExamFilterSelectProps> = ({
  selectedExam,
  exams,
  onExamFilterChange
}) => {
  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm font-medium text-gray-700">
        Filter by exam:
      </span>
      <Select value={selectedExam} onValueChange={onExamFilterChange}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="All Exams" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Exams</SelectItem>
          {exams.map((exam) => (
            <SelectItem key={exam.id} value={exam.id}>
              {exam.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default ExamFilterSelect;
