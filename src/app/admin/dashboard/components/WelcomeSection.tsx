'use client';

import React from 'react';
import { User } from '@/constants/types';

interface WelcomeSectionProps {
  user: User | null;
}

export const WelcomeSection: React.FC<WelcomeSectionProps> = ({ user }) => {
  return (
    <div className="mb-8">
      <h2 className="text-3xl font-bold text-gray-900 mb-2">
        Welcome back, {user?.name}!
      </h2>
      <p className="text-gray-600">
        Here&apos;s an overview of academic progress
      </p>
    </div>
  );
};
