"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trophy, Medal, Award, ArrowLeft, BookOpen, Crown, Star } from "lucide-react";
import { useAuth } from '@/hooks/useApiAuth';
import { useExams, useRankings } from '@/hooks/useApiServices';
import { Exam, StudentRanking } from '@/constants/types';

const StudentRankings: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();

  const { getAllExams } = useExams();
  const { getExamRankings } = useRankings();

  const [rankings, setRankings] = useState<StudentRanking[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExam, setSelectedExam] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const examData = await getAllExams() as Exam[];
        setExams(examData.filter((exam) => exam.isPublished));
        if (selectedExam === 'all' && examData.length > 0) {
          const allRankings = await Promise.all(
            examData.map(exam => getExamRankings(exam.id))
          );
          setRankings(allRankings.flat() as StudentRanking[]);
        } else if (selectedExam !== 'all') {
          const examRankings = await getExamRankings(selectedExam);
          setRankings(examRankings as StudentRanking[]);
        }
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [selectedExam, getAllExams, getExamRankings]);

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return "🥇";
      case 2:
        return "🥈";
      case 3:
        return "🥉";
      default:
        return `#${rank}`;
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Award className="h-6 w-6 text-amber-600" />;
      default:
        return <Star className="h-6 w-6 text-gray-500" />;
    }
  };

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase();
  };

  const getCardBorder = (rank: number) => {
    switch (rank) {
      case 1:
        return "border-2 border-yellow-300 bg-gradient-to-r from-yellow-50 to-yellow-100";
      case 2:
        return "border-2 border-gray-300 bg-gradient-to-r from-gray-50 to-gray-100";
      case 3:
        return "border-2 border-amber-300 bg-gradient-to-r from-amber-50 to-amber-100";
      default:
        return "border border-gray-200 bg-white";
    }
  };

  const getScoreColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "text-yellow-600";
      case 2:
        return "text-gray-600";
      case 3:
        return "text-amber-600";
      default:
        return "text-blue-600";
    }
  };

  // Group rankings by exam name
  const rankingsByExam = rankings.reduce((acc, ranking) => {
    if (!acc[ranking.examName]) {
      acc[ranking.examName] = [];
    }
    acc[ranking.examName].push(ranking);
    return acc;
  }, {} as Record<string, StudentRanking[]>);

  // Update the sorting to use totalScore instead of score
  const topRankings = rankings
    .sort((a, b) => b.totalScore - a.totalScore)
    .slice(0, 10)
    .map((ranking, index) => ({ ...ranking, rank: index + 1 }));

  if (loading) {
    return (
      <div
        className="flex items-center justify-center min-h-screen"
        data-id="94f124uy7"
        data-path="src/components/StudentRankings.tsx"
      >
        Loading...
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-gray-50"
      data-id="snfbkx5lc"
      data-path="src/components/StudentRankings.tsx"
    >
      {/* Header */}
      <header
        className="bg-white shadow-sm border-b"
        data-id="5amwsmlnc"
        data-path="src/components/StudentRankings.tsx"
      >
        <div
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
          data-id="todwxsiu2"
          data-path="src/components/StudentRankings.tsx"
        >
          <div
            className="flex justify-between items-center h-16"
            data-id="w9rtt8hqy"
            data-path="src/components/StudentRankings.tsx"
          >
            <div
              className="flex items-center"
              data-id="2p1m2yqcj"
              data-path="src/components/StudentRankings.tsx"
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (user?.role === "admin") {
                    router.push("/admin/dashboard");
                  } else {
                    router.push("/student/dashboard");
                  }
                }}
                className="mr-4 cursor-pointer"
                data-id="0yjyp3nuq"
                data-path="src/components/StudentRankings.tsx"
              >
                <ArrowLeft
                  className="h-4 w-4 mr-2"
                  data-id="8ebajbj9d"
                  data-path="src/components/StudentRankings.tsx"
                />
                Back
              </Button>
              <Trophy
                className="h-8 w-8 text-blue-600 mr-3"
                data-id="msicabf3k"
                data-path="src/components/StudentRankings.tsx"
              />
              <h1
                className="text-xl font-bold text-gray-900"
                data-id="rke1h7a3b"
                data-path="src/components/StudentRankings.tsx"
              >
                Student Rankings
              </h1>
            </div>
            <div
              className="flex items-center space-x-4"
              data-id="6aeczppks"
              data-path="src/components/StudentRankings.tsx"
            >
              <div
                className="flex items-center space-x-2"
                data-id="9425v6rtr"
                data-path="src/components/StudentRankings.tsx"
              >
                <span
                  className="text-sm font-medium text-gray-700"
                  data-id="00gm5qhis"
                  data-path="src/components/StudentRankings.tsx"
                >
                  Filter by exam:
                </span>
                <Select
                  value={selectedExam}
                  onValueChange={setSelectedExam}
                  data-id="gm5drwit5"
                  data-path="src/components/StudentRankings.tsx"
                >
                  <SelectTrigger
                    className="w-48"
                    data-id="9suh7f67x"
                    data-path="src/components/StudentRankings.tsx"
                  >
                    <SelectValue
                      placeholder="All Exams"
                      data-id="pzph24oqd"
                      data-path="src/components/StudentRankings.tsx"
                    />
                  </SelectTrigger>
                  <SelectContent
                    data-id="9op9nhieu"
                    data-path="src/components/StudentRankings.tsx"
                  >
                    <SelectItem
                      value="all"
                      data-id="v20zof3ch"
                      data-path="src/components/StudentRankings.tsx"
                    >
                      All Exams
                    </SelectItem>
                    {exams.map((exam) => (
                      <SelectItem
                        key={exam.id}
                        value={exam.id}
                        data-id="iqi2ymig7"
                        data-path="src/components/StudentRankings.tsx"
                      >
                        {exam.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        data-id="8vqe1jzle"
        data-path="src/components/StudentRankings.tsx"
      >
        <div
          className="space-y-8"
          data-id="0fthv94dt"
          data-path="src/components/StudentRankings.tsx"
        >
          {/* Top 10 Rankings - Overall */}
          {selectedExam === "all" && (
            <div
              data-id="8xv5a5w8x"
              data-path="src/components/StudentRankings.tsx"
            >
              <Card
                className="mb-6"
                data-id="3oll96jrl"
                data-path="src/components/StudentRankings.tsx"
              >
                <CardHeader
                  data-id="e2iwnj0dm"
                  data-path="src/components/StudentRankings.tsx"
                >
                  <CardTitle
                    className="flex items-center"
                    data-id="nmuh2nodu"
                    data-path="src/components/StudentRankings.tsx"
                  >
                    <Trophy
                      className="h-5 w-5 mr-2"
                      data-id="az8ktz401"
                      data-path="src/components/StudentRankings.tsx"
                    />
                    🏆 Top 10 Rankers - Overall
                  </CardTitle>
                  <CardDescription
                    data-id="qib70ic4r"
                    data-path="src/components/StudentRankings.tsx"
                  >
                    Best performers across all exams
                  </CardDescription>
                </CardHeader>
                <CardContent
                  data-id="xneortjop"
                  data-path="src/components/StudentRankings.tsx"
                >
                  <div
                    className="space-y-3"
                    data-id="uppl5mmvz"
                    data-path="src/components/StudentRankings.tsx"
                  >
                    {topRankings.map((ranking) => (
                      <div
                        key={`${ranking.userId}-${ranking.rank}`}
                        className={`flex items-center justify-between p-4 rounded-lg transition-all duration-200 hover:shadow-md ${getCardBorder(
                          ranking.rank
                        )} ${ranking.userId === user?.id
                            ? "ring-2 ring-blue-400"
                            : ""
                          }`}
                        data-id="sfwsh8wyw"
                        data-path="src/components/StudentRankings.tsx"
                      >
                        <div
                          className="flex items-center space-x-4"
                          data-id="c4x949xw6"
                          data-path="src/components/StudentRankings.tsx"
                        >
                          <div
                            className="flex-shrink-0 text-2xl font-bold"
                            data-id="8msbt8j4d"
                            data-path="src/components/StudentRankings.tsx"
                          >
                            {getRankBadge(ranking.rank)}
                          </div>
                          <div
                            className="flex-shrink-0"
                            data-id="yfo9e3em2"
                            data-path="src/components/StudentRankings.tsx"
                          >
                            {getRankIcon(ranking.rank)}
                          </div>
                          <Avatar
                            className="h-10 w-10"
                            data-id="oxbjbzivq"
                            data-path="src/components/StudentRankings.tsx"
                          >
                            <AvatarImage
                              src={`https://api.dicebear.com/6.x/initials/svg?seed=${ranking.userName}`}
                              data-id="tzaejgi65"
                              data-path="src/components/StudentRankings.tsx"
                            />
                            <AvatarFallback
                              data-id="yyibx5klb"
                              data-path="src/components/StudentRankings.tsx"
                            >
                              {getInitials(ranking.userName)}
                            </AvatarFallback>
                          </Avatar>
                          <div
                            data-id="tqr8r5byh"
                            data-path="src/components/StudentRankings.tsx"
                          >
                            <div className="font-medium text-gray-900 flex items-center flex-wrap gap-2">
                              <span>{ranking.userName}</span>
                              {ranking.userId === user?.id && (
                                <Badge variant="secondary">You</Badge>
                              )}
                              {ranking.rank <= 3 && (
                                <Badge
                                  variant="outline"
                                  className={`ml-2 ${ranking.rank === 1
                                      ? "border-yellow-400 text-yellow-600"
                                      : ranking.rank === 2
                                        ? "border-gray-400 text-gray-600"
                                        : "border-amber-400 text-amber-600"
                                    }`}
                                >
                                  {ranking.rank === 1
                                    ? "Gold"
                                    : ranking.rank === 2
                                      ? "Silver"
                                      : "Bronze"}
                                </Badge>
                              )}
                            </div>
                            <p
                              className="text-sm text-gray-600"
                              data-id="nrsa53qtb"
                              data-path="src/components/StudentRankings.tsx"
                            >
                              {ranking.examName} •{" "}
                              {new Date(
                                ranking.completedAt
                              ).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div
                          className="text-right"
                          data-id="qf83vvkdx"
                          data-path="src/components/StudentRankings.tsx"
                        >
                          <p
                            className={`text-xl font-bold ${getScoreColor(
                              ranking.rank
                            )}`}
                            data-id="1nobg5xrh"
                            data-path="src/components/StudentRankings.tsx"
                          >
                            {ranking.score} pts
                          </p>
                          <p
                            className="text-sm text-gray-600"
                            data-id="34b8hzcx3"
                            data-path="src/components/StudentRankings.tsx"
                          >
                            {ranking.percentage}% ({ranking.score}/
                            {ranking.totalMarks})
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Exam-specific Rankings */}
          {Object.entries(rankingsByExam).map(([examName, examRankings]) => (
            <div
              key={examName}
              data-id="xfviiycbt"
              data-path="src/components/StudentRankings.tsx"
            >
              <Card
                data-id="gliv4mruc"
                data-path="src/components/StudentRankings.tsx"
              >
                <CardHeader
                  data-id="wullbuebe"
                  data-path="src/components/StudentRankings.tsx"
                >
                  <CardTitle
                    className="flex items-center"
                    data-id="ho4lmf5e4"
                    data-path="src/components/StudentRankings.tsx"
                  >
                    <BookOpen
                      className="h-5 w-5 mr-2"
                      data-id="d2px0rwjd"
                      data-path="src/components/StudentRankings.tsx"
                    />
                    {examName}
                  </CardTitle>
                  <CardDescription
                    data-id="ehrlxpn3w"
                    data-path="src/components/StudentRankings.tsx"
                  >
                    Rankings for {examRankings.length} students • Real-time
                    updates
                  </CardDescription>
                </CardHeader>
                <CardContent
                  data-id="j2xp272qa"
                  data-path="src/components/StudentRankings.tsx"
                >
                  <div
                    className="space-y-3"
                    data-id="z7c44f6zf"
                    data-path="src/components/StudentRankings.tsx"
                  >
                    {examRankings
                      .sort((a, b) => a.rank - b.rank)
                      .slice(0, 10)
                      .map((ranking) => (
                        <div
                          key={ranking.id}
                          className={`flex items-center justify-between p-4 rounded-lg transition-all duration-200 hover:shadow-md ${getCardBorder(
                            ranking.rank
                          )} ${ranking.userId === user?.id
                              ? "ring-2 ring-blue-400"
                              : ""
                            }`}
                          data-id="hsbhrxaeo"
                          data-path="src/components/StudentRankings.tsx"
                        >
                          <div
                            className="flex items-center space-x-4"
                            data-id="d8cto9djx"
                            data-path="src/components/StudentRankings.tsx"
                          >
                            <div
                              className="flex-shrink-0 text-2xl font-bold"
                              data-id="2m6sx2exq"
                              data-path="src/components/StudentRankings.tsx"
                            >
                              {getRankBadge(ranking.rank)}
                            </div>
                            <div
                              className="flex-shrink-0"
                              data-id="4k0wye3cp"
                              data-path="src/components/StudentRankings.tsx"
                            >
                              {getRankIcon(ranking.rank)}
                            </div>
                            <Avatar
                              className="h-10 w-10"
                              data-id="p9mwh8lty"
                              data-path="src/components/StudentRankings.tsx"
                            >
                              <AvatarImage
                                src={`https://api.dicebear.com/6.x/initials/svg?seed=${ranking.userName}`}
                                data-id="ikg0wjbvh"
                                data-path="src/components/StudentRankings.tsx"
                              />
                              <AvatarFallback
                                data-id="b2kzbbhom"
                                data-path="src/components/StudentRankings.tsx"
                              >
                                {getInitials(ranking.userName)}
                              </AvatarFallback>
                            </Avatar>
                            <div
                              data-id="m762mw3zw"
                              data-path="src/components/StudentRankings.tsx"
                            >
                              <div
                                className="font-medium text-gray-900 flex items-center"
                                data-id="i5ebr66we"
                                data-path="src/components/StudentRankings.tsx"
                              >
                                {ranking.userName}
                                {ranking.userId === user?.id && (
                                  <Badge
                                    variant="secondary"
                                    className="ml-2"
                                    data-id="zzflqz5gy"
                                    data-path="src/components/StudentRankings.tsx"
                                  >
                                    You
                                  </Badge>
                                )}
                                {ranking.rank <= 3 && (
                                  <Badge
                                    variant="outline"
                                    className={`ml-2 ${ranking.rank === 1
                                        ? "border-yellow-400 text-yellow-600"
                                        : ranking.rank === 2
                                          ? "border-gray-400 text-gray-600"
                                          : "border-amber-400 text-amber-600"
                                      }`}
                                    data-id="2r11u7rii"
                                    data-path="src/components/StudentRankings.tsx"
                                  >
                                    {ranking.rank === 1
                                      ? "Gold"
                                      : ranking.rank === 2
                                        ? "Silver"
                                        : "Bronze"}
                                  </Badge>
                                )}
                              </div>
                              <p
                                className="text-sm text-gray-600"
                                data-id="6eykcovqu"
                                data-path="src/components/StudentRankings.tsx"
                              >
                                Completed on{" "}
                                {new Date(
                                  ranking.completedAt
                                ).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div
                            className="text-right"
                            data-id="rrugwevoj"
                            data-path="src/components/StudentRankings.tsx"
                          >
                            <p
                              className={`text-xl font-bold ${getScoreColor(
                                ranking.rank
                              )}`}
                              data-id="2f8rpyk17"
                              data-path="src/components/StudentRankings.tsx"
                            >
                              {ranking.score} pts
                            </p>
                            <p
                              className="text-sm text-gray-600"
                              data-id="yeuj31f23"
                              data-path="src/components/StudentRankings.tsx"
                            >
                              {ranking.percentage}% ({ranking.score}/
                              {ranking.totalMarks})
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}

          {/* No Rankings Available */}
          {Object.keys(rankingsByExam).length === 0 && (
            <div
              className="text-center py-12"
              data-id="qd71c8ubp"
              data-path="src/components/StudentRankings.tsx"
            >
              <Trophy
                className="h-12 w-12 text-gray-400 mx-auto mb-4"
                data-id="vh8r7ff4i"
                data-path="src/components/StudentRankings.tsx"
              />
              <h3
                className="text-lg font-medium text-gray-900 mb-2"
                data-id="wmrmi0wys"
                data-path="src/components/StudentRankings.tsx"
              >
                No Rankings Available
              </h3>
              <p
                className="text-gray-600"
                data-id="rub83hgso"
                data-path="src/components/StudentRankings.tsx"
              >
                {selectedExam === "all"
                  ? "Complete some exams to see rankings here."
                  : "No students have completed this exam yet."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentRankings;
