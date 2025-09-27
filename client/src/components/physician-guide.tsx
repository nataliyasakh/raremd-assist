import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
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
  ChevronDown,
  ChevronUp,
  Info,
  Globe
} from "lucide-react";

export default function PhysicianGuide() {
  const [isExpanded, setIsExpanded] = useState(false);
  return (
    <Card className="mb-6 border-l-4 border-l-blue-600">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5 text-blue-600" />
            <CardTitle>RareMD Assist - Educational & Clinical Platform for Rare Genetic Diseases</CardTitle>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="ml-4"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-4 w-4 mr-1" />
                Hide Guide
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-1" />
                Show Guide
              </>
            )}
          </Button>
        </div>
        <CardDescription>
          Comprehensive educational and clinical platform combining AI-powered diagnostics with community-driven learning for physicians and trainees in rare genetic diseases
        </CardDescription>
        
        {/* Quick stats when collapsed */}
        {!isExpanded && (
          <div className="flex flex-wrap gap-2 mt-3">
            <Badge variant="secondary" className="text-xs">
              <Target className="h-3 w-3 mr-1" />
              3,000+ Diseases
            </Badge>
            <Badge variant="secondary" className="text-xs">
              <Brain className="h-3 w-3 mr-1" />
              1,500+ HPO Terms
            </Badge>
            <Badge variant="secondary" className="text-xs">
              <Users className="h-3 w-3 mr-1" />
              Educational & Clinical
            </Badge>
            <Badge variant="secondary" className="text-xs">
              <Info className="h-3 w-3 mr-1" />
              Community Learning
            </Badge>
          </div>
        )}
      </CardHeader>
      {isExpanded && (
        <CardContent className="space-y-6">
        {/* Platform Overview */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Target className="h-4 w-4 text-green-600" />
              Purpose & Clinical Impact
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              RareMD Assist is a comprehensive educational and clinical platform designed for physicians 
              and trainees in rare genetic diseases. Addressing the critical challenge that rare diseases 
              take an average of <strong>7.6 years to diagnose</strong>, our platform combines AI-powered 
              diagnostic support with community-driven learning resources, analyzing symptoms using 1,500+ HPO 
              terms matched against 3,000+ ORPHA-coded rare diseases.
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">3,000+ Diseases</Badge>
              <Badge variant="secondary">1,500+ HPO Terms</Badge>
              <Badge variant="secondary">Educational Platform</Badge>
              <Badge variant="secondary">Community Features</Badge>
            </div>
          </div>
          
          <div className="space-y-3">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-600" />
              Target Users
            </h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• <strong>Medical trainees and residents</strong> learning rare disease recognition</li>
              <li>• <strong>Primary care physicians</strong> encountering complex cases</li>
              <li>• <strong>Pediatricians</strong> managing developmental concerns</li>
              <li>• <strong>Emergency physicians</strong> with undiagnosed presentations</li>
              <li>• <strong>Medical educators</strong> seeking teaching resources and case studies</li>
              <li>• <strong>Healthcare systems</strong> in regions with limited genetics expertise</li>
            </ul>
          </div>
        </div>

        <Separator />

        {/* Clinical Workflow */}
        <div>
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <Brain className="h-4 w-4 text-purple-600" />
            Clinical Workflow - How to Use RareMD Assist
          </h3>
          
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
        </div>

        <Separator />

        {/* Key Features for Physicians */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-yellow-600" />
              Clinical Decision Support Features
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
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
                Advanced gene panel suggestions via PubCaseFinder PanelSearch
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                Patient education materials and family counseling resources
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              Important Clinical Considerations
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <AlertTriangle className="h-3 w-3 text-red-600 mt-0.5 flex-shrink-0" />
                This is a decision support tool, not a replacement for clinical judgment
              </li>
              <li className="flex items-start gap-2">
                <AlertTriangle className="h-3 w-3 text-red-600 mt-0.5 flex-shrink-0" />
                Always consider additional clinical context and patient history
              </li>
              <li className="flex items-start gap-2">
                <AlertTriangle className="h-3 w-3 text-red-600 mt-0.5 flex-shrink-0" />
                Genetic confirmation is required for definitive diagnosis
              </li>
              <li className="flex items-start gap-2">
                <AlertTriangle className="h-3 w-3 text-red-600 mt-0.5 flex-shrink-0" />
                Low confidence results warrant broader differential diagnosis
              </li>
              <li className="flex items-start gap-2">
                <Clock className="h-3 w-3 text-blue-600 mt-0.5 flex-shrink-0" />
                Early intervention improves outcomes for confirmed diagnoses
              </li>
            </ul>
          </div>
        </div>

        <Separator />

        {/* Community Learning Features */}
        <div>
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <Users className="h-4 w-4 text-indigo-600" />
            Community-Driven Educational Features (iGEM 2025)
          </h3>
          
          <div className="grid gap-4">
            <div className="flex gap-4 p-4 bg-indigo-50 dark:bg-indigo-950/20 rounded-lg">
              <div className="flex-shrink-0 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">1</div>
              <div className="space-y-2">
                <h4 className="font-medium">Community Case Repository</h4>
                <p className="text-sm text-muted-foreground">
                  Access anonymized clinical cases shared by physicians worldwide for educational purposes. 
                  Contribute your own cases (fully de-identified) to help train the next generation of 
                  rare disease specialists and build collective medical knowledge.
                </p>
                <div className="flex items-center gap-2 text-xs text-indigo-600">
                  <Users className="h-3 w-3" />
                  Anonymous case sharing for medical education
                </div>
              </div>
            </div>

            <div className="flex gap-4 p-4 bg-cyan-50 dark:bg-cyan-950/20 rounded-lg">
              <div className="flex-shrink-0 w-8 h-8 bg-cyan-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">2</div>
              <div className="space-y-2">
                <h4 className="font-medium">Global Phenotype Mapping</h4>
                <p className="text-sm text-muted-foreground">
                  Explore worldwide distribution patterns of rare disease phenotypes across 18+ countries. 
                  Understand regional variations in symptom presentation, prevalence data, and help 
                  identify geographic clusters that inform public health strategies.
                </p>
                <div className="flex items-center gap-2 text-xs text-cyan-600">
                  <Globe className="h-3 w-3" />
                  Worldwide phenotype distribution patterns from 5 continents
                </div>
              </div>
            </div>

            <div className="flex gap-4 p-4 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg">
              <div className="flex-shrink-0 w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">3</div>
              <div className="space-y-2">
                <h4 className="font-medium">Collaborative Diagnostic Challenges</h4>
                <p className="text-sm text-muted-foreground">
                  Practice diagnostic skills with 8+ complex clinical scenarios spanning neonatal to adult cases 
                  across multiple specialties. Participate in collaborative problem-solving and track your 
                  diagnostic accuracy improvement over time.
                </p>
                <div className="flex items-center gap-2 text-xs text-emerald-600">
                  <Brain className="h-3 w-3" />
                  Interactive learning through real clinical scenarios
                </div>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Getting Started */}
        <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Ready to Begin? Explore Our Educational & Clinical Features</h4>
          <p className="text-sm text-muted-foreground mb-3">
            Start with <strong>Dashboard</strong> for case analysis, explore <strong>Community Features</strong> for collaborative learning, 
            use <strong>Knowledge Base</strong> for disease reference, and practice with <strong>Test Cases</strong> for skill development.
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">Dashboard: Case Analysis</Badge>
            <Badge variant="outline">Community Repository: Shared Cases</Badge>
            <Badge variant="outline">Global Mapping: Phenotype Patterns</Badge>
            <Badge variant="outline">Diagnostic Challenges: Learning Scenarios</Badge>
            <Badge variant="outline">Knowledge Base: Disease Reference</Badge>
            <Badge variant="outline">Gene Panels: Testing Guidance</Badge>
          </div>
        </div>
        </CardContent>
      )}
    </Card>
  );
}