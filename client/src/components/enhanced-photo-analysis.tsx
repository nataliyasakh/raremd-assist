import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { 
  Camera, 
  Upload, 
  AlertTriangle, 
  CheckCircle, 
  Brain, 
  FileText, 
  Lightbulb,
  Eye,
  Target,
  Microscope,
  Stethoscope
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface AIAnalysisResult {
  features: string[];
  confidence: number;
  suggestions: string[];
  medicalRelevance: string;
  hpoMatches: Array<{
    hpoId: string;
    label: string;
    confidence: number;
  }>;
  educationalInsights: string[];
  report: string;
}

interface PhotoAnalysisProps {
  symptoms: string[];
  onFeaturesDetected?: (features: string[]) => void;
}

export default function EnhancedPhotoAnalysis({ symptoms, onFeaturesDetected }: PhotoAnalysisProps) {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [textDescription, setTextDescription] = useState("");
  const [analysis, setAnalysis] = useState<AIAnalysisResult | null>(null);
  const [analysisStep, setAnalysisStep] = useState(0);

  const analyzeMutation = useMutation({
    mutationFn: async ({ imageData, description }: { imageData?: string; description: string }) => {
      setAnalysisStep(1);
      const response = await apiRequest('POST', '/api/ai-analysis', { 
        imageData: imageData || null,
        textDescription: description,
        existingSymptoms: symptoms
      });
      return await response.json() as AIAnalysisResult;
    },
    onSuccess: (data) => {
      setAnalysis(data);
      setAnalysisStep(4);
      if (onFeaturesDetected && data.features.length > 0) {
        onFeaturesDetected(data.features);
      }
    },
    onError: () => {
      setAnalysisStep(0);
    }
  });

  const analyzeFeatures = async () => {
    let imageData: string | undefined;
    
    if (selectedImage) {
      imageData = await convertToBase64(selectedImage);
    }

    if (!imageData && !textDescription.trim()) {
      alert("Please upload an image or provide a text description");
      return;
    }

    analyzeMutation.mutate({ 
      imageData,
      description: textDescription 
    });
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]); // Remove data:image/jpeg;base64, prefix
      };
      reader.onerror = reject;
    });
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const getAnalysisProgress = () => {
    const steps = [
      "Ready to analyze",
      "Processing image data...",
      "Extracting medical features...",
      "Matching with HPO terms...",
      "Analysis complete"
    ];
    return {
      step: steps[analysisStep],
      progress: (analysisStep / 4) * 100
    };
  };

  const progressInfo = getAnalysisProgress();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="text-blue-600" />
          AI-Enhanced Feature Analysis
        </CardTitle>
        <p className="text-sm text-slate-600">
          Upload photos and describe medical features to get AI-powered analysis and HPO term suggestions
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Image Upload Section */}
        <div className="space-y-4">
          <Label className="text-base font-semibold flex items-center gap-2">
            <Camera className="h-4 w-4" />
            Photo Upload (Optional)
          </Label>
          
          <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
            {imagePreview ? (
              <div className="space-y-4">
                <img 
                  src={imagePreview} 
                  alt="Selected" 
                  className="max-w-full max-h-64 mx-auto rounded-lg shadow-md"
                />
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSelectedImage(null);
                    setImagePreview(null);
                  }}
                >
                  Remove Image
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <Upload className="h-12 w-12 mx-auto text-slate-400" />
                <div>
                  <Label htmlFor="image-upload" className="cursor-pointer">
                    <Button variant="outline" asChild>
                      <span>Choose Image</span>
                    </Button>
                  </Label>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                </div>
                <p className="text-sm text-slate-500">
                  Upload a clear photo for visual feature analysis
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Text Description Section */}
        <div className="space-y-4">
          <Label htmlFor="description" className="text-base font-semibold flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Feature Description
          </Label>
          <Textarea
            id="description"
            placeholder="Describe observed medical features (e.g., 'wide-set eyes, prominent forehead, low-set ears, small chin')"
            value={textDescription}
            onChange={(e) => setTextDescription(e.target.value)}
            rows={4}
            className="w-full"
          />
          <p className="text-sm text-slate-500">
            Use medical terminology when possible for better HPO term matching
          </p>
        </div>

        {/* Analysis Button and Progress */}
        <div className="space-y-4">
          <Button 
            onClick={analyzeFeatures}
            disabled={analyzeMutation.isPending}
            className="w-full"
            size="lg"
          >
            {analyzeMutation.isPending ? (
              <>
                <Microscope className="mr-2 h-4 w-4 animate-spin" />
                Analyzing Features...
              </>
            ) : (
              <>
                <Brain className="mr-2 h-4 w-4" />
                Analyze Medical Features
              </>
            )}
          </Button>

          {analyzeMutation.isPending && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{progressInfo.step}</span>
                <span>{Math.round(progressInfo.progress)}%</span>
              </div>
              <Progress value={progressInfo.progress} className="w-full" />
            </div>
          )}
        </div>

        {/* Analysis Results */}
        {analysis && (
          <div className="space-y-6">
            <Separator />
            
            {/* Analysis Summary */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <CheckCircle className="text-green-600" />
                Analysis Results
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Eye className="h-4 w-4 text-blue-600" />
                      <span className="font-semibold">Features Detected</span>
                    </div>
                    <Badge variant="secondary" className="mb-2">
                      {analysis.features.length} features
                    </Badge>
                    <div className="space-y-1">
                      {analysis.features.slice(0, 3).map((feature, idx) => (
                        <p key={idx} className="text-sm text-slate-600">• {feature}</p>
                      ))}
                      {analysis.features.length > 3 && (
                        <p className="text-sm text-slate-500">...and {analysis.features.length - 3} more</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="h-4 w-4 text-green-600" />
                      <span className="font-semibold">Confidence</span>
                    </div>
                    <div className="space-y-2">
                      <Progress value={analysis.confidence * 100} className="w-full" />
                      <p className="text-sm text-slate-600">
                        {(analysis.confidence * 100).toFixed(1)}% analysis confidence
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* HPO Term Matches */}
            {analysis.hpoMatches && analysis.hpoMatches.length > 0 && (
              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <Stethoscope className="h-4 w-4 text-blue-600" />
                  HPO Term Matches
                </h4>
                <div className="grid gap-3">
                  {analysis.hpoMatches.map((match, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{match.label}</p>
                        <p className="text-sm text-slate-500">{match.hpoId}</p>
                      </div>
                      <Badge variant={match.confidence > 0.8 ? "default" : "secondary"}>
                        {(match.confidence * 100).toFixed(0)}% match
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Educational Insights */}
            {analysis.educationalInsights && analysis.educationalInsights.length > 0 && (
              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-amber-600" />
                  Educational Insights
                </h4>
                <div className="space-y-2">
                  {analysis.educationalInsights.map((insight, idx) => (
                    <Alert key={idx}>
                      <AlertDescription>{insight}</AlertDescription>
                    </Alert>
                  ))}
                </div>
              </div>
            )}

            {/* Medical Recommendations */}
            {analysis.suggestions && analysis.suggestions.length > 0 && (
              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-600" />
                  Clinical Recommendations
                </h4>
                <div className="space-y-2">
                  {analysis.suggestions.map((suggestion, idx) => (
                    <div key={idx} className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                      <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm">{suggestion}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Medical Relevance */}
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Medical Relevance:</strong> {analysis.medicalRelevance}
              </AlertDescription>
            </Alert>

            {/* Download Report */}
            <Button variant="outline" className="w-full" onClick={() => {
              const blob = new Blob([analysis.report], { type: 'text/markdown' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'medical-feature-analysis-report.md';
              a.click();
            }}>
              <FileText className="mr-2 h-4 w-4" />
              Download Analysis Report
            </Button>
          </div>
        )}

        {/* Error State */}
        {analyzeMutation.isError && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Failed to analyze features. Please try again or check your connection.
            </AlertDescription>
          </Alert>
        )}

        {/* Educational Notice */}
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Educational Tool:</strong> This analysis is for educational purposes and research support. 
            All findings should be validated by qualified medical professionals.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}