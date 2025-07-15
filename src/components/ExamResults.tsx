import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle, ArrowLeft, Trophy, Clock, BookOpen } from 'lucide-react';
import { useAuth } from '../hooks/useMockAuth.tsx';
import { mockDataService, Exam, Submission } from '../services/mockData.ts';

const ExamResults: React.FC = () => {
  const { examId } = useParams<{examId: string;}>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [exam, setExam] = useState<Exam | null>(null);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!examId || !user) return;

      try {
        const [examData, submissionData] = await Promise.all([
        mockDataService.getExam(examId),
        mockDataService.getUserSubmissions(user.id)]
        );

        if (examData) {
          setExam(examData);
          const userSubmission = submissionData.find((sub) => sub.examId === examId);
          setSubmission(userSubmission);
        }
      } catch (error) {
        console.error('Error loading results:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [examId, user]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen" data-id="a7v6xs68u" data-path="src/components/ExamResults.tsx">Loading...</div>;
  }

  if (!exam || !submission) {
    return <div className="flex items-center justify-center min-h-screen" data-id="x5y2u5yty" data-path="src/components/ExamResults.tsx">Results not found</div>;
  }

  const correctAnswers = exam.questions.filter((q) => submission.answers[q.id] === q.correctOption).length;
  const totalQuestions = exam.questions.length;
  const percentage = Math.round(correctAnswers / totalQuestions * 100);
  const grade = percentage >= 90 ? 'A+' : percentage >= 80 ? 'A' : percentage >= 70 ? 'B' : percentage >= 60 ? 'C' : 'F';

  return (
    <div className="min-h-screen bg-gray-50" data-id="yc7poea8u" data-path="src/components/ExamResults.tsx">
      {/* Header */}
      <header className="bg-white shadow-sm border-b" data-id="pj6qj9ikk" data-path="src/components/ExamResults.tsx">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" data-id="gv1kdi64j" data-path="src/components/ExamResults.tsx">
          <div className="flex justify-between items-center h-16" data-id="wadvx8qij" data-path="src/components/ExamResults.tsx">
            <div className="flex items-center" data-id="dxfhjkal4" data-path="src/components/ExamResults.tsx">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/dashboard')}
                className="mr-4" data-id="5afuhyzlw" data-path="src/components/ExamResults.tsx">

                <ArrowLeft className="h-4 w-4 mr-2" data-id="1csmscihc" data-path="src/components/ExamResults.tsx" />
                Back to Dashboard
              </Button>
              <h1 className="text-xl font-bold text-gray-900" data-id="kh031mvwh" data-path="src/components/ExamResults.tsx">Exam Results</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-id="bp6zfh2xd" data-path="src/components/ExamResults.tsx">
        <div className="space-y-6" data-id="ej31xr4qy" data-path="src/components/ExamResults.tsx">
          {/* Results Summary */}
          <Card data-id="bimc53u48" data-path="src/components/ExamResults.tsx">
            <CardHeader data-id="78etgeerg" data-path="src/components/ExamResults.tsx">
              <CardTitle className="flex items-center" data-id="pf40t8ot4" data-path="src/components/ExamResults.tsx">
                <Trophy className="h-5 w-5 mr-2" data-id="u4w1vna5t" data-path="src/components/ExamResults.tsx" />
                {exam.name} - Results
              </CardTitle>
              <CardDescription data-id="m9j9mh3zx" data-path="src/components/ExamResults.tsx">
                Completed on {new Date(submission.completedAt).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent data-id="84g3609ht" data-path="src/components/ExamResults.tsx">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" data-id="zzgmhd68z" data-path="src/components/ExamResults.tsx">
                <div className="text-center" data-id="kzubwgj8v" data-path="src/components/ExamResults.tsx">
                  <div className="text-3xl font-bold text-blue-600" data-id="49lnexr1l" data-path="src/components/ExamResults.tsx">{submission.score}</div>
                  <div className="text-sm text-gray-600" data-id="8sbkx1vcn" data-path="src/components/ExamResults.tsx">Total Score</div>
                </div>
                <div className="text-center" data-id="owq2hao3w" data-path="src/components/ExamResults.tsx">
                  <div className="text-3xl font-bold text-green-600" data-id="198z1qdct" data-path="src/components/ExamResults.tsx">{correctAnswers}</div>
                  <div className="text-sm text-gray-600" data-id="jnbxrkuc3" data-path="src/components/ExamResults.tsx">Correct Answers</div>
                </div>
                <div className="text-center" data-id="22o625xmw" data-path="src/components/ExamResults.tsx">
                  <div className="text-3xl font-bold text-purple-600" data-id="o8ekg8g8b" data-path="src/components/ExamResults.tsx">{percentage}%</div>
                  <div className="text-sm text-gray-600" data-id="sh0s6nw0a" data-path="src/components/ExamResults.tsx">Percentage</div>
                </div>
                <div className="text-center" data-id="n2f2ebsr1" data-path="src/components/ExamResults.tsx">
                  <div className="text-3xl font-bold text-orange-600" data-id="y82agqw3h" data-path="src/components/ExamResults.tsx">{grade}</div>
                  <div className="text-sm text-gray-600" data-id="mr5brisce" data-path="src/components/ExamResults.tsx">Grade</div>
                </div>
              </div>
              
              <div className="mt-6" data-id="t5igfbuvh" data-path="src/components/ExamResults.tsx">
                <div className="flex justify-between text-sm mb-2" data-id="b9z82unrx" data-path="src/components/ExamResults.tsx">
                  <span data-id="c9kblql1r" data-path="src/components/ExamResults.tsx">Overall Performance</span>
                  <span data-id="6k2ppl061" data-path="src/components/ExamResults.tsx">{correctAnswers}/{totalQuestions} correct</span>
                </div>
                <Progress value={percentage} className="h-3" data-id="noqo8mjgp" data-path="src/components/ExamResults.tsx" />
              </div>
            </CardContent>
          </Card>

          {/* Question-by-Question Results */}
          <Card data-id="v8dpt4ie5" data-path="src/components/ExamResults.tsx">
            <CardHeader data-id="fuwopu02x" data-path="src/components/ExamResults.tsx">
              <CardTitle data-id="hi4x1wvpq" data-path="src/components/ExamResults.tsx">Question-by-Question Results</CardTitle>
              <CardDescription data-id="1kzxx7glm" data-path="src/components/ExamResults.tsx">
                Review your answers for each question
              </CardDescription>
            </CardHeader>
            <CardContent data-id="nzyiuh1mf" data-path="src/components/ExamResults.tsx">
              <div className="space-y-4" data-id="8m1vqg764" data-path="src/components/ExamResults.tsx">
                {exam.questions.map((question, index) => {
                  const userAnswer = submission.answers[question.id];
                  const isCorrect = userAnswer === question.correctOption;

                  return (
                    <div key={question.id} className="border rounded-lg p-4" data-id="3bd0rvn5u" data-path="src/components/ExamResults.tsx">
                      <div className="flex items-start justify-between mb-3" data-id="890ak2uw0" data-path="src/components/ExamResults.tsx">
                        <div className="flex items-center" data-id="enb88o0u2" data-path="src/components/ExamResults.tsx">
                          <span className="text-sm font-medium text-gray-600 mr-2" data-id="cyn9irwbc" data-path="src/components/ExamResults.tsx">
                            Question {index + 1}
                          </span>
                          <Badge variant={isCorrect ? "default" : "destructive"} data-id="gbneu2glv" data-path="src/components/ExamResults.tsx">
                            {isCorrect ?
                            <CheckCircle className="h-3 w-3 mr-1" data-id="vqszfeudr" data-path="src/components/ExamResults.tsx" /> :

                            <XCircle className="h-3 w-3 mr-1" data-id="1z6t6idv6" data-path="src/components/ExamResults.tsx" />
                            }
                            {isCorrect ? 'Correct' : 'Incorrect'}
                          </Badge>
                        </div>
                        <Badge variant="outline" className="text-xs" data-id="c1q4j8umu" data-path="src/components/ExamResults.tsx">
                          {question.difficulty}
                        </Badge>
                      </div>
                      
                      <p className="font-medium mb-3" data-id="ldjlm8p3x" data-path="src/components/ExamResults.tsx">{question.content}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3" data-id="g2buiclui" data-path="src/components/ExamResults.tsx">
                        {question.options.map((option, optionIndex) =>
                        <div
                          key={optionIndex}
                          className={`p-2 rounded border text-sm ${
                          optionIndex === question.correctOption ?
                          'bg-green-50 border-green-200 text-green-800' :
                          userAnswer === optionIndex && !isCorrect ?
                          'bg-red-50 border-red-200 text-red-800' :
                          'bg-gray-50 border-gray-200'}`
                          } data-id="wtea30h6t" data-path="src/components/ExamResults.tsx">

                            <div className="flex items-center" data-id="tnzt6bqbo" data-path="src/components/ExamResults.tsx">
                              <span className="font-medium mr-2" data-id="rpjhbzrqr" data-path="src/components/ExamResults.tsx">
                                {String.fromCharCode(65 + optionIndex)}.
                              </span>
                              <span data-id="yl08u6lyu" data-path="src/components/ExamResults.tsx">{option}</span>
                              {optionIndex === question.correctOption &&
                            <CheckCircle className="h-4 w-4 ml-auto text-green-600" data-id="1urdmtoq3" data-path="src/components/ExamResults.tsx" />
                            }
                              {userAnswer === optionIndex && !isCorrect &&
                            <XCircle className="h-4 w-4 ml-auto text-red-600" data-id="2y6adshwu" data-path="src/components/ExamResults.tsx" />
                            }
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {userAnswer === undefined &&
                      <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800" data-id="g4y02ehgl" data-path="src/components/ExamResults.tsx">
                          No answer provided
                        </div>
                      }
                    </div>);

                })}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-center space-x-4" data-id="q8x1f64xx" data-path="src/components/ExamResults.tsx">
            <Button
              variant="outline"
              onClick={() => navigate('/dashboard')} data-id="ntj9grn45" data-path="src/components/ExamResults.tsx">

              <BookOpen className="h-4 w-4 mr-2" data-id="m8psxvyxf" data-path="src/components/ExamResults.tsx" />
              Back to Dashboard
            </Button>
            <Button
              onClick={() => navigate('/rankings')} data-id="2uo3av98a" data-path="src/components/ExamResults.tsx">

              <Trophy className="h-4 w-4 mr-2" data-id="8qvx0pdkt" data-path="src/components/ExamResults.tsx" />
              View Rankings
            </Button>
          </div>
        </div>
      </div>
    </div>);

};

export default ExamResults;