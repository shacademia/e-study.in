"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import GlobalRankings from './components/GlobalRankings';
import IndividualExamRankings from './components/IndividualExamRankings';
import SubjectRankings from './components/SubjectRankings';
import { Trophy, Users, BookOpen, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function RankingsPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
                    <div className="flex justify-between items-center h-14 sm:h-16">
                        <div className="flex items-center min-w-0 flex-1">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.back()}
                                className="mr-2 sm:mr-4 flex-shrink-0 text-xs sm:text-sm px-2 sm:px-3 bg-gray-100"
                            >
                                <ArrowLeft className="h-2 w-2 sm:h-4 sm:w-4 mr-0 sm:mr-2" />
                                Back
                            </Button>
                            <Trophy className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-teal-600 mr-2 sm:mr-3 flex-shrink-0" />
                            <h1 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 truncate">
                                <span className="hidden sm:inline">Rankings Dashboard</span>
                                <span className="sm:hidden">Rankings</span>
                            </h1>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 lg:py-8">
                <div className="mb-6 sm:mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0">
                        <div className="min-w-0 flex-1">
                            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1 sm:mb-2 text-center sm:text-left">
                                Performance Rankings
                            </h2>
                            <p className="text-sm sm:text-base text-gray-600 leading-relaxed text-center sm:text-left">
                                <span className="hidden sm:inline">Track your performance and see how you rank against other participants</span>
                                <span className="sm:hidden">Track your performance and ranking</span>
                            </p>
                        </div>
                        
                        {/* Big screen */}
                        <div className="hidden lg:flex items-center space-x-4 text-sm text-gray-500 flex-shrink-0">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
                                <span>Active</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                <span>Top Performer</span>
                            </div>
                        </div>

                        {/* Mobile */}
                        <div className="flex sm:hidden items-center justify-center space-x-4 text-xs text-gray-500 pt-2 border-t border-gray-100">
                            <div className="flex items-center gap-1.5">
                                <div className="w-2.5 h-2.5 bg-teal-500 rounded-full"></div>
                                <span>Active</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-2.5 h-2.5 bg-yellow-500 rounded-full"></div>
                                <span>Top Performer</span>
                            </div>
                        </div>
                    </div>
                </div>

                <Card className="shadow-sm border-0 bg-white">
                    <CardContent className="p-3 sm:p-4 lg:p-6">
                        <Tabs defaultValue="global" className="w-full">
                            <TabsList className="grid w-full grid-cols-3 mb-4 sm:mb-6 h-10 sm:h-12">
                                <TabsTrigger
                                    value="global"
                                    className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium cursor-pointer px-2 sm:px-3"
                                >
                                    <Users className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                                    <span className="hidden sm:inline">Global Rankings</span>
                                    <span className="sm:hidden">Global</span>
                                </TabsTrigger>
                                <TabsTrigger
                                    value="individual"
                                    className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium cursor-pointer px-2 sm:px-3"
                                >
                                    <Trophy className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                                    <span className="hidden sm:inline">Exam Rankings</span>
                                    <span className="sm:hidden">Exams</span>
                                </TabsTrigger>
                                <TabsTrigger
                                    value="subject"
                                    className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium cursor-pointer px-2 sm:px-3"
                                >
                                    <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                                    <span className="hidden sm:inline">Subject Rankings</span>
                                    <span className="sm:hidden">Subjects</span>
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="global" className="mt-0">
                                <GlobalRankings />
                            </TabsContent>

                            <TabsContent value="individual" className="mt-0">
                                <IndividualExamRankings />
                            </TabsContent>

                            <TabsContent value="subject" className="mt-0">
                                <SubjectRankings />
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
