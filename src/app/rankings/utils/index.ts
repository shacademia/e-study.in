import { Crown, Medal, Award, Star } from "lucide-react";
import React from "react";

export const getRankBadge = (rank: number): string => {
  switch (rank) {
    case 1: return "🥇";
    case 2: return "🥈";
    case 3: return "🥉";
    default: return `#${rank}`;
  }
};

export const getRankIcon = (rank: number): React.ReactElement => {
  switch (rank) {
    case 1: return React.createElement(Crown, { className: "h-6 w-6 text-yellow-500" });
    case 2: return React.createElement(Medal, { className: "h-6 w-6 text-gray-400" });
    case 3: return React.createElement(Award, { className: "h-6 w-6 text-amber-600" });
    default: return React.createElement(Star, { className: "h-6 w-6 text-gray-500" });
  }
};

export const getInitials = (name: string): string => {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase();
};

export const getCardBorder = (rank: number): string => {
  switch (rank) {
    case 1: return "border-2 border-yellow-300 bg-gradient-to-r from-yellow-50 to-yellow-100";
    case 2: return "border-2 border-gray-300 bg-gradient-to-r from-gray-50 to-gray-100";
    case 3: return "border-2 border-amber-300 bg-gradient-to-r from-amber-50 to-amber-100";
    default: return "border border-gray-200 bg-white";
  }
};

export const getScoreColor = (rank: number): string => {
  switch (rank) {
    case 1: return "text-yellow-600";
    case 2: return "text-gray-600";
    case 3: return "text-amber-600";
    default: return "text-blue-600";
  }
};

export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString();
};

export const calculatePercentage = (score: number, totalScore: number): number => {
  return Math.round((score / totalScore) * 100);
};
