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
  Circle
} from "lucide-react";
import DashboardStats from "@/components/dashboard-stats";
import SymptomEntry from "@/components/symptom-entry";
import DiseaseRanking from "@/components/disease-ranking";
import RecentCases from "@/components/recent-cases";
import QuickActions from "@/components/quick-actions";
import PhotoAnalysis from "@/components/photo-analysis";
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
    <div className="min-h-screen bg-slate-50">
      {/* Navigation Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Dna className="medical-blue text-2xl" />
                <h1 className="text-xl font-bold text-slate-900">RareMD Assist</h1>
              </div>
              <span className="text-sm professional-gray">Physician Support for Rare Genetic Diseases</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm" 
                className="medical-blue hover:bg-blue-50"
                onClick={() => window.location.href = '/knowledge-base'}
              >
                <BriefcaseMedical className="mr-2 h-4 w-4" />
                Knowledge Base
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="medical-blue hover:bg-blue-50"
                onClick={() => window.location.href = '/test-cases'}
              >
                <ClipboardList className="mr-2 h-4 w-4" />
                Test Cases
              </Button>
              <Button variant="ghost" size="sm" className="professional-gray hover:bg-slate-100">
                <UserRound className="mr-2 h-4 w-4" />
                Dr. Smith
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Stats */}
        <DashboardStats analytics={analytics} />

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

        {/* Photo Analysis Section */}
        <div className="mt-8">
          <PhotoAnalysis 
            symptoms={selectedSymptoms.map(s => s.label)}
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

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-4">Resources</h3>
              <ul className="space-y-2 text-sm professional-gray">
                <li><a href="#" className="hover:text-blue-600">Orphadata API</a></li>
                <li><a href="#" className="hover:text-blue-600">HPO Terms</a></li>
                <li><a href="#" className="hover:text-blue-600">GeneReviews</a></li>
                <li><a href="#" className="hover:text-blue-600">OMIM Database</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-4">Support</h3>
              <ul className="space-y-2 text-sm professional-gray">
                <li><a href="#" className="hover:text-blue-600">Documentation</a></li>
                <li><a href="#" className="hover:text-blue-600">Training Videos</a></li>
                <li><a href="#" className="hover:text-blue-600">Clinical Guidelines</a></li>
                <li><a href="#" className="hover:text-blue-600">Contact Support</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-4">About</h3>
              <p className="text-sm professional-gray">
                RareMD Assist is a physician support tool for rare genetic disease diagnosis using evidence-based algorithms and comprehensive medical databases.
              </p>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-slate-200 text-center text-sm professional-gray">
            <p>&copy; 2024 RareMD Assist. Built for clinical excellence with physician-centered design.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
