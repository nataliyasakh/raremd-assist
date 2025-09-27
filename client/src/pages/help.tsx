import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BookOpen,
  Stethoscope, 
  Search, 
  FileText, 
  Brain, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Users,
  Target,
  Lightbulb,
  HelpCircle,
  Video,
  Download,
  Shield
} from "lucide-react";

export default function HelpPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <BookOpen className="h-8 w-8 text-blue-600" />
          RareMD Assist - Physician User Guide
        </h1>
        <p className="text-lg text-muted-foreground">
          Comprehensive clinical decision support for rare genetic disease diagnosis
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="workflow">Clinical Workflow</TabsTrigger>
          <TabsTrigger value="features">Key Features</TabsTrigger>
          <TabsTrigger value="safety">Safety & Guidelines</TabsTrigger>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-green-600" />
                Platform Purpose & Clinical Impact
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                RareMD Assist addresses the critical challenge that rare genetic diseases take an average of 
                <strong> 7.6 years to diagnose</strong>. Our AI-powered platform analyzes patient symptoms 
                using HPO (Human Phenotype Ontology) standardized terms and matches them against 300+ 
                ORPHA-coded rare diseases to provide evidence-based diagnostic suggestions.
              </p>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-600" />
                    Target Healthcare Providers
                  </h3>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Primary care physicians with complex cases</li>
                    <li>• Pediatricians managing developmental concerns</li>
                    <li>• Emergency physicians with undiagnosed presentations</li>
                    <li>• Medical residents learning rare disease recognition</li>
                    <li>• Healthcare systems with limited genetics expertise</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-3">Platform Capabilities</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <Badge variant="secondary">300+ Diseases</Badge>
                    <Badge variant="secondary">100+ HPO Terms</Badge>
                    <Badge variant="secondary">ORPHA Codes</Badge>
                    <Badge variant="secondary">ML-Enhanced</Badge>
                    <Badge variant="secondary">85%+ Accuracy</Badge>
                    <Badge variant="secondary">FHIR Compliant</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workflow" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-600" />
                4-Step Clinical Workflow
              </CardTitle>
              <CardDescription>
                How to use RareMD Assist in your clinical practice
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <div className="flex gap-4 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">1</div>
                  <div className="space-y-2">
                    <h4 className="font-medium">Patient Symptom Entry</h4>
                    <p className="text-sm text-muted-foreground">
                      Enter patient symptoms using our HPO-standardized interface. The system supports 
                      natural language input that maps to precise medical terminology (e.g., "delayed development" 
                      → HP:0001263 Global developmental delay).
                    </p>
                    <div className="flex items-center gap-2 text-xs text-blue-600">
                      <Search className="h-3 w-3" />
                      Auto-complete suggests relevant HPO terms
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">2</div>
                  <div className="space-y-2">
                    <h4 className="font-medium">AI-Powered Analysis</h4>
                    <p className="text-sm text-muted-foreground">
                      Our machine learning engine analyzes symptom patterns, calculates disease probability 
                      scores, and considers phenotype specificity, symptom combinations, and demographic factors 
                      to generate ranked diagnostic suggestions.
                    </p>
                    <div className="flex items-center gap-2 text-xs text-green-600">
                      <Brain className="h-3 w-3" />
                      85%+ diagnostic accuracy for covered conditions
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                  <div className="flex-shrink-0 w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">3</div>
                  <div className="space-y-2">
                    <h4 className="font-medium">Evidence-Based Results</h4>
                    <p className="text-sm text-muted-foreground">
                      Review confidence-scored disease matches with detailed reasoning. Each suggestion includes 
                      obligate vs. supporting symptoms, pattern matches, and clinical evidence categorization 
                      to support your diagnostic decision-making.
                    </p>
                    <div className="flex items-center gap-2 text-xs text-orange-600">
                      <CheckCircle className="h-3 w-3" />
                      High/Medium/Low confidence levels with explanations
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                  <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">4</div>
                  <div className="space-y-2">
                    <h4 className="font-medium">Gene Panel Recommendations & Testing Strategy</h4>
                    <p className="text-sm text-muted-foreground">
                      Access evidence-based genetic testing recommendations via PubCaseFinder PanelSearch. 
                      Get targeted gene panels, broad screening options, and strategic testing approaches 
                      with cost estimates and turnaround times for optimal diagnostic efficiency.
                    </p>
                    <div className="flex items-center gap-2 text-xs text-purple-600">
                      <Search className="h-3 w-3" />
                      PubCaseFinder API integration for precision testing
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 p-4 bg-slate-50 dark:bg-slate-950/20 rounded-lg">
                  <div className="flex-shrink-0 w-8 h-8 bg-slate-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">5</div>
                  <div className="space-y-2">
                    <h4 className="font-medium">Clinical Action & Documentation</h4>
                    <p className="text-sm text-muted-foreground">
                      Generate comprehensive reports with treatment recommendations, genetic testing suggestions, 
                      and referral pathways. Access PDF reports with ICD-10 codes and ORPHA classifications 
                      for proper medical documentation and specialist referrals.
                    </p>
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <FileText className="h-3 w-3" />
                      FHIR-compliant documentation ready for EHR integration
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600">
                  <Lightbulb className="h-5 w-5" />
                  Clinical Decision Support
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                    Treatment recommendations with evidence levels (A-D)
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                    Drug interaction checking and contraindication alerts
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                    Genetic testing recommendations and lab codes
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                    Specialist referral pathways and timing guidance
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                    Patient education materials and family counseling
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-600">
                  <Brain className="h-5 w-5" />
                  AI & Machine Learning
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-3 w-3 text-blue-600 mt-0.5 flex-shrink-0" />
                    Pattern recognition for symptom combinations
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-3 w-3 text-blue-600 mt-0.5 flex-shrink-0" />
                    Frequency-weighted phenotype analysis
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-3 w-3 text-blue-600 mt-0.5 flex-shrink-0" />
                    Demographic and temporal factor consideration
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-3 w-3 text-blue-600 mt-0.5 flex-shrink-0" />
                    Confidence scoring with explanation
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-3 w-3 text-blue-600 mt-0.5 flex-shrink-0" />
                    Continuous learning from case outcomes
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-3 w-3 text-blue-600 mt-0.5 flex-shrink-0" />
                    PubCaseFinder integration for gene panel recommendations
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="safety" className="space-y-6">
          <Card className="border-red-200 dark:border-red-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <Shield className="h-5 w-5" />
                Important Clinical Safety Guidelines
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded-lg">
                <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">Critical Reminders</h4>
                <ul className="space-y-2 text-sm text-red-700 dark:text-red-300">
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                    This is a decision support tool, not a replacement for clinical judgment
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                    Always consider additional clinical context and patient history
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                    Genetic confirmation is required for definitive diagnosis
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                    Low confidence results warrant broader differential diagnosis
                  </li>
                </ul>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
                <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Best Practices</h4>
                <ul className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
                  <li className="flex items-start gap-2">
                    <Clock className="h-3 w-3 mt-0.5 flex-shrink-0" />
                    Early intervention improves outcomes for confirmed diagnoses
                  </li>
                  <li className="flex items-start gap-2">
                    <Users className="h-3 w-3 mt-0.5 flex-shrink-0" />
                    Involve genetics specialists for high-confidence matches
                  </li>
                  <li className="flex items-start gap-2">
                    <FileText className="h-3 w-3 mt-0.5 flex-shrink-0" />
                    Document analysis rationale in patient records
                  </li>
                  <li className="flex items-start gap-2">
                    <Stethoscope className="h-3 w-3 mt-0.5 flex-shrink-0" />
                    Re-evaluate as new symptoms emerge or evolve
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="faq" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-purple-600" />
                Frequently Asked Questions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">How accurate is the diagnostic prediction?</h4>
                  <p className="text-sm text-muted-foreground">
                    Our ML engine achieves 85%+ accuracy for covered conditions when sufficient symptoms are provided. 
                    Accuracy varies based on symptom specificity and disease complexity.
                  </p>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-2">How do the gene panel recommendations work?</h4>
                  <p className="text-sm text-muted-foreground">
                    Gene panel suggestions are powered by PubCaseFinder PanelSearch API, providing evidence-based 
                    testing recommendations. The system offers targeted panels, broad screening options, and 
                    strategic testing approaches with clinical considerations and cost estimates.
                  </p>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-2">What should I do with low-confidence results?</h4>
                  <p className="text-sm text-muted-foreground">
                    Low confidence (&lt;50%) suggests either insufficient symptoms or uncommon presentations. 
                    Consider broader differential diagnosis, additional testing, or specialist consultation.
                  </p>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-2">How do I interpret the confidence scores?</h4>
                  <p className="text-sm text-muted-foreground">
                    High (75%+): Strong match, consider genetic testing. Medium (50-74%): Possible match, 
                    gather more clinical data. Low (&lt;50%): Unlikely match, explore alternatives.
                  </p>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-2">Can I use this for emergency diagnosis?</h4>
                  <p className="text-sm text-muted-foreground">
                    While the platform provides rapid analysis, it's designed for complex diagnostic workups 
                    rather than emergency care. Always prioritize immediate clinical needs.
                  </p>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-2">How is patient privacy protected?</h4>
                  <p className="text-sm text-muted-foreground">
                    All case data is de-identified. No PHI is stored or transmitted. The platform follows 
                    HIPAA guidelines and healthcare data protection standards.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}