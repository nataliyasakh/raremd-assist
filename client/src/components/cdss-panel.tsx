import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  Brain, 
  Pill, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  FileText,
  Activity,
  Shield,
  Zap,
  Stethoscope,
  Database,
  Network
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface TreatmentRecommendation {
  treatmentId: string;
  name: string;
  type: 'medication' | 'therapy' | 'surgery' | 'monitoring' | 'lifestyle';
  evidenceLevel: 'A' | 'B' | 'C' | 'D';
  description: string;
  dosage?: string;
  duration?: string;
  contraindications: string[];
  interactions: string[];
  monitoringRequirements: string[];
  priority: 'high' | 'medium' | 'low';
}

interface RiskAssessment {
  category: string;
  level: 'critical' | 'high' | 'moderate' | 'low';
  score: number;
  factors: string[];
  recommendations: string[];
  urgency: 'immediate' | 'within-24h' | 'within-week' | 'routine';
}

interface CDSSPanelProps {
  diagnosis?: string;
  orphaCode?: string;
  symptoms?: Array<{ hpoId: string; label: string; frequency: string }>;
  patientAge?: number;
  patientSex?: string;
}

export default function CDSSPanel({ 
  diagnosis, 
  orphaCode, 
  symptoms = [], 
  patientAge, 
  patientSex 
}: CDSSPanelProps) {
  const [medications, setMedications] = useState<string[]>([]);
  const [newMedication, setNewMedication] = useState("");
  const [activeTab, setActiveTab] = useState("treatments");

  // Treatment Recommendations
  const treatmentsMutation = useMutation({
    mutationFn: async () => {
      if (!diagnosis || !orphaCode) throw new Error("Diagnosis required");
      
      const response = await fetch('/api/cdss/treatments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          diagnosis,
          orphaCode,
          patientAge,
          patientSex,
          comorbidities: []
        })
      });
      
      if (!response.ok) throw new Error('Failed to get treatments');
      return response.json() as Promise<TreatmentRecommendation[]>;
    }
  });

  // Drug Interaction Check
  const interactionsMutation = useMutation({
    mutationFn: async (meds: string[]) => {
      const response = await fetch('/api/cdss/drug-interactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ medications: meds })
      });
      
      if (!response.ok) throw new Error('Failed to check interactions');
      return response.json();
    }
  });

  // Risk Assessment
  const riskMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/cdss/risk-assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symptoms,
          diagnosis,
          patientAge
        })
      });
      
      if (!response.ok) throw new Error('Failed to assess risk');
      return response.json() as Promise<RiskAssessment[]>;
    }
  });

  // Clinical Pathway
  const pathwayMutation = useMutation({
    mutationFn: async () => {
      if (!diagnosis || !orphaCode) throw new Error("Diagnosis required");
      
      const response = await fetch('/api/cdss/clinical-pathway', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          diagnosis,
          orphaCode
        })
      });
      
      if (!response.ok) throw new Error('Failed to get pathway');
      return response.json();
    }
  });

  const addMedication = () => {
    if (newMedication.trim() && !medications.includes(newMedication.trim())) {
      const updatedMeds = [...medications, newMedication.trim()];
      setMedications(updatedMeds);
      setNewMedication("");
      
      // Auto-check interactions when adding medication
      if (updatedMeds.length > 1) {
        interactionsMutation.mutate(updatedMeds);
      }
    }
  };

  const removeMedication = (med: string) => {
    const updatedMeds = medications.filter(m => m !== med);
    setMedications(updatedMeds);
    
    if (updatedMeds.length > 1) {
      interactionsMutation.mutate(updatedMeds);
    }
  };

  const getEvidenceBadgeColor = (level: string) => {
    switch (level) {
      case 'A': return 'bg-green-100 text-green-800';
      case 'B': return 'bg-blue-100 text-blue-800';
      case 'C': return 'bg-yellow-100 text-yellow-800';
      case 'D': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskBadgeColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'moderate': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="text-blue-600" />
          Clinical Decision Support System
        </CardTitle>
        <p className="text-sm text-slate-600">
          Evidence-based treatment recommendations, risk assessment, and clinical pathways
        </p>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="treatments" className="text-xs">
              <Pill className="w-3 h-3 mr-1" />
              Treatments
            </TabsTrigger>
            <TabsTrigger value="interactions" className="text-xs">
              <AlertTriangle className="w-3 h-3 mr-1" />
              Drug Checks
            </TabsTrigger>
            <TabsTrigger value="risk" className="text-xs">
              <Shield className="w-3 h-3 mr-1" />
              Risk Assessment
            </TabsTrigger>
            <TabsTrigger value="pathway" className="text-xs">
              <Activity className="w-3 h-3 mr-1" />
              Clinical Path
            </TabsTrigger>
          </TabsList>

          {/* Treatment Recommendations Tab */}
          <TabsContent value="treatments" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Evidence-Based Treatments</h3>
              <Button 
                onClick={() => treatmentsMutation.mutate()}
                disabled={!diagnosis || !orphaCode || treatmentsMutation.isPending}
                size="sm"
              >
                {treatmentsMutation.isPending ? (
                  <>
                    <Zap className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Stethoscope className="w-4 h-4 mr-2" />
                    Get Recommendations
                  </>
                )}
              </Button>
            </div>

            {treatmentsMutation.data && treatmentsMutation.data.length > 0 && (
              <div className="space-y-4">
                {treatmentsMutation.data.map((treatment) => (
                  <Card key={treatment.treatmentId} className="border-l-4 border-l-blue-500">
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold">{treatment.name}</h4>
                          <p className="text-sm text-slate-600">{treatment.description}</p>
                        </div>
                        <div className="flex gap-2">
                          <Badge className={getEvidenceBadgeColor(treatment.evidenceLevel)}>
                            Evidence {treatment.evidenceLevel}
                          </Badge>
                          <Badge variant={treatment.priority === 'high' ? 'default' : 'secondary'}>
                            {treatment.priority} priority
                          </Badge>
                        </div>
                      </div>

                      {treatment.dosage && (
                        <div className="mb-2">
                          <span className="text-sm font-medium">Dosage: </span>
                          <span className="text-sm">{treatment.dosage}</span>
                        </div>
                      )}

                      {treatment.contraindications.length > 0 && (
                        <div className="mb-2">
                          <span className="text-sm font-medium text-red-600">Contraindications: </span>
                          <span className="text-sm">{treatment.contraindications.join(', ')}</span>
                        </div>
                      )}

                      {treatment.monitoringRequirements.length > 0 && (
                        <div>
                          <span className="text-sm font-medium">Monitoring: </span>
                          <span className="text-sm">{treatment.monitoringRequirements.join(', ')}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {!diagnosis && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  A diagnosis is required to generate treatment recommendations.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          {/* Drug Interactions Tab */}
          <TabsContent value="interactions" className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-3">Drug Interaction Checker</h3>
              
              <div className="flex gap-2 mb-4">
                <Input
                  placeholder="Enter medication name..."
                  value={newMedication}
                  onChange={(e) => setNewMedication(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addMedication()}
                />
                <Button onClick={addMedication} size="sm">
                  Add
                </Button>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {medications.map((med) => (
                  <Badge key={med} variant="secondary" className="cursor-pointer" 
                        onClick={() => removeMedication(med)}>
                    {med} ×
                  </Badge>
                ))}
              </div>

              {interactionsMutation.data && (
                <div className="space-y-3">
                  {interactionsMutation.data.interactions.length > 0 ? (
                    <>
                      <h4 className="font-semibold text-orange-600">Drug Interactions Found</h4>
                      {interactionsMutation.data.interactions.map((interaction: any, idx: number) => (
                        <Alert key={idx} variant="destructive">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            <strong>{interaction.drug1} ↔ {interaction.drug2}</strong>
                            <br />
                            {interaction.description}
                            <br />
                            <em>Recommendations: {interaction.recommendations.join(', ')}</em>
                          </AlertDescription>
                        </Alert>
                      ))}
                    </>
                  ) : medications.length > 1 ? (
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        No significant interactions found between current medications.
                      </AlertDescription>
                    </Alert>
                  ) : null}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Risk Assessment Tab */}
          <TabsContent value="risk" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Risk Stratification</h3>
              <Button 
                onClick={() => riskMutation.mutate()}
                disabled={symptoms.length === 0 || riskMutation.isPending}
                size="sm"
              >
                {riskMutation.isPending ? (
                  <>
                    <Zap className="w-4 h-4 mr-2 animate-spin" />
                    Assessing...
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4 mr-2" />
                    Assess Risk
                  </>
                )}
              </Button>
            </div>

            {riskMutation.data && riskMutation.data.length > 0 && (
              <div className="space-y-4">
                {riskMutation.data.map((risk: RiskAssessment, idx: number) => (
                  <Card key={idx} className="border-l-4 border-l-orange-500">
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold">{risk.category} Risk</h4>
                        <div className="flex gap-2">
                          <Badge className={getRiskBadgeColor(risk.level)}>
                            {risk.level.toUpperCase()}
                          </Badge>
                          <Badge variant="outline">
                            Score: {risk.score}
                          </Badge>
                        </div>
                      </div>

                      <div className="mb-3">
                        <span className="text-sm font-medium">Risk Factors: </span>
                        <span className="text-sm">{risk.factors.join(', ')}</span>
                      </div>

                      <div className="mb-3">
                        <span className="text-sm font-medium">Urgency: </span>
                        <Badge variant={risk.urgency === 'immediate' ? 'destructive' : 'secondary'}>
                          {risk.urgency}
                        </Badge>
                      </div>

                      <div>
                        <span className="text-sm font-medium">Recommendations:</span>
                        <ul className="text-sm mt-1 ml-4 list-disc">
                          {risk.recommendations.map((rec, i) => (
                            <li key={i}>{rec}</li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {symptoms.length === 0 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Patient symptoms are required to perform risk assessment.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          {/* Clinical Pathway Tab */}
          <TabsContent value="pathway" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Clinical Pathway</h3>
              <Button 
                onClick={() => pathwayMutation.mutate()}
                disabled={!diagnosis || !orphaCode || pathwayMutation.isPending}
                size="sm"
              >
                {pathwayMutation.isPending ? (
                  <>
                    <Zap className="w-4 h-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <Activity className="w-4 h-4 mr-2" />
                    Get Pathway
                  </>
                )}
              </Button>
            </div>

            {pathwayMutation.data && (
              <div className="space-y-4">
                {pathwayMutation.data.pathway.map((step: any, idx: number) => (
                  <Card key={step.stepId} 
                        className={`border-l-4 ${idx <= pathwayMutation.data.currentStepIndex ? 'border-l-green-500' : 'border-l-gray-300'}`}>
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2 mb-2">
                        {idx <= pathwayMutation.data.currentStepIndex ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <Clock className="w-5 h-5 text-gray-400" />
                        )}
                        <h4 className="font-semibold">{step.title}</h4>
                        <Badge variant="outline">{step.timeframe}</Badge>
                      </div>

                      <p className="text-sm text-slate-600 mb-3">{step.description}</p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <span className="text-sm font-medium">Actions:</span>
                          <ul className="text-sm mt-1 ml-4 list-disc">
                            {step.actions.map((action: string, i: number) => (
                              <li key={i}>{action}</li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <span className="text-sm font-medium">Expected Outcomes:</span>
                          <ul className="text-sm mt-1 ml-4 list-disc">
                            {step.expectedOutcomes.map((outcome: string, i: number) => (
                              <li key={i}>{outcome}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {!diagnosis && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  A diagnosis is required to display the clinical pathway.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>
        </Tabs>

        {/* EHR Integration Status */}
        <Separator className="my-6" />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium">EHR Integration</span>
          </div>
          <div className="flex items-center gap-2">
            <Network className="w-4 h-4 text-green-600" />
            <Badge variant="secondary">FHIR R4 Ready</Badge>
            <Badge variant="outline">Epic • Cerner • athenahealth</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}