import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Brain, 
  Users, 
  Plus, 
  Search, 
  Filter, 
  ThumbsUp, 
  ThumbsDown, 
  Calendar, 
  MapPin, 
  Stethoscope,
  Trophy,
  Target,
  MessageSquare,
  CheckCircle,
  Clock,
  User,
  Award,
  Database
} from "lucide-react";
import type { DiagnosticChallenge, ChallengeResponse, InsertDiagnosticChallenge, InsertChallengeResponse } from "@shared/schema";

export default function DiagnosticChallenges() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("challenges");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("active");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState<DiagnosticChallenge | null>(null);
  const [isResponseDialogOpen, setIsResponseDialogOpen] = useState(false);

  // Fetch diagnostic challenges
  const { data: challenges = [], isLoading } = useQuery<DiagnosticChallenge[]>({
    queryKey: ['/api/community/challenges', searchTerm, selectedDifficulty, selectedStatus],
  });

  // Fetch challenge responses for selected challenge
  const { data: responses = [] } = useQuery<ChallengeResponse[]>({
    queryKey: ['/api/community/challenges', selectedChallenge?.id, 'responses'],
    enabled: !!selectedChallenge
  });

  // Fetch community leaderboard
  const { data: leaderboard = [] } = useQuery({
    queryKey: ['/api/community/leaderboard'],
  });

  const [newChallenge, setNewChallenge] = useState<Partial<InsertDiagnosticChallenge>>({
    title: "",
    description: "",
    symptoms: [],
    additionalInfo: "",
    difficulty: "medium",
    ageGroup: "adult",
    sex: "unknown",
    country: "",
    correctDiagnosis: "",
    correctOrphaCode: ""
  });

  const [newResponse, setNewResponse] = useState<Partial<InsertChallengeResponse>>({
    suggestedDiagnosis: "",
    orphaCode: "",
    reasoning: "",
    confidence: 80,
    country: ""
  });

  // Create challenge mutation
  const createChallengeMutation = useMutation({
    mutationFn: async (challengeData: InsertDiagnosticChallenge) => {
      return await apiRequest('/api/community/challenges', {
        method: 'POST',
        body: JSON.stringify(challengeData)
      });
    },
    onSuccess: () => {
      toast({
        title: "Challenge Created Successfully",
        description: "Your diagnostic challenge has been added to the community!",
      });
      setIsCreateDialogOpen(false);
      setNewChallenge({
        title: "",
        description: "",
        symptoms: [],
        additionalInfo: "",
        difficulty: "medium",
        ageGroup: "adult",
        sex: "unknown",
        country: "",
        correctDiagnosis: "",
        correctOrphaCode: ""
      });
      queryClient.invalidateQueries({ queryKey: ['/api/community/challenges'] });
    },
    onError: () => {
      toast({
        title: "Error Creating Challenge",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  });

  // Submit response mutation
  const submitResponseMutation = useMutation({
    mutationFn: async (responseData: InsertChallengeResponse) => {
      return await apiRequest('/api/community/challenge-responses', {
        method: 'POST',
        body: JSON.stringify(responseData)
      });
    },
    onSuccess: () => {
      toast({
        title: "Response Submitted",
        description: "Your diagnostic suggestion has been recorded!",
      });
      setIsResponseDialogOpen(false);
      setNewResponse({
        suggestedDiagnosis: "",
        orphaCode: "",
        reasoning: "",
        confidence: 80,
        country: ""
      });
      queryClient.invalidateQueries({ queryKey: ['/api/community/challenges'] });
    },
    onError: () => {
      toast({
        title: "Error Submitting Response",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  });

  // Vote on response mutation
  const voteMutation = useMutation({
    mutationFn: async ({ responseId, voteType }: { responseId: number; voteType: 'up' | 'down' }) => {
      return await apiRequest(`/api/community/responses/${responseId}/${voteType}vote`, {
        method: 'POST'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/community/challenges'] });
    }
  });

  const filteredChallenges = challenges.filter(challenge => {
    const matchesSearch = challenge.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         challenge.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         challenge.symptoms?.some(s => s.label.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesDifficulty = selectedDifficulty === "all" || challenge.difficulty === selectedDifficulty;
    const matchesStatus = selectedStatus === "all" || challenge.status === selectedStatus;
    
    return matchesSearch && matchesDifficulty && matchesStatus;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "medium": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "hard": return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      case "expert": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "solved": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "archived": return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-3">
              <Brain className="h-8 w-8 text-purple-600" />
              Collaborative Diagnostic Challenges
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              Global community of physicians solving complex diagnostic cases together - iGEM 2025 Collaboration Platform
            </p>
            
            {/* iGEM 2025 Achievement Banner */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950 border border-purple-200 dark:border-purple-800 rounded-lg p-4 mt-4">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <Brain className="h-6 w-6 text-purple-600" />
                  <div>
                    <h3 className="font-semibold text-purple-900 dark:text-purple-100">iGEM 2025 Software Track - Enhanced Diagnostic Intelligence</h3>
                    <p className="text-sm text-purple-700 dark:text-purple-300">Collaborative challenges powered by massive rare disease knowledge base</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100">
                    <Database className="h-3 w-3 mr-1" />
                    3,000+ Diseases
                  </Badge>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                    <Target className="h-3 w-3 mr-1" />
                    1,500+ HPO Terms
                  </Badge>
                </div>
              </div>
            </div>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2" data-testid="button-create-challenge">
                <Plus className="h-4 w-4" />
                Create Challenge
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Diagnostic Challenge</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="title">Challenge Title</Label>
                  <Input
                    id="title"
                    value={newChallenge.title || ""}
                    onChange={(e) => setNewChallenge({ ...newChallenge, title: e.target.value })}
                    placeholder="Brief, descriptive title for the case"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Case Description</Label>
                  <Textarea
                    id="description"
                    value={newChallenge.description || ""}
                    onChange={(e) => setNewChallenge({ ...newChallenge, description: e.target.value })}
                    placeholder="Detailed case presentation including history, examination findings..."
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="difficulty">Difficulty Level</Label>
                    <Select value={newChallenge.difficulty} onValueChange={(value) => setNewChallenge({ ...newChallenge, difficulty: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                        <SelectItem value="expert">Expert</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="age-group">Age Group</Label>
                    <Select value={newChallenge.ageGroup} onValueChange={(value) => setNewChallenge({ ...newChallenge, ageGroup: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pediatric">Pediatric</SelectItem>
                        <SelectItem value="adult">Adult</SelectItem>
                        <SelectItem value="elderly">Elderly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="sex">Sex</Label>
                    <Select value={newChallenge.sex} onValueChange={(value) => setNewChallenge({ ...newChallenge, sex: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="unknown">Unknown</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="additional-info">Additional Information</Label>
                  <Textarea
                    id="additional-info"
                    value={newChallenge.additionalInfo || ""}
                    onChange={(e) => setNewChallenge({ ...newChallenge, additionalInfo: e.target.value })}
                    placeholder="Lab results, imaging findings, family history, etc."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="correct-diagnosis">Correct Diagnosis (Optional)</Label>
                    <Input
                      id="correct-diagnosis"
                      value={newChallenge.correctDiagnosis || ""}
                      onChange={(e) => setNewChallenge({ ...newChallenge, correctDiagnosis: e.target.value })}
                      placeholder="Known diagnosis if available"
                    />
                  </div>
                  <div>
                    <Label htmlFor="correct-orpha">ORPHA Code (Optional)</Label>
                    <Input
                      id="correct-orpha"
                      value={newChallenge.correctOrphaCode || ""}
                      onChange={(e) => setNewChallenge({ ...newChallenge, correctOrphaCode: e.target.value })}
                      placeholder="e.g., ORPHA:778"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={newChallenge.country || ""}
                    onChange={(e) => setNewChallenge({ ...newChallenge, country: e.target.value })}
                    placeholder="Country of origin"
                  />
                </div>

                <Button 
                  onClick={() => createChallengeMutation.mutate(newChallenge as InsertDiagnosticChallenge)}
                  disabled={createChallengeMutation.isPending}
                  className="w-full"
                >
                  {createChallengeMutation.isPending ? "Creating..." : "Create Challenge"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="challenges">Active Challenges</TabsTrigger>
          <TabsTrigger value="leaderboard">Community Leaderboard</TabsTrigger>
          <TabsTrigger value="responses">My Responses</TabsTrigger>
        </TabsList>

        <TabsContent value="challenges" className="space-y-6">
          {/* Search and Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                    <Input
                      placeholder="Search challenges by title, description, or symptoms..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                      data-testid="input-search-challenges"
                    />
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                      <SelectItem value="expert">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="solved">Solved</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                      <SelectItem value="all">All Status</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Challenges Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-4" />
                    <div className="space-y-2">
                      <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded" />
                      <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-5/6" />
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : filteredChallenges.length === 0 ? (
              <div className="col-span-2 text-center py-12">
                <Brain className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">No Challenges Found</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  {searchTerm || selectedDifficulty !== "all" || selectedStatus !== "active"
                    ? "Try adjusting your search criteria."
                    : "Be the first to create a diagnostic challenge!"}
                </p>
              </div>
            ) : (
              filteredChallenges.map((challenge) => (
                <Card key={challenge.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2">{challenge.title}</CardTitle>
                        <div className="flex items-center gap-2 mb-3">
                          <Badge className={getDifficultyColor(challenge.difficulty || "medium")}>
                            {challenge.difficulty}
                          </Badge>
                          <Badge className={getStatusColor(challenge.status || "active")}>
                            {challenge.status}
                          </Badge>
                          {challenge.status === "solved" && (
                            <Badge variant="default" className="bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Solved
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-right text-sm text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-1 mb-1">
                          <Users className="h-3 w-3" />
                          {challenge.participantCount || 0}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {challenge.createdDate ? new Date(challenge.createdDate).toLocaleDateString() : "Unknown"}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3">
                        {challenge.description}
                      </p>
                      
                      {challenge.symptoms && challenge.symptoms.length > 0 && (
                        <div>
                          <h4 className="font-medium text-sm text-slate-900 dark:text-slate-100 mb-2">Key Symptoms</h4>
                          <div className="flex flex-wrap gap-1">
                            {challenge.symptoms.slice(0, 3).map((symptom, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {symptom.label}
                              </Badge>
                            ))}
                            {challenge.symptoms.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{challenge.symptoms.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                          {challenge.ageGroup && (
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {challenge.ageGroup}
                            </span>
                          )}
                          {challenge.country && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {challenge.country}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedChallenge(challenge);
                              setNewResponse({ ...newResponse, challengeId: challenge.id });
                              setIsResponseDialogOpen(true);
                            }}
                            disabled={challenge.status === "solved"}
                            data-testid={`button-respond-${challenge.id}`}
                          >
                            <MessageSquare className="h-3 w-3 mr-1" />
                            Respond
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedChallenge(challenge)}
                            data-testid={`button-view-${challenge.id}`}
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-600" />
                Global Physician Leaderboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {leaderboard.slice(0, 20).map((physician: any, idx) => (
                  <div key={physician.anonymousId} className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white
                        ${idx === 0 ? 'bg-yellow-500' : idx === 1 ? 'bg-gray-400' : idx === 2 ? 'bg-amber-600' : 'bg-slate-500'}`}>
                        #{idx + 1}
                      </div>
                      <div>
                        <div className="font-medium text-slate-900 dark:text-slate-100">
                          Physician {physician.anonymousId}
                        </div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">
                          {physician.specialty} • {physician.country}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6 text-sm">
                      <div className="text-center">
                        <div className="font-bold text-slate-900 dark:text-slate-100">{physician.challengesSolved}</div>
                        <div className="text-slate-500 dark:text-slate-400">Solved</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-slate-900 dark:text-slate-100">{physician.contributionScore}</div>
                        <div className="text-slate-500 dark:text-slate-400">Score</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-slate-900 dark:text-slate-100">{physician.accuracyRate}%</div>
                        <div className="text-slate-500 dark:text-slate-400">Accuracy</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="responses" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>My Recent Responses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600 dark:text-slate-400">
                  Your diagnostic responses will appear here once you participate in challenges.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Response Dialog */}
      <Dialog open={isResponseDialogOpen} onOpenChange={setIsResponseDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Submit Diagnostic Response</DialogTitle>
          </DialogHeader>
          
          {selectedChallenge && (
            <div className="space-y-4 py-4">
              <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-2">{selectedChallenge.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">{selectedChallenge.description}</p>
              </div>

              <div>
                <Label htmlFor="diagnosis">Suggested Diagnosis *</Label>
                <Input
                  id="diagnosis"
                  value={newResponse.suggestedDiagnosis || ""}
                  onChange={(e) => setNewResponse({ ...newResponse, suggestedDiagnosis: e.target.value })}
                  placeholder="Your diagnostic hypothesis"
                />
              </div>

              <div>
                <Label htmlFor="orpha-code">ORPHA Code (if applicable)</Label>
                <Input
                  id="orpha-code"
                  value={newResponse.orphaCode || ""}
                  onChange={(e) => setNewResponse({ ...newResponse, orphaCode: e.target.value })}
                  placeholder="e.g., ORPHA:778"
                />
              </div>

              <div>
                <Label htmlFor="reasoning">Clinical Reasoning *</Label>
                <Textarea
                  id="reasoning"
                  value={newResponse.reasoning || ""}
                  onChange={(e) => setNewResponse({ ...newResponse, reasoning: e.target.value })}
                  placeholder="Explain your diagnostic reasoning, differential diagnosis, and supporting evidence..."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="confidence">Confidence Level (%)</Label>
                  <Input
                    id="confidence"
                    type="number"
                    min="1"
                    max="100"
                    value={newResponse.confidence || 80}
                    onChange={(e) => setNewResponse({ ...newResponse, confidence: parseInt(e.target.value) || 80 })}
                  />
                </div>
                <div>
                  <Label htmlFor="response-country">Your Country</Label>
                  <Input
                    id="response-country"
                    value={newResponse.country || ""}
                    onChange={(e) => setNewResponse({ ...newResponse, country: e.target.value })}
                    placeholder="Optional"
                  />
                </div>
              </div>

              <Button 
                onClick={() => submitResponseMutation.mutate({
                  ...newResponse,
                  challengeId: selectedChallenge.id
                } as InsertChallengeResponse)}
                disabled={submitResponseMutation.isPending || !newResponse.suggestedDiagnosis || !newResponse.reasoning}
                className="w-full"
              >
                {submitResponseMutation.isPending ? "Submitting..." : "Submit Response"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}