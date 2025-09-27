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
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Users, 
  Globe, 
  Plus, 
  Search, 
  Filter, 
  ThumbsUp, 
  Calendar, 
  MapPin, 
  Stethoscope,
  Clock,
  TrendingUp,
  Award,
  BookOpen,
  Database
} from "lucide-react";
import type { CrowdsourcedCase, InsertCrowdsourcedCase } from "@shared/schema";

export default function CommunityRepository() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [selectedOutcome, setSelectedOutcome] = useState<string>("all");
  const [selectedCountry, setSelectedCountry] = useState<string>("all");
  const [isContributeDialogOpen, setIsContributeDialogOpen] = useState(false);

  // Fetch crowdsourced cases
  const { data: cases = [], isLoading, error } = useQuery<CrowdsourcedCase[]>({
    queryKey: ['/api/community/cases'],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.set('search', searchTerm);
      if (selectedDifficulty !== 'all') params.set('difficulty', selectedDifficulty);
      if (selectedOutcome !== 'all') params.set('outcome', selectedOutcome);
      if (selectedCountry !== 'all') params.set('country', selectedCountry);
      
      const url = `/api/community/cases${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch cases');
      }
      return response.json();
    }
  });

  // Debug logging
  console.log('Cases data:', cases?.length, 'cases loaded');
  console.log('Loading:', isLoading);
  console.log('Error:', error);

  // Fetch community statistics
  const { data: stats } = useQuery<{
    totalContributions: number;
    totalParticipants: number;
    totalCountries: number;
    avgDiagnosticAccuracy: number;
  }>({
    queryKey: ['/api/community/stats'],
  });

  const [newCase, setNewCase] = useState<Partial<InsertCrowdsourcedCase>>({
    symptoms: [],
    country: "",
    region: "",
    confirmedDiagnosis: "",
    diagnosticJourney: "",
    outcome: "confirmed",
    difficulty: "medium",
    ageGroup: "adult",
    sex: "unknown",
    timeToConfirmation: 0
  });

  // Submit new case mutation
  const submitCaseMutation = useMutation({
    mutationFn: async (caseData: InsertCrowdsourcedCase) => {
      const response = await fetch('/api/community/cases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(caseData)
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Case Contributed Successfully",
        description: "Thank you for contributing to the global knowledge base!",
      });
      setIsContributeDialogOpen(false);
      setNewCase({
        symptoms: [],
        country: "",
        region: "",
        confirmedDiagnosis: "",
        diagnosticJourney: "",
        outcome: "confirmed",
        difficulty: "medium",
        ageGroup: "adult",
        sex: "unknown",
        timeToConfirmation: 0
      });
      queryClient.invalidateQueries({ queryKey: ['/api/community/cases'] });
      queryClient.invalidateQueries({ queryKey: ['/api/community/stats'] });
    },
    onError: (error) => {
      toast({
        title: "Error Contributing Case",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  });

  // Upvote case mutation
  const upvoteMutation = useMutation({
    mutationFn: async (caseId: number) => {
      const response = await fetch(`/api/community/cases/${caseId}/upvote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/community/cases'] });
    }
  });

  // Get unique countries for filter
  const countries = Array.from(new Set(cases.map(c => c.country).filter(Boolean)));

  const filteredCases = cases.filter(case_ => {
    const matchesSearch = case_.confirmedDiagnosis?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         case_.diagnosticJourney?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         case_.symptoms?.some(s => s.label.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesDifficulty = selectedDifficulty === "all" || case_.difficulty === selectedDifficulty;
    const matchesOutcome = selectedOutcome === "all" || case_.outcome === selectedOutcome;
    const matchesCountry = selectedCountry === "all" || case_.country === selectedCountry;
    
    return matchesSearch && matchesDifficulty && matchesOutcome && matchesCountry;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-3">
              <Users className="h-8 w-8 text-blue-600" />
              Community Case Repository
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              Global crowdsourced diagnostic cases from physicians worldwide - Contributing to iGEM 2025 Software Track
            </p>
            
            {/* iGEM 2025 Achievement Banner */}
            <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-950 dark:to-green-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-4">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <Users className="h-6 w-6 text-blue-600" />
                  <div>
                    <h3 className="font-semibold text-blue-900 dark:text-blue-100">iGEM 2025 Software Track - Community-Driven Innovation</h3>
                    <p className="text-sm text-blue-700 dark:text-blue-300">Crowdsourced case repository with comprehensive diagnostic coverage</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                    <Database className="h-3 w-3 mr-1" />
                    3,000+ Diseases
                  </Badge>
                  <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                    <BookOpen className="h-3 w-3 mr-1" />
                    1,500+ HPO Terms
                  </Badge>
                </div>
              </div>
            </div>
          </div>
          
          <Dialog open={isContributeDialogOpen} onOpenChange={setIsContributeDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2" data-testid="button-contribute-case">
                <Plus className="h-4 w-4" />
                Contribute Case
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Contribute Anonymous Case</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={newCase.country || ""}
                      onChange={(e) => setNewCase({ ...newCase, country: e.target.value })}
                      placeholder="e.g., United States"
                    />
                  </div>
                  <div>
                    <Label htmlFor="region">Region/State</Label>
                    <Input
                      id="region"
                      value={newCase.region || ""}
                      onChange={(e) => setNewCase({ ...newCase, region: e.target.value })}
                      placeholder="e.g., California"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="age-group">Age Group</Label>
                    <Select value={newCase.ageGroup || ""} onValueChange={(value) => setNewCase({ ...newCase, ageGroup: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pediatric">Pediatric (0-17)</SelectItem>
                        <SelectItem value="adult">Adult (18-64)</SelectItem>
                        <SelectItem value="elderly">Elderly (65+)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="sex">Sex</Label>
                    <Select value={newCase.sex || ""} onValueChange={(value) => setNewCase({ ...newCase, sex: value })}>
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
                  <div>
                    <Label htmlFor="difficulty">Case Difficulty</Label>
                    <Select value={newCase.difficulty || ""} onValueChange={(value) => setNewCase({ ...newCase, difficulty: value })}>
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
                </div>

                <div>
                  <Label htmlFor="diagnosis">Confirmed Diagnosis</Label>
                  <Input
                    id="diagnosis"
                    value={newCase.confirmedDiagnosis || ""}
                    onChange={(e) => setNewCase({ ...newCase, confirmedDiagnosis: e.target.value })}
                    placeholder="e.g., Rett syndrome"
                  />
                </div>

                <div>
                  <Label htmlFor="orpha-code">ORPHA Code (if known)</Label>
                  <Input
                    id="orpha-code"
                    value={newCase.orphaCode || ""}
                    onChange={(e) => setNewCase({ ...newCase, orphaCode: e.target.value })}
                    placeholder="e.g., ORPHA:778"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="outcome">Diagnostic Outcome</Label>
                    <Select value={newCase.outcome || ""} onValueChange={(value) => setNewCase({ ...newCase, outcome: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="differential">Differential</SelectItem>
                        <SelectItem value="unresolved">Unresolved</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="time-to-confirmation">Time to Confirmation (days)</Label>
                    <Input
                      id="time-to-confirmation"
                      type="number"
                      value={newCase.timeToConfirmation || 0}
                      onChange={(e) => setNewCase({ ...newCase, timeToConfirmation: parseInt(e.target.value) || 0 })}
                      placeholder="30"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="journey">Diagnostic Journey</Label>
                  <Textarea
                    id="journey"
                    value={newCase.diagnosticJourney || ""}
                    onChange={(e) => setNewCase({ ...newCase, diagnosticJourney: e.target.value })}
                    placeholder="Describe the diagnostic process, key symptoms, tests performed, and clinical reasoning..."
                    rows={4}
                  />
                </div>

                <Button 
                  onClick={() => submitCaseMutation.mutate(newCase as InsertCrowdsourcedCase)}
                  disabled={submitCaseMutation.isPending}
                  className="w-full"
                >
                  {submitCaseMutation.isPending ? "Contributing..." : "Contribute Case"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Community Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Globe className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Cases</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.totalContributions || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Contributors</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.totalParticipants || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <MapPin className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Countries</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.totalCountries || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Award className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Avg. Accuracy</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.avgDiagnosticAccuracy || 0}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  placeholder="Search cases by diagnosis, symptoms, or journey..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-cases"
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
              
              <Select value={selectedOutcome} onValueChange={setSelectedOutcome}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Outcome" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Outcomes</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="differential">Differential</SelectItem>
                  <SelectItem value="unresolved">Unresolved</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Countries</SelectItem>
                  {countries.map(country => (
                    <SelectItem key={country} value={country || ""}>{country}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cases Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
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
        ) : filteredCases.length === 0 ? (
          <div className="col-span-2 text-center py-12">
            <BookOpen className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">No Cases Found</h3>
            <p className="text-slate-600 dark:text-slate-400">
              {searchTerm || selectedDifficulty !== "all" || selectedOutcome !== "all" || selectedCountry !== "all"
                ? "Try adjusting your search criteria."
                : "Be the first to contribute a case to the community repository!"}
            </p>
          </div>
        ) : (
          filteredCases.map((case_) => (
            <Card key={case_.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{case_.confirmedDiagnosis}</CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      {case_.orphaCode && (
                        <Badge variant="secondary" className="text-xs">
                          {case_.orphaCode}
                        </Badge>
                      )}
                      <Badge 
                        variant={case_.difficulty === "expert" ? "destructive" : case_.difficulty === "hard" ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {case_.difficulty}
                      </Badge>
                      <Badge 
                        variant={case_.outcome === "confirmed" ? "default" : case_.outcome === "unresolved" ? "destructive" : "secondary"}
                        className="text-xs"
                      >
                        {case_.outcome}
                      </Badge>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => upvoteMutation.mutate(case_.id)}
                    className="flex items-center gap-1"
                    data-testid={`button-upvote-${case_.id}`}
                  >
                    <ThumbsUp className="h-4 w-4" />
                    {case_.upvotes}
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  {case_.symptoms && case_.symptoms.length > 0 && (
                    <div>
                      <h4 className="font-medium text-sm text-slate-900 dark:text-slate-100 mb-2">Key Symptoms</h4>
                      <div className="flex flex-wrap gap-1">
                        {case_.symptoms.slice(0, 4).map((symptom, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {symptom.label}
                          </Badge>
                        ))}
                        {case_.symptoms.length > 4 && (
                          <Badge variant="outline" className="text-xs">
                            +{case_.symptoms.length - 4} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {case_.diagnosticJourney && (
                    <div>
                      <h4 className="font-medium text-sm text-slate-900 dark:text-slate-100 mb-2">Diagnostic Journey</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3">
                        {case_.diagnosticJourney}
                      </p>
                    </div>
                  )}
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-4">
                      {case_.country && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {case_.country}
                        </span>
                      )}
                      {case_.ageGroup && (
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {case_.ageGroup}
                        </span>
                      )}
                      {case_.timeToConfirmation && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {case_.timeToConfirmation}d
                        </span>
                      )}
                    </div>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {case_.contributionDate ? new Date(case_.contributionDate).toLocaleDateString() : "Unknown"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}