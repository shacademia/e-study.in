import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCardProps } from "../types";

const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, icon, colorScheme }) => {
  const colorSchemes = {
    blue: {
      bg: "bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200",
      text: "text-blue-600",
      iconBg: "bg-blue-500"
    },
    green: {
      bg: "bg-gradient-to-r from-green-50 to-green-100 border-green-200",
      text: "text-green-600",
      iconBg: "bg-green-500"
    },
    purple: {
      bg: "bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200",
      text: "text-purple-600",
      iconBg: "bg-purple-500"
    },
    orange: {
      bg: "bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200",
      text: "text-orange-500",
      iconBg: "bg-orange-500"
    }
  };

  const colors = colorSchemes[colorScheme];

  return (
    <Card className={colors.bg}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className={`text-sm font-medium ${colors.text}`}>
          {title}
        </CardTitle>
        <div className={`h-8 w-8 ${colors.iconBg} rounded-full flex items-center justify-center`}>
          <div className="h-4 w-4 text-white">
            {icon}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${colors.text}`}>
          {value}
        </div>
        <p className={`text-xs ${colors.text} mt-1`}>
          {subtitle}
        </p>
      </CardContent>
    </Card>
  );
};

export default StatCard;
