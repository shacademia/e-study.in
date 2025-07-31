// components/rankings/GlobalRankings.tsx
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RefreshCw, Medal, Crown, Award, User, Users, Eye, TrendingUp } from 'lucide-react';

interface GlobalRanking {
  rank: number;
  userId: string;
  userName: string;
  globalAverage: number;
  totalExamsCompleted: number;
  totalScore: number;
  totalMaxMarks: number;
  averagePerExam: number;
}

interface GlobalRankingsResponse {
  success: boolean;
  data: GlobalRanking[];
  pagination:{
    currentPage: number,
    itemsPerPage: number,
    totalItems: number,
    totalPages: number,
    hasNextPage: boolean,
    hasPreviousPage: boolean
  };
  timestamp: string;
}

export default function GlobalRankings() {
  const [rankings, setRankings] = useState<GlobalRanking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [personalUserId, setPersonalUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchGlobalRankings();
  }, []);

  const fetchGlobalRankings = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/rankings/global', {
       credentials: 'include',
      });

      const data: GlobalRankingsResponse = await response.json();
      
      if (data.success) {
        setRankings(data.data);
      } else {
        setError('Failed to fetch global rankings');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getMedalIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Award className="h-6 w-6 text-orange-500" />;
      default:
        return <div className="h-6 w-6 flex items-center justify-center text-gray-600 font-bold">#{rank}</div>;
    }
  };

  const getRankCardStyle = (rank: number, isPersonal: boolean) => {
    let baseStyle = "transition-all duration-200 hover:shadow-sm ";
    
    if (isPersonal) {
      baseStyle += "bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200 ";
    } else if (rank === 1) {
      baseStyle += "bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200 ";
    } else if (rank === 2) {
      baseStyle += "bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200 ";
    } else if (rank === 3) {
      baseStyle += "bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200 ";
    } else {
      baseStyle += "bg-white border-gray-100 ";
    }
    
    return baseStyle;
  };

  const isPersonalRank = (userId: string) => {
    // You can implement logic to identify personal rank
    // For now, you might want to get this from JWT token
    return personalUserId === userId;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-9 w-20" />
        </div>
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertDescription className="text-red-800 flex items-center justify-between">
          <span>{error}</span>
          <Button 
            onClick={fetchGlobalRankings} 
            variant="outline" 
            size="sm"
          >
            Try Again
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Users className="h-5 w-5 text-teal-600" />
            Global Rankings
          </h3>
          <p className="text-sm text-gray-600 mt-1">Top performers across all subjects and exams</p>
        </div>
        <Button onClick={fetchGlobalRankings} variant="outline" size="sm" className="hover:bg-teal-50">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Table Header */}
      <div className="bg-gray-50 rounded-lg p-4 border">
        <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-600">
          <div className="col-span-1 text-center">Rank</div>
          <div className="col-span-4">User</div>
          <div className="col-span-2 text-center">Solved</div>
          <div className="col-span-2 text-center">Score</div>
          <div className="col-span-2 text-center">Average</div>
          <div className="col-span-1 text-center">Action</div>
        </div>
      </div>

      {/* Rankings List */}
      <div className="space-y-2">
        {rankings.map((ranking) => {
          const isPersonal = isPersonalRank(ranking.userId);
          
          return (
            <Card 
              key={ranking.userId} 
              className={`transition-all duration-200 hover:shadow-md hover:bg-gray-50 ${
                isPersonal ? 'bg-teal-50 border-teal-200 shadow-sm' : 'bg-white border-gray-200'
              }`}
            >
              <CardContent className="p-4">
                <div className="grid grid-cols-12 gap-4 items-center">
                  {/* Rank */}
                  <div className="col-span-1 text-center">
                    <div className="flex justify-center">
                      {ranking.rank <= 3 ? (
                        getMedalIcon(ranking.rank)
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                          <span className="text-sm font-semibold text-gray-600">{ranking.rank}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* User Info */}
                  <div className="col-span-4 flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${ranking.userName}`} />
                      <AvatarFallback className="bg-teal-100 text-teal-700">
                        {ranking.userName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-gray-900">
                          {ranking.userName}
                        </h4>
                        {isPersonal && (
                          <Badge variant="default" className="bg-teal-600 text-xs">
                            <User className="h-3 w-3 mr-1" />
                            You
                          </Badge>
                        )}
                        {ranking.rank <= 3 && (
                          <Badge 
                            variant="secondary" 
                            className={`text-xs ${
                              ranking.rank === 1 ? "bg-yellow-100 text-yellow-800" :
                              ranking.rank === 2 ? "bg-gray-100 text-gray-800" :
                              "bg-orange-100 text-orange-800"
                            }`}
                          >
                            Top {ranking.rank}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">
                        {ranking.totalExamsCompleted} exams completed
                      </p>
                    </div>
                  </div>

                  {/* Solved */}
                  <div className="col-span-2 text-center">
                    <div className="font-semibold text-gray-900">
                      {ranking.totalExamsCompleted}
                    </div>
                    <div className="text-xs text-gray-500">exams</div>
                  </div>

                  {/* Score */}
                  <div className="col-span-2 text-center">
                    <div className="font-semibold text-gray-900">
                      {ranking.totalScore}
                    </div>
                    <div className="text-xs text-gray-500">
                      /{ranking.totalMaxMarks} pts
                    </div>
                  </div>

                  {/* Average */}
                  <div className="col-span-2 text-center">
                    <div className="text-lg font-bold text-teal-600">
                      {ranking.globalAverage}%
                    </div>
                    <div className="text-xs text-gray-500">
                      {ranking.averagePerExam}% avg
                    </div>
                  </div>

                  {/* Action */}
                  <div className="col-span-1 text-center">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-teal-600 hover:text-teal-700 hover:bg-teal-50"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-3 col-span-12">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        ranking.rank === 1 ? 'bg-yellow-500' :
                        ranking.rank === 2 ? 'bg-gray-400' :
                        ranking.rank === 3 ? 'bg-orange-500' :
                        isPersonal ? 'bg-teal-600' : 'bg-teal-500'
                      }`}
                      style={{ width: `${Math.min(ranking.globalAverage, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <Card className="bg-gradient-to-br from-teal-50 to-teal-100 border-teal-200">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-teal-600 mb-1">{rankings.length}</div>
            <p className="text-sm text-teal-700 font-medium">Total Participants</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-1">
              {rankings.length > 0 ? 
                Math.round(rankings.reduce((sum, r) => sum + r.globalAverage, 0) / rankings.length) : 0}%
            </div>
            <p className="text-sm text-blue-700 font-medium">Average Score</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-1">
              {rankings[0]?.globalAverage || 0}%
            </div>
            <p className="text-sm text-green-700 font-medium">Highest Score</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
