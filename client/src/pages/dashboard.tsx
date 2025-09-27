import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Dna, 
  BriefcaseMedical, 
  UserRound, 
  ClipboardList, 
  TriangleAlert, 
  CheckCircle, 
  Database,
  Stethoscope,
  ListEnd,
  History,
  Bolt,
  Plus,
  Download,
  BarChart3,
  Settings,
  Circle,
  User,
  GraduationCap,
  RefreshCw,
  Loader2
} from "lucide-react";
import DashboardStats from "@/components/dashboard-stats";
import SymptomEntry from "@/components/symptom-entry";
import DiseaseRanking from "@/components/disease-ranking";
import RecentCases from "@/components/recent-cases";
import QuickActions from "@/components/quick-actions";
import EnhancedPhotoAnalysis from "@/components/enhanced-photo-analysis";
import CDSSPanel from "@/components/cdss-panel";
import PhysicianGuide from "@/components/physician-guide";
import GenePanelRecommendations from "@/components/gene-panel-recommendations";
import DatabaseManagement from "@/components/database-management";
import type { Analytics } from "@shared/schema";

export default function Dashboard() {
  const [selectedSymptoms, setSelectedSymptoms] = useState<Array<{
    hpoId: string;
    label: string;
    frequency?: string;
  }>>([]);

  const [analysisResults, setAnalysisResults] = useState<any[]>([]);

  const { data: analytics } = useQuery<Analytics>({
    queryKey: ['/api/analytics'],
  });

  return (
    <>
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Physician Usage Guide */}
        <PhysicianGuide />

        {/* Dashboard Stats */}
        <DashboardStats analytics={analytics} />

        {/* Database Management Section - Prominent placement */}
        <div className="mb-8">
          <DatabaseManagement />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Symptom Entry Card */}
          <SymptomEntry 
            selectedSymptoms={selectedSymptoms}
            onSymptomsChange={setSelectedSymptoms}
            onAnalysisComplete={setAnalysisResults}
          />

          {/* Disease Ranking Results */}
          <DiseaseRanking 
            results={analysisResults}
            symptoms={selectedSymptoms}
          />
        </div>

        {/* Enhanced AI Photo Analysis Section */}
        <div className="mt-8">
          <EnhancedPhotoAnalysis 
            symptoms={selectedSymptoms.map(s => s.label)}
            onFeaturesDetected={(features) => {
              // Auto-add detected features as symptoms if they match HPO terms
              console.log('AI detected features:', features);
            }}
          />
        </div>

        {/* Gene Panel Recommendations - Always visible for demo */}
        <div className="mt-8">
          <GenePanelRecommendations
            symptoms={selectedSymptoms.length > 0 ? selectedSymptoms.map(s => s.label) : ['intellectual disability', 'seizures']}
            suspectedDiagnosis={analysisResults[0]?.disease?.name || 'Rett syndrome'}
            orphaCode={analysisResults[0]?.disease?.orphaCode || 'ORPHA:778'}
            isVisible={true}
          />
        </div>

        {/* Clinical Decision Support System - Always visible */}
        <div className="mt-8">
          <CDSSPanel 
            diagnosis={analysisResults[0]?.disease?.name}
            orphaCode={analysisResults[0]?.disease?.orphaCode}
            symptoms={selectedSymptoms.map(s => ({ ...s, frequency: s.frequency || '' }))}
            patientAge={25}
            patientSex="unknown"
          />
        </div>

        {/* Recent Cases & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          {/* Recent Cases */}
          <div className="lg:col-span-2">
            <RecentCases />
          </div>

          {/* Quick Actions */}
          <QuickActions />
        </div>
      </main>
    </>
  );
}
