import React from "react";
import { BookOpen } from "lucide-react";
import { NoExamsMessageProps } from "../types";

const NoExamsMessage: React.FC<NoExamsMessageProps> = ({ type }) => {
  const messages = {
    available: {
      title: "No Available Exams",
      description: "There are no published exams available at the moment."
    },
    completed: {
      title: "No Completed Exams",
      description: "You haven't completed any exams yet."
    },
    none: {
      title: "No Exams Available",
      description: "There are no published exams available at the moment."
    }
  };

  const message = messages[type];

  return (
    <div className="text-center py-12">
      <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {message.title}
      </h3>
      <p className="text-gray-600">
        {message.description}
      </p>
    </div>
  );
};

export default NoExamsMessage;
