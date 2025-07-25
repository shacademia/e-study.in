import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { User } from "lucide-react";
import { ProfilePerformanceProps } from "../types";

const ProfilePerformance: React.FC<ProfilePerformanceProps> = ({
  userName,
  userEmail,
  stats
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <User className="h-5 w-5 mr-2" />
          Profile & Performance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="font-semibold text-lg">{userName}</p>
            <p className="text-sm text-gray-600">Email: {userEmail}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="text-xl font-bold text-blue-600">
                {stats?.totalExamsAttended || 0}
              </p>
              <p className="text-sm text-gray-600">Attended</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-xl font-bold text-green-600">
                {Math.round(stats?.averageScore || 0)}
              </p>
              <p className="text-sm text-gray-600">Avg Score</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Average Performance</span>
              <span className="font-medium">
                {Math.round(stats?.averageScore || 0)}%
              </span>
            </div>
            <Progress value={stats?.averageScore || 0} className="h-2" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfilePerformance;
