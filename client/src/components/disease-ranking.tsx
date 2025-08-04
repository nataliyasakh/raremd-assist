import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ListEnd, Book, FlaskConical, FileText, Save, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface DiseaseMatch {
  disease: {
    id: number;
    orphaCode: string;
    name: string;
    definition?: string;
    geneReviewsUrl?: string;
    omimId?: string;
    recommendedTests?: Array<{
      test: string;
      description: string;
    }>;
  };
  score: number;
  keyMatches: number;
  supportingMatches: number;
  priority: 'high' | 'medium' | 'low';
}

interface DiseaseRankingProps {
  results: DiseaseMatch[];
  symptoms: Array<{
    hpoId: string;
    label: string;
    frequency?: string;
  }>;
}

export default function DiseaseRanking({ results, symptoms }: DiseaseRankingProps) {
  const [selectedCase, setSelectedCase] = useState<DiseaseMatch | null>(null);
  const { toast } = useToast();

  const generatePdfMutation = useMutation({
    mutationFn: async (caseId: number) => {
      const response = await apiRequest('POST', '/api/generate-pdf', { caseId });
      return response.text();
    },
    onSuccess: (htmlContent) => {
      // Open PDF in new window
      const newWindow = window.open('', '_blank');
      if (newWindow) {
        newWindow.document.write(htmlContent);
        newWindow.document.close();
      }
      toast({
        title: "PDF Generated",
        description: "Referral report opened in new window"
      });
    },
    onError: () => {
      toast({
        title: "PDF Generation Failed",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive"
      });
    }
  });

  const saveCaseMutation = useMutation({
    mutationFn: async (diseaseMatch: DiseaseMatch) => {
      const caseData = {
        patientId: `PAT-${Date.now()}`, // Generate patient ID
        symptoms: symptoms,
        diagnosis: diseaseMatch.disease.name,
        orphaCode: diseaseMatch.disease.orphaCode,
        score: diseaseMatch.score,
        status: 'active' as const
      };

      const response = await apiRequest('POST', '/api/cases', caseData);
      return response.json();
    },
    onSuccess: (savedCase) => {
      toast({
        title: "Case Saved",
        description: `Case ${savedCase.patientId} saved successfully with proper de-identification.`
      });
    },
    onError: () => {
      toast({
        title: "Save Failed",
        description: "Failed to save case. Please try again.",
        variant: "destructive"
      });
    }
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-50 border-red-200';
      case 'medium':
        return 'bg-orange-50 border-orange-200';
      case 'low':
        return 'bg-slate-50 border-slate-200';
      default:
        return 'bg-slate-50 border-slate-200';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge className="bg-red-600 text-white">HIGH</Badge>;
      case 'medium':
        return <Badge className="bg-orange-600 text-white">MEDIUM</Badge>;
      case 'low':
        return <Badge className="bg-slate-600 text-white">LOW</Badge>;
      default:
        return <Badge variant="secondary">UNKNOWN</Badge>;
    }
  };

  const handleExportPdf = async () => {
    if (!selectedCase) {
      toast({
        title: "No Case Selected",
        description: "Please select a case to export.",
        variant: "destructive"
      });
      return;
    }

    // First save the case, then generate PDF
    try {
      const savedCase = await saveCaseMutation.mutateAsync(selectedCase);
      await generatePdfMutation.mutateAsync(savedCase.id);
    } catch (error) {
      // Error handling is done in mutations
    }
  };

  return (
    <Card className="bg-white shadow-sm border border-slate-200">
      <CardHeader className="border-b border-slate-200">
        <CardTitle className="flex items-center">
          <ListEnd className="clinical-green mr-2" />
          Disease Ranking
        </CardTitle>
        <p className="text-sm professional-gray">Ranked rare disease suggestions based on symptom match</p>
      </CardHeader>
      <CardContent className="p-6">
        {results.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-500">No analysis results yet. Enter symptoms and click "Analyze Symptoms" to get started.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {results.map((result, index) => (
              <div
                key={result.disease.id}
                className={`border p-4 rounded-md cursor-pointer transition-all ${
                  getPriorityColor(result.priority)
                } ${
                  selectedCase?.disease.id === result.disease.id
                    ? 'ring-2 ring-blue-500'
                    : ''
                }`}
                onClick={() => setSelectedCase(result)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {getPriorityBadge(result.priority)}
                    <span className="font-semibold text-slate-900">{result.disease.name}</span>
                  </div>
                  <span className="text-sm font-medium text-slate-600">Score: {result.score}</span>
                </div>
                
                <p className="text-sm professional-gray mb-2">{result.disease.orphaCode}</p>
                
                <div className="flex items-center space-x-4 text-sm mb-3">
                  <span className="clinical-green">{result.keyMatches} key symptoms</span>
                  <span className="professional-gray">{result.supportingMatches} supporting symptoms</span>
                </div>

                {result.disease.definition && (
                  <p className="text-sm text-slate-600 mb-3 line-clamp-2">{result.disease.definition}</p>
                )}

                <div className="flex space-x-2">
                  {result.disease.geneReviewsUrl && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs bg-blue-600 text-white hover:bg-blue-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(result.disease.geneReviewsUrl, '_blank');
                      }}
                    >
                      <Book className="mr-1 h-3 w-3" />
                      GeneReviews
                    </Button>
                  )}
                  
                  {result.disease.recommendedTests && result.disease.recommendedTests.length > 0 && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs bg-green-600 text-white hover:bg-green-700"
                    >
                      <FlaskConical className="mr-1 h-3 w-3" />
                      Tests
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Export Actions */}
        {results.length > 0 && (
          <div className="flex space-x-3 mt-6 pt-4 border-t border-slate-200">
            <Button
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              onClick={handleExportPdf}
              disabled={generatePdfMutation.isPending || !selectedCase}
            >
              {generatePdfMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <FileText className="mr-2 h-4 w-4" />
              )}
              Export Referral PDF
            </Button>
            <Button
              variant="outline"
              onClick={() => selectedCase && saveCaseMutation.mutate(selectedCase)}
              disabled={saveCaseMutation.isPending || !selectedCase}
            >
              {saveCaseMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save Case
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
