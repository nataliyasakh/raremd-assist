import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TestTube2, Save, AlertTriangle, CheckCircle, Clock, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface DiseaseMarker {
  id: number;
  orphaCode: string;
  diseaseName: string;
  markerName: string;
  markerType: string;
  testMethod: string;
  normalRange: string;
  abnormalRange: string;
  units: string;
  sensitivity: string;
  specificity: string;
  clinicalSignificance: string;
}

interface TestConfirmation {
  id?: number;
  markerId: number;
  markerName: string;
  patientValue: string;
  units: string;
  normalRange: string;
  interpretation: 'normal' | 'abnormal_high' | 'abnormal_low' | 'critical';
  confirmationStatus: 'pending' | 'confirmed' | 'ruled_out';
  physicianNotes: string;
  testDate?: Date;
}

interface LaboratoryTestConfirmationProps {
  orphaCode: string;
  diseaseName: string;
  caseId?: number;
  onConfirmation?: (confirmed: boolean) => void;
}

export default function LaboratoryTestConfirmation({ 
  orphaCode, 
  diseaseName, 
  caseId,
  onConfirmation 
}: LaboratoryTestConfirmationProps) {
  const [selectedMarkers, setSelectedMarkers] = useState<number[]>([]);
  const [testResults, setTestResults] = useState<Record<number, TestConfirmation>>({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch disease markers
  const { data: markers = [], isLoading: markersLoading } = useQuery({
    queryKey: ['/api/disease-markers', orphaCode],
  });

  // Fetch existing test confirmations
  const { data: existingTests = [] } = useQuery({
    queryKey: ['/api/test-confirmations', caseId],
    enabled: !!caseId
  });

  const saveTestConfirmation = useMutation({
    mutationFn: async (testData: TestConfirmation) => {
      return apiRequest('POST', '/api/test-confirmations', {
        caseId,
        orphaCode,
        diseaseName,
        ...testData
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/test-confirmations'] });
      toast({
        title: "Test Result Saved",
        description: "Laboratory test result has been recorded."
      });
    },
    onError: () => {
      toast({
        title: "Save Failed",
        description: "Failed to save test result. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleMarkerSelect = (markerId: number) => {
    if (selectedMarkers.includes(markerId)) {
      setSelectedMarkers(prev => prev.filter(id => id !== markerId));
      const newResults = { ...testResults };
      delete newResults[markerId];
      setTestResults(newResults);
    } else {
      setSelectedMarkers(prev => [...prev, markerId]);
    }
  };

  const handleTestValueChange = (markerId: number, field: keyof TestConfirmation, value: string) => {
    const marker = markers.find((m: DiseaseMarker) => m.id === markerId);
    if (!marker) return;

    setTestResults(prev => ({
      ...prev,
      [markerId]: {
        ...prev[markerId],
        markerId,
        markerName: marker.markerName,
        units: marker.units,
        normalRange: marker.normalRange,
        [field]: value,
      } as TestConfirmation
    }));
  };

  const interpretResult = (patientValue: string, marker: DiseaseMarker): string => {
    if (!patientValue || !marker.abnormalRange) return 'normal';
    
    // Simple interpretation logic - would need more sophisticated parsing in production
    const value = parseFloat(patientValue);
    if (isNaN(value)) return 'normal';

    // Check if abnormal range indicates high or low
    if (marker.abnormalRange.includes('>')) {
      const threshold = parseFloat(marker.abnormalRange.replace(/[^0-9.]/g, ''));
      return value > threshold ? 'abnormal_high' : 'normal';
    } else if (marker.abnormalRange.includes('<')) {
      const threshold = parseFloat(marker.abnormalRange.replace(/[^0-9.]/g, ''));
      return value < threshold ? 'abnormal_low' : 'normal';
    }
    
    return 'normal';
  };

  const handleSaveTest = (markerId: number) => {
    const testResult = testResults[markerId];
    const marker = markers.find((m: DiseaseMarker) => m.id === markerId);
    
    if (!testResult?.patientValue || !marker) {
      toast({
        title: "Missing Information",
        description: "Please enter a test value before saving.",
        variant: "destructive"
      });
      return;
    }

    const interpretation = interpretResult(testResult.patientValue, marker);
    const finalTestResult = {
      ...testResult,
      interpretation,
      confirmationStatus: interpretation === 'normal' ? 'ruled_out' : 'confirmed',
      testDate: new Date()
    } as TestConfirmation;

    saveTestConfirmation.mutate(finalTestResult);
  };

  const getInterpretationColor = (interpretation: string) => {
    switch (interpretation) {
      case 'normal': return 'bg-green-100 text-green-800';
      case 'abnormal_high': 
      case 'abnormal_low': return 'bg-yellow-100 text-yellow-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'ruled_out': return <X className="w-4 h-4 text-red-600" />;
      default: return <Clock className="w-4 h-4 text-yellow-600" />;
    }
  };

  if (markersLoading) {
    return (
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" data-testid="button-tests">
            <TestTube2 className="w-4 h-4 mr-1" />
            Tests
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-center p-8">
            <div className="text-center">Loading test markers...</div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" data-testid="button-tests">
          <TestTube2 className="w-4 h-4 mr-1" />
          Tests
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TestTube2 className="w-5 h-5" />
            Laboratory Test Confirmation - {diseaseName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Available Markers */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Available Disease Markers</h3>
            <div className="grid gap-3">
              {markers.map((marker: DiseaseMarker) => (
                <Card 
                  key={marker.id} 
                  className={`cursor-pointer transition-colors ${
                    selectedMarkers.includes(marker.id) ? 'border-blue-500 bg-blue-50' : ''
                  }`}
                  onClick={() => handleMarkerSelect(marker.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium">{marker.markerName}</h4>
                          <Badge variant="secondary" className="text-xs">
                            {marker.markerType}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {marker.testMethod}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div><strong>Normal Range:</strong> {marker.normalRange} {marker.units}</div>
                          <div><strong>Abnormal Range:</strong> {marker.abnormalRange} {marker.units}</div>
                          <div><strong>Sensitivity:</strong> {marker.sensitivity} | <strong>Specificity:</strong> {marker.specificity}</div>
                          <div className="text-xs mt-2">{marker.clinicalSignificance}</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Selected Tests Input */}
          {selectedMarkers.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Enter Test Results</h3>
              <div className="space-y-4">
                {selectedMarkers.map(markerId => {
                  const marker = markers.find((m: DiseaseMarker) => m.id === markerId);
                  const testResult = testResults[markerId];
                  if (!marker) return null;

                  return (
                    <Card key={markerId} className="border-l-4 border-l-blue-500">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">{marker.markerName}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor={`value-${markerId}`}>Patient Value</Label>
                            <div className="flex gap-2">
                              <Input
                                id={`value-${markerId}`}
                                placeholder="Enter value"
                                value={testResult?.patientValue || ''}
                                onChange={(e) => handleTestValueChange(markerId, 'patientValue', e.target.value)}
                                data-testid={`input-patient-value-${markerId}`}
                              />
                              <span className="text-sm text-gray-500 flex items-center px-2">
                                {marker.units}
                              </span>
                            </div>
                          </div>
                          
                          <div>
                            <Label htmlFor={`status-${markerId}`}>Confirmation Status</Label>
                            <Select
                              value={testResult?.confirmationStatus || 'pending'}
                              onValueChange={(value) => handleTestValueChange(markerId, 'confirmationStatus', value)}
                            >
                              <SelectTrigger data-testid={`select-status-${markerId}`}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending Review</SelectItem>
                                <SelectItem value="confirmed">Confirmed Diagnosis</SelectItem>
                                <SelectItem value="ruled_out">Ruled Out</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="flex items-end">
                            {testResult?.patientValue && (
                              <Badge 
                                className={getInterpretationColor(
                                  interpretResult(testResult.patientValue, marker)
                                )}
                              >
                                {interpretResult(testResult.patientValue, marker).replace('_', ' ')}
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div>
                          <Label htmlFor={`notes-${markerId}`}>Physician Notes</Label>
                          <Textarea
                            id={`notes-${markerId}`}
                            placeholder="Add clinical interpretation, context, or additional notes..."
                            value={testResult?.physicianNotes || ''}
                            onChange={(e) => handleTestValueChange(markerId, 'physicianNotes', e.target.value)}
                            className="min-h-[80px]"
                            data-testid={`textarea-notes-${markerId}`}
                          />
                        </div>

                        <div className="flex justify-between items-center pt-2">
                          <div className="text-sm text-gray-600">
                            <strong>Normal:</strong> {marker.normalRange} {marker.units}
                          </div>
                          <Button
                            onClick={() => handleSaveTest(markerId)}
                            disabled={!testResult?.patientValue || saveTestConfirmation.isPending}
                            data-testid={`button-save-test-${markerId}`}
                          >
                            {saveTestConfirmation.isPending ? (
                              <>
                                <Clock className="w-4 h-4 mr-1 animate-spin" />
                                Saving...
                              </>
                            ) : (
                              <>
                                <Save className="w-4 h-4 mr-1" />
                                Save Test
                              </>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Existing Test Results */}
          {existingTests.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Previous Test Results</h3>
              <div className="space-y-2">
                {existingTests.map((test: any) => (
                  <div key={test.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(test.confirmationStatus)}
                      <div>
                        <div className="font-medium">{test.markerName}</div>
                        <div className="text-sm text-gray-600">
                          {test.patientValue} {test.units} 
                          {test.testDate && ` • ${new Date(test.testDate).toLocaleDateString()}`}
                        </div>
                      </div>
                    </div>
                    <Badge className={getInterpretationColor(test.interpretation)}>
                      {test.interpretation.replace('_', ' ')}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {markers.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <TestTube2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No specific laboratory markers available for this disease.</p>
              <p className="text-sm mt-1">Standard genetic testing and clinical evaluation recommended.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}