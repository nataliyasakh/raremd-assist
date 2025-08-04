import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  Database, 
  Search, 
  Book, 
  ExternalLink, 
  RefreshCw,
  Plus,
  Settings,
  Loader2,
  AlertCircle,
  CheckCircle,
  Clock
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Disease, Analytics } from "@shared/schema";

interface KnowledgeBaseProps {
  analytics?: Analytics;
}

export default function KnowledgeBase({ analytics }: KnowledgeBaseProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDisease, setSelectedDisease] = useState<Disease | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: diseases = [], isLoading } = useQuery<Disease[]>({
    queryKey: ['/api/diseases'],
  });

  const syncMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/sync-orphadata', {});
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/diseases'] });
      queryClient.invalidateQueries({ queryKey: ['/api/analytics'] });
      toast({
        title: "Knowledge Base Updated",
        description: data.message || "Successfully synced with Orphadata"
      });
    },
    onError: (error) => {
      toast({
        title: "Sync Failed",
        description: "Failed to update knowledge base. Please ensure you have proper API access.",
        variant: "destructive"
      });
    }
  });

  const filteredDiseases = diseases.filter(disease => 
    disease.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    disease.orphaCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSync = () => {
    syncMutation.mutate();
  };

  const formatInheritance = (inheritance: string | null) => {
    if (!inheritance) return 'Unknown';
    return inheritance.split(',').map(i => i.trim()).join(', ');
  };

  const getPrevalenceColor = (prevalence: string | null) => {
    if (!prevalence) return 'bg-gray-100 text-gray-800';
    if (prevalence.includes('1-9 / 100,000')) return 'bg-red-100 text-red-800';
    if (prevalence.includes('1-5 / 10,000')) return 'bg-orange-100 text-orange-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Knowledge Base</h2>
          <p className="text-sm professional-gray">
            Manage rare disease information from Orphadata and other medical databases
          </p>
        </div>
        <div className="flex space-x-3">
          <Button
            onClick={handleSync}
            disabled={syncMutation.isPending}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {syncMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Sync Orphadata
          </Button>
          <Button variant="outline" className="text-slate-700">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white shadow-sm border border-slate-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium professional-gray">Total Diseases</p>
                <p className="text-2xl font-bold text-slate-900">{analytics?.knowledgeBaseSize || 0}</p>
                <p className="text-xs professional-gray">ORPHA codes</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-full">
                <Database className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm border border-slate-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium professional-gray">Last Updated</p>
                <p className="text-lg font-semibold text-slate-900">
                  {analytics?.lastUpdated ? new Date(analytics.lastUpdated).toLocaleDateString() : 'Never'}
                </p>
                <p className="text-xs professional-gray">Database sync</p>
              </div>
              <div className="p-3 bg-green-50 rounded-full">
                <Clock className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm border border-slate-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium professional-gray">Data Sources</p>
                <p className="text-lg font-semibold text-slate-900">3 Active</p>
                <p className="text-xs professional-gray">Orphadata, HPO, GeneReviews</p>
              </div>
              <div className="p-3 bg-emerald-50 rounded-full">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Browse */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Disease List */}
        <Card className="bg-white shadow-sm border border-slate-200">
          <CardHeader className="border-b border-slate-200">
            <CardTitle className="flex items-center">
              <Search className="medical-blue mr-2" />
              Browse Diseases
            </CardTitle>
            <div className="mt-4">
              <Label htmlFor="search" className="text-sm font-medium text-slate-700">
                Search diseases by name or ORPHA code
              </Label>
              <Input
                id="search"
                placeholder="Search diseases..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="mt-1"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                <p className="text-sm professional-gray">Loading diseases...</p>
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto">
                {filteredDiseases.length === 0 ? (
                  <div className="p-6 text-center">
                    <AlertCircle className="h-8 w-8 text-orange-500 mx-auto mb-4" />
                    <p className="text-sm professional-gray">
                      {searchQuery ? 'No diseases found matching your search.' : 'No diseases in knowledge base. Click "Sync Orphadata" to load data.'}
                    </p>
                  </div>
                ) : (
                  filteredDiseases.map((disease) => (
                    <div
                      key={disease.id}
                      className={`p-4 border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors ${
                        selectedDisease?.id === disease.id ? 'bg-blue-50 border-blue-200' : ''
                      }`}
                      onClick={() => setSelectedDisease(disease)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-slate-900 text-sm">{disease.name}</h3>
                        <Badge variant="outline" className="text-xs medical-blue">
                          {disease.orphaCode}
                        </Badge>
                      </div>
                      <p className="text-xs professional-gray line-clamp-2 mb-2">
                        {disease.definition || 'No definition available'}
                      </p>
                      <div className="flex items-center space-x-2">
                        {disease.prevalence && (
                          <Badge className={`text-xs ${getPrevalenceColor(disease.prevalence)}`}>
                            {disease.prevalence}
                          </Badge>
                        )}
                        <Badge variant="secondary" className="text-xs">
                          {disease.phenotypes.length} symptoms
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Disease Details */}
        <Card className="bg-white shadow-sm border border-slate-200">
          <CardHeader className="border-b border-slate-200">
            <CardTitle className="flex items-center">
              <Book className="clinical-green mr-2" />
              Disease Details
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {!selectedDisease ? (
              <div className="text-center py-8">
                <Database className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p className="text-sm professional-gray">Select a disease to view details</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">{selectedDisease.name}</h3>
                  <Badge className="medical-blue text-white mb-4">{selectedDisease.orphaCode}</Badge>
                  <p className="text-sm text-slate-700 mb-4">
                    {selectedDisease.definition || 'No definition available'}
                  </p>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-slate-700">Prevalence</Label>
                    <p className="text-sm text-slate-600 mt-1">
                      {selectedDisease.prevalence || 'Unknown'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-slate-700">Inheritance</Label>
                    <p className="text-sm text-slate-600 mt-1">
                      {formatInheritance(selectedDisease.inheritance)}
                    </p>
                  </div>
                </div>

                <Separator />

                <div>
                  <Label className="text-sm font-medium text-slate-700 mb-2 block">
                    Associated Symptoms ({selectedDisease.phenotypes.length})
                  </Label>
                  <div className="max-h-32 overflow-y-auto space-y-2">
                    {selectedDisease.phenotypes.map((phenotype, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span className="text-slate-700">{phenotype.label}</span>
                        <Badge variant="outline" className="text-xs">
                          {phenotype.frequency}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedDisease.recommendedTests && selectedDisease.recommendedTests.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <Label className="text-sm font-medium text-slate-700 mb-2 block">
                        Recommended Tests
                      </Label>
                      <div className="space-y-2">
                        {selectedDisease.recommendedTests.map((test, index) => (
                          <div key={index} className="text-sm">
                            <span className="font-medium text-slate-700">{test.test}</span>
                            <p className="text-slate-600 ml-2">{test.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                <Separator />

                <div className="flex space-x-2">
                  {selectedDisease.geneReviewsUrl && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(selectedDisease.geneReviewsUrl, '_blank')}
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      GeneReviews
                    </Button>
                  )}
                  {selectedDisease.omimId && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(`https://www.omim.org/entry/${selectedDisease.omimId}`, '_blank')}
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      OMIM
                    </Button>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}