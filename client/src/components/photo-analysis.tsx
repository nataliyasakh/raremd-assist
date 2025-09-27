import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { 
  Camera, 
  Upload, 
  Eye, 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  Download,
  Stethoscope,
  Brain,
  Target
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface DysmorphicAnalysis {
  suggestedDiagnoses: Array<{
    condition: string;
    orphaCode: string;
    confidence: number;
    reasoning: string;
    keyFeatures: string[];
  }>;
  identifiedFeatures: string[];
  recommendations: string[];
  disclaimer: string;
}

interface PhotoAnalysisProps {
  onAnalysisComplete?: (analysis: DysmorphicAnalysis) => void;
  symptoms?: string[];
}

export default function PhotoAnalysis({ onAnalysisComplete, symptoms = [] }: PhotoAnalysisProps) {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<DysmorphicAnalysis | null>(null);
  const queryClient = useQueryClient();

  const analyzeMutation = useMutation({
    mutationFn: async (imageBase64: string) => {
      const response = await fetch('/api/analyze-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64 })
      });
      
      if (!response.ok) {
        throw new Error('Failed to analyze photo');
      }
      
      return response.json() as Promise<DysmorphicAnalysis>;
    },
    onSuccess: (data) => {
      setAnalysis(data);
      onAnalysisComplete?.(data);
    }
  });

  const reportMutation = useMutation({
    mutationFn: async ({ analysis, symptoms }: { analysis: DysmorphicAnalysis, symptoms: string[] }) => {
      const response = await fetch('/api/generate-clinical-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysis, symptoms })
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate report');
      }
      
      return response.json() as Promise<{ report: string }>;
    }
  });

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        alert('File size must be less than 10MB');
        return;
      }

      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzePhoto = async () => {
    if (!selectedImage) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64String = (reader.result as string).split(',')[1];
      analyzeMutation.mutate(base64String);
    };
    reader.readAsDataURL(selectedImage);
  };

  const generateReport = () => {
    if (analysis) {
      reportMutation.mutate({ analysis, symptoms });
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    if (confidence >= 0.6) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Dysmorphic Feature Analysis
          </CardTitle>
          <CardDescription>
            Upload patient photos to analyze facial features and identify potential genetic conditions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Ensure patient consent for photo analysis. This tool supplements clinical evaluation and requires genetic counseling.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="photo-upload"
                />
                <label htmlFor="photo-upload" className="cursor-pointer">
                  <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Click to upload patient photo
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    JPG, PNG up to 10MB
                  </p>
                </label>
              </div>

              {selectedImage && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Selected: {selectedImage.name}</p>
                  <Button 
                    onClick={analyzePhoto} 
                    disabled={analyzeMutation.isPending}
                    className="w-full"
                  >
                    {analyzeMutation.isPending ? (
                      <>
                        <Brain className="h-4 w-4 mr-2 animate-spin" />
                        Analyzing Features...
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4 mr-2" />
                        Analyze Dysmorphic Features
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>

            {imagePreview && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Preview:</p>
                <img 
                  src={imagePreview} 
                  alt="Patient preview" 
                  className="max-w-full h-48 object-contain rounded-lg border"
                />
              </div>
            )}
          </div>

          {analyzeMutation.isPending && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Analyzing facial features...</span>
                <span>Processing</span>
              </div>
              <Progress value={50} className="w-full" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {analysis && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Analysis Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Identified Features */}
            <div>
              <h4 className="font-medium mb-3">Identified Dysmorphic Features</h4>
              <div className="flex flex-wrap gap-2">
                {analysis.identifiedFeatures.map((feature, index) => (
                  <Badge key={index} variant="outline" className="text-sm">
                    {feature}
                  </Badge>
                ))}
              </div>
            </div>

            <Separator />

            {/* Suggested Diagnoses */}
            <div>
              <h4 className="font-medium mb-3">Suggested Differential Diagnoses</h4>
              <div className="space-y-4">
                {analysis.suggestedDiagnoses.map((diagnosis, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium">{diagnosis.condition}</h5>
                      <div className="flex items-center gap-2">
                        <Badge className={getConfidenceColor(diagnosis.confidence)}>
                          {Math.round(diagnosis.confidence * 100)}% confidence
                        </Badge>
                        <Badge variant="outline">{diagnosis.orphaCode}</Badge>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                      {diagnosis.reasoning}
                    </p>
                    <div>
                      <p className="text-sm font-medium mb-1">Supporting Features:</p>
                      <div className="flex flex-wrap gap-1">
                        {diagnosis.keyFeatures.map((feature, fIndex) => (
                          <Badge key={fIndex} variant="secondary" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Recommendations */}
            <div>
              <h4 className="font-medium mb-3">Recommended Next Steps</h4>
              <ul className="space-y-2">
                {analysis.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 mt-0.5 text-green-600" />
                    <span className="text-sm">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Separator />

            {/* Actions */}
            <div className="flex gap-3">
              <Button onClick={generateReport} disabled={reportMutation.isPending}>
                {reportMutation.isPending ? (
                  <>
                    <FileText className="h-4 w-4 mr-2 animate-pulse" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4 mr-2" />
                    Generate Clinical Report
                  </>
                )}
              </Button>
              
              <Button variant="outline">
                <Stethoscope className="h-4 w-4 mr-2" />
                Add to Case Notes
              </Button>
            </div>

            {/* Clinical Report */}
            {reportMutation.data && (
              <Alert>
                <FileText className="h-4 w-4" />
                <AlertDescription>
                  <div className="mt-2">
                    <h5 className="font-medium mb-2">Generated Clinical Report:</h5>
                    <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded text-sm whitespace-pre-wrap">
                      {reportMutation.data.report}
                    </div>
                    <Button size="sm" variant="outline" className="mt-2">
                      <Download className="h-4 w-4 mr-2" />
                      Download Report
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Disclaimer */}
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                {analysis.disclaimer}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  );
}