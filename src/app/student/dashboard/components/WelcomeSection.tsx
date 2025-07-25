import React from "react";
import { WelcomeSectionProps } from "../types";

const WelcomeSection: React.FC<WelcomeSectionProps> = ({ userName }) => {
  return (
    <div className="mb-8">
      <h2 className="text-3xl font-bold text-gray-900 mb-2">
        Welcome back, {userName}!
      </h2>
      <p className="text-gray-600">
        Here&apos;s an overview of your academic progress
      </p>
    </div>
  );
};

export default WelcomeSection;
