import React from "react";
import { WelcomeSectionProps } from "../types";

const WelcomeSection: React.FC<WelcomeSectionProps> = ({ userName }) => {
  return (
    <div className="mb-6 sm:mb-8 lg:mb-10 px-4 sm:px-0">
      <div className="max-w-4xl">
        <h2 className="text-xl sm:text-2xl lg:text-2xl xl:text-3xl font-bold text-gray-900 mb-2 sm:mb-3 leading-tight break-words">
          Welcome back,{" "}
          <span className="text-blue-600 block sm:inline">
            {userName}!
          </span>
        </h2>
        <p className="text-sm sm:text-base lg:text-lg text-gray-600 leading-relaxed max-w-2xl">
          Here&apos;s an overview of your academic progress
        </p>
      </div>
    </div>
  );
};

export default WelcomeSection;
