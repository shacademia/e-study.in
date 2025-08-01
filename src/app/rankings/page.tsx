// app/rankings/page.tsx
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
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.back()}
                                className="mr-4"
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back
                            </Button>
                            <Trophy className="h-8 w-8 text-teal-600 mr-3" />
                            <h1 className="text-xl font-bold text-gray-900">Rankings Dashboard</h1>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-2">
                                Performance Rankings
                            </h2>
                            <p className="text-gray-600">
                                Track your performance and see how you rank against other participants
                            </p>
                        </div>
                        <div className="hidden md:flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
                                <span>Active</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                <span>Top Performer</span>
                            </div>
                        </div>
                    </div>
                </div>

                <Card className="shadow-sm border-0 bg-white">
                    <CardContent className="p-6">
                        <Tabs defaultValue="global" className="w-full">
                            <TabsList className="grid w-full grid-cols-3 mb-6 h-12">
                                <TabsTrigger
                                    value="global"
                                    className="flex items-center gap-2 text-sm font-medium"
                                >
                                    <Users className="h-4 w-4" />
                                    Global Rankings
                                </TabsTrigger>
                                <TabsTrigger
                                    value="individual"
                                    className="flex items-center gap-2 text-sm font-medium"
                                >
                                    <Trophy className="h-4 w-4" />
                                    Exam Rankings
                                </TabsTrigger>
                                <TabsTrigger
                                    value="subject"
                                    className="flex items-center gap-2 text-sm font-medium"
                                >
                                    <BookOpen className="h-4 w-4" />
                                    Subject Rankings
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
