import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, CheckCircle, Clock, User, FileText, Stethoscope, Target, BookOpen } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

interface TestCase {
  id: string;
  title: string;
  description: string;
  patient: {
    age: number;
    sex: 'male' | 'female';
    demographics: string;
  };
  symptoms: Array<{
    hpoId: string;
    label: string;
    frequency?: string;
  }>;
  expectedDiagnosis: string;
  orphaCode: string;
  difficulty: 'easy' | 'medium' | 'hard';
  clinicalNotes: string;
  recommendations: string[];
}

export default function TestCases() {
  const [selectedCase, setSelectedCase] = useState<TestCase | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [difficulty, setDifficulty] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');

  const { data: testCases, isLoading } = useQuery<TestCase[]>({
    queryKey: ['/api/test-cases'],
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'hard': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getFrequencyIcon = (frequency?: string) => {
    switch (frequency) {
      case 'very_frequent': return '🔴';
      case 'frequent': return '🟡';
      case 'occasional': return '🟢';
      case 'very_rare': return '🔵';
      default: return '⚪';
    }
  };

  const filteredCases = testCases?.filter(testCase => 
    difficulty === 'all' || testCase.difficulty === difficulty
  ) || [];

  const startNewCase = () => {
    if (filteredCases.length === 0) return;
    const randomCase = filteredCases[Math.floor(Math.random() * filteredCases.length)];
    setSelectedCase(randomCase);
    setShowAnswer(false);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Practice Test Cases
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Test your diagnostic skills with realistic rare disease cases
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Test Case Library */}
        <div className="lg:col-span-1">
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Test Case Library
              </CardTitle>
              <CardDescription>
                Choose a difficulty level and start practicing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Difficulty Level</label>
                  <Tabs value={difficulty} onValueChange={(value) => setDifficulty(value as any)}>
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="all">All</TabsTrigger>
                      <TabsTrigger value="easy">Easy</TabsTrigger>
                      <TabsTrigger value="medium">Medium</TabsTrigger>
                      <TabsTrigger value="hard">Hard</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Available Cases:</span>
                    <span className="font-medium">{filteredCases.length}</span>
                  </div>
                  <Button onClick={startNewCase} className="w-full" disabled={filteredCases.length === 0}>
                    <Target className="h-4 w-4 mr-2" />
                    Start Random Case
                  </Button>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h4 className="font-medium">Case List</h4>
                  <div className="space-y-1 max-h-64 overflow-y-auto">
                    {filteredCases.map((testCase) => (
                      <div
                        key={testCase.id}
                        className={`p-2 rounded-lg border cursor-pointer transition-colors ${
                          selectedCase?.id === testCase.id
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                        onClick={() => {
                          setSelectedCase(testCase);
                          setShowAnswer(false);
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="text-sm font-medium truncate">{testCase.title}</div>
                            <div className="text-xs text-gray-500 truncate">{testCase.description}</div>
                          </div>
                          <Badge className={getDifficultyColor(testCase.difficulty)}>
                            {testCase.difficulty}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Case Details */}
        <div className="lg:col-span-2">
          {selectedCase ? (
            <div className="space-y-6">
              {/* Case Header */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Stethoscope className="h-5 w-5" />
                        {selectedCase.title}
                      </CardTitle>
                      <CardDescription>{selectedCase.description}</CardDescription>
                    </div>
                    <Badge className={getDifficultyColor(selectedCase.difficulty)}>
                      {selectedCase.difficulty}
                    </Badge>
                  </div>
                </CardHeader>
              </Card>

              {/* Patient Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Patient Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <span className="text-sm font-medium">Age:</span>
                      <p className="text-lg">{selectedCase.patient.age} years</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Sex:</span>
                      <p className="text-lg capitalize">{selectedCase.patient.sex}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Demographics:</span>
                      <p className="text-lg">{selectedCase.patient.demographics}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Symptoms */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    Presenting Symptoms
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {selectedCase.symptoms.map((symptom) => (
                      <div
                        key={symptom.hpoId}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{getFrequencyIcon(symptom.frequency)}</span>
                          <div>
                            <p className="font-medium">{symptom.label}</p>
                            <p className="text-sm text-gray-500">{symptom.hpoId}</p>
                          </div>
                        </div>
                        {symptom.frequency && (
                          <Badge variant="outline" className="capitalize">
                            {symptom.frequency.replace('_', ' ')}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Clinical Notes */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Clinical Notes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {selectedCase.clinicalNotes}
                  </p>
                </CardContent>
              </Card>

              {/* Answer Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Answer & Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!showAnswer ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500 mb-4">
                        Make your diagnosis, then reveal the answer
                      </p>
                      <Button onClick={() => setShowAnswer(true)}>
                        Show Answer
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Alert>
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription>
                          <strong>Expected Diagnosis:</strong> {selectedCase.expectedDiagnosis}
                          <br />
                          <strong>ORPHA Code:</strong> {selectedCase.orphaCode}
                        </AlertDescription>
                      </Alert>

                      <div>
                        <h4 className="font-medium mb-2">Recommended Tests & Investigations:</h4>
                        <ul className="space-y-1">
                          {selectedCase.recommendations.map((rec, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-blue-600 mt-1">•</span>
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="h-64 flex items-center justify-center">
              <CardContent className="text-center">
                <Clock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500">Select a test case to begin practicing</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}