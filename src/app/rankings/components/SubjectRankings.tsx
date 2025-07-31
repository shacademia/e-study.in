// components/rankings/SubjectRankings.tsx
"use client";

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BookOpen, Medal, Crown, Award, User, RefreshCw, Trophy, Eye } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface SubjectRanking {
  rank: number;
  userId: string;
  userName: string;
  subjectAverage: number;
  totalExams: number;
  totalScore: number;
  totalMaxMarks: number;
}

interface Subject {
  value: string;
  label: string;
}
type PersonalRank = SubjectRanking & { totalParticipants: number };

interface SubjectRankingResponse {
  success: boolean;
  data: {
    subject: string;
    top5: SubjectRanking[];
    personalRank: PersonalRank | null;
    totalParticipants: number;
  };
  totalParticipants: number,
}

export default function SubjectRankings() {
  const [rankings, setRankings] = useState<SubjectRanking[]>([]);
  const [personalRank, setPersonalRank] = useState<PersonalRank | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubjectRankings = useCallback(async () => {
    if (!selectedSubject) return;

    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/rankings/subject?subject=${encodeURIComponent(selectedSubject)}`, {
        credentials: 'include',
      });

      const data: SubjectRankingResponse = await response.json();

      if (data.success) {
        setRankings(data.data.top5 || []);
        setPersonalRank(data.data.personalRank);
      } else {
        setError('Failed to fetch subject rankings');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  }, [selectedSubject]);



  useEffect(() => {
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (selectedSubject) {
      fetchSubjectRankings();
    }
  }, [fetchSubjectRankings, selectedSubject]);

  const fetchSubjects = async () => {
    try {
      setLoadingSubjects(true);
      const response = await fetch('/api/subjects',
        {
          method: 'GET',
          credentials: 'include',
        }
      );
      const data = await response.json();

      if (data.success) {
        setSubjects(data.data);
        // Auto-select first subject if available
        if (data.data.length > 0) {
          setSelectedSubject(data.data[0].value);
        }
      } else {
        setError('Failed to fetch subjects');
      }
    } catch (err) {
      setError('Failed to load subjects');
      console.error('Failed to fetch subjects:', err);
    } finally {
      setLoadingSubjects(false);
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
      baseStyle += "bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200 ";
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

  if (loadingSubjects) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-9 w-64" />
        </div>
        <Skeleton className="h-32 w-full rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-purple-600" />
            Subject Rankings
          </h3>
          <p className="text-sm text-gray-600 mt-1">Top 5 performers + your personal rank per subject</p>
        </div>

        {/* Subject Selector */}
        <div className="w-full sm:w-64">
          <Select value={selectedSubject} onValueChange={setSelectedSubject} disabled={subjects.length === 0}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder={subjects.length === 0 ? "No subjects available" : "Select a subject..."} />
            </SelectTrigger>
            <SelectContent>
              {subjects.map((subject) => (
                <SelectItem key={subject.value} value={subject.value}>
                  {subject.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* No Subjects Available */}
      {subjects.length === 0 ? (
        <Card className="p-6 text-center">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">No subjects found in the database</p>
          <Button onClick={fetchSubjects} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Reload Subjects
          </Button>
        </Card>
      ) : !selectedSubject ? (
        <Card className="p-6 text-center">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Select a subject to view rankings</p>
        </Card>
      ) : loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      ) : error ? (
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-800 flex items-center justify-between">
            <span>{error}</span>
            <Button
              onClick={fetchSubjectRankings}
              variant="outline"
              size="sm"
            >
              Try Again
            </Button>
          </AlertDescription>
        </Alert>
      ) : (
        <div className="space-y-4">
          {/* Selected Subject Header */}
          <div className="text-center bg-gradient-to-r from-purple-500 to-blue-600 text-white py-4 rounded-lg">
            <h4 className="text-lg font-bold flex items-center justify-center gap-2">
              <BookOpen className="h-5 w-5" />
              {selectedSubject}
            </h4>
            <p className="text-purple-100 mt-1 text-sm">
              Top performers across all {selectedSubject} exams
            </p>
          </div>

          {/* Top 5 Rankings */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Trophy className="h-5 w-5 text-teal-600" />
              Top 5 in {selectedSubject}
            </h4>
            
            {rankings.length === 0 ? (
              <Card className="p-8 text-center">
                <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">No rankings found for {selectedSubject}</p>
              </Card>
            ) : (
              <>
                {/* Table Header */}
                <div className="bg-gray-50 rounded-lg p-4 border">
                  <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-600">
                    <div className="col-span-1 text-center">Rank</div>
                    <div className="col-span-4">User</div>
                    <div className="col-span-2 text-center">Exams</div>
                    <div className="col-span-2 text-center">Score</div>
                    <div className="col-span-2 text-center">Average</div>
                    <div className="col-span-1 text-center">View</div>
                  </div>
                </div>

                {/* Rankings */}
                <div className="space-y-2">
                  {rankings.map((ranking) => (
                    <Card
                      key={ranking.userId}
                      className="transition-all duration-200 hover:shadow-md hover:bg-gray-50 bg-white border-gray-200"
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
                              <AvatarFallback className="bg-purple-100 text-purple-700">
                                {ranking.userName.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold text-gray-900">
                                  {ranking.userName}
                                </h4>
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
                                Subject specialist
                              </p>
                            </div>
                          </div>

                          {/* Exams */}
                          <div className="col-span-2 text-center">
                            <div className="font-semibold text-gray-900">
                              {ranking.totalExams}
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
                            <div className="text-lg font-bold text-purple-600">
                              {ranking.subjectAverage}%
                            </div>
                          </div>

                          {/* Action */}
                          <div className="col-span-1 text-center">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Personal Rank */}
          {personalRank && (
            <div className="mt-6">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <User className="h-4 w-4 text-purple-600" />
                Your {selectedSubject} Performance
              </h4>
              <Card className={getRankCardStyle(personalRank.rank, true)}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        {getMedalIcon(personalRank.rank)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-gray-900">
                            {personalRank.userName}
                          </h4>
                          <Badge variant="default" className="bg-purple-600 text-xs">
                            <User className="h-3 w-3 mr-1" />
                            You
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600">
                          Rank {personalRank.rank} of {personalRank.totalParticipants} in {selectedSubject}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-purple-600">
                        {personalRank.subjectAverage}%
                      </div>
                      <p className="text-xs text-gray-500">
                        Subject Average
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
