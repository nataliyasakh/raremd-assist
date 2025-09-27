import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Stethoscope, 
  ChevronDown, 
  ChevronUp, 
  Target, 
  Users, 
  Clock,
  Info
} from "lucide-react";

export default function ClinicalWorkflowBanner() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className="border-l-4 border-l-blue-600 bg-gradient-to-r from-blue-50 to-slate-50 dark:from-blue-950/20 dark:to-slate-900 mb-6">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Stethoscope className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-semibold">Clinical Decision Support for Rare Disease Diagnosis</h2>
            </div>
            
            <p className="text-sm text-muted-foreground max-w-4xl">
              AI-powered platform analyzing patient symptoms against 300+ ORPHA-coded rare diseases. 
              Reduces diagnostic delays from an average of 7.6 years through HPO-standardized phenotype matching.
            </p>

            <div className="flex flex-wrap gap-2 mt-3">
              <Badge variant="secondary" className="text-xs">
                <Target className="h-3 w-3 mr-1" />
                85%+ Accuracy
              </Badge>
              <Badge variant="secondary" className="text-xs">
                <Users className="h-3 w-3 mr-1" />
                Primary Care Ready
              </Badge>
              <Badge variant="secondary" className="text-xs">
                <Clock className="h-3 w-3 mr-1" />
                &lt;500ms Analysis
              </Badge>
              <Badge variant="secondary" className="text-xs">
                <Info className="h-3 w-3 mr-1" />
                Evidence-Based
              </Badge>
            </div>
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
                Usage Guide
              </>
            )}
          </Button>
        </div>

        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-3">
                <h3 className="font-medium text-blue-700 dark:text-blue-300">Quick Start Workflow:</h3>
                <ol className="space-y-1 text-muted-foreground">
                  <li><strong>1.</strong> Enter patient symptoms using HPO-standardized terms</li>
                  <li><strong>2.</strong> Review AI-generated disease matches with confidence scores</li>
                  <li><strong>3.</strong> Access clinical recommendations and testing guidance</li>
                  <li><strong>4.</strong> Generate referral documentation with ORPHA codes</li>
                </ol>
              </div>
              
              <div className="space-y-3">
                <h3 className="font-medium text-blue-700 dark:text-blue-300">Clinical Applications:</h3>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Complex pediatric developmental presentations</li>
                  <li>• Multi-system disorders with unclear etiology</li>
                  <li>• Patients with multiple congenital anomalies</li>
                  <li>• Family history suggesting genetic component</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
              <p className="text-xs text-amber-800 dark:text-amber-200">
                <strong>Clinical Reminder:</strong> This platform provides decision support to enhance clinical judgment. 
                Always consider full patient context and seek genetic confirmation for definitive diagnosis.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}