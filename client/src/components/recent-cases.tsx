import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { History, Eye } from "lucide-react";
import type { Case } from "@shared/schema";

export default function RecentCases() {
  const { data: cases = [], isLoading } = useQuery<Case[]>({
    queryKey: ['/api/cases'],
  });

  const getScoreBadge = (score: number | null) => {
    if (!score) return null;
    
    if (score >= 7) {
      return <Badge className="bg-red-100 text-red-800">HIGH ({score})</Badge>;
    } else if (score >= 5) {
      return <Badge className="bg-orange-100 text-orange-800">MEDIUM ({score})</Badge>;
    } else {
      return <Badge className="bg-gray-100 text-gray-800">LOW ({score})</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <Card className="bg-white shadow-sm border border-slate-200">
        <CardHeader className="border-b border-slate-200">
          <CardTitle className="flex items-center">
            <History className="medical-blue mr-2" />
            Recent Cases
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-slate-200 rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white shadow-sm border border-slate-200">
      <CardHeader className="border-b border-slate-200">
        <CardTitle className="flex items-center">
          <History className="medical-blue mr-2" />
          Recent Cases
        </CardTitle>
        <p className="text-sm professional-gray">Latest diagnostic cases with ORPHA codes</p>
      </CardHeader>
      <CardContent className="p-6">
        {cases.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-500">No cases found. Create your first case by analyzing symptoms above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left p-3 font-medium text-slate-700">Date</th>
                  <th className="text-left p-3 font-medium text-slate-700">Patient</th>
                  <th className="text-left p-3 font-medium text-slate-700">Diagnosis</th>
                  <th className="text-left p-3 font-medium text-slate-700">ORPHA Code</th>
                  <th className="text-left p-3 font-medium text-slate-700">Score</th>
                  <th className="text-left p-3 font-medium text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {cases.slice(0, 10).map((caseItem) => (
                  <tr key={caseItem.id} className="hover:bg-slate-50">
                    <td className="p-3 professional-gray">
                      {formatDate(caseItem.createdAt)}
                    </td>
                    <td className="p-3">{caseItem.patientId}</td>
                    <td className="p-3 font-medium">
                      {caseItem.diagnosis || 'Pending diagnosis'}
                    </td>
                    <td className="p-3 medical-blue">
                      {caseItem.orphaCode || 'N/A'}
                    </td>
                    <td className="p-3">
                      {getScoreBadge(caseItem.score)}
                    </td>
                    <td className="p-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 medical-blue hover:bg-blue-50"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
