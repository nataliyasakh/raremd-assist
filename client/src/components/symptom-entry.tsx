import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Stethoscope, Search, X, Loader2, Eraser } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface HpoTerm {
  id: string;
  label: string;
  definition?: string;
  synonyms?: string[];
}

interface SymptomEntryProps {
  selectedSymptoms: Array<{
    hpoId: string;
    label: string;
    frequency?: string;
  }>;
  onSymptomsChange: (symptoms: Array<{
    hpoId: string;
    label: string;
    frequency?: string;
  }>) => void;
  onAnalysisComplete: (results: any[]) => void;
}

export default function SymptomEntry({ 
  selectedSymptoms, 
  onSymptomsChange, 
  onAnalysisComplete 
}: SymptomEntryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [patientAge, setPatientAge] = useState("");
  const [patientSex, setPatientSex] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: suggestions = [], isLoading: isSearching } = useQuery({
    queryKey: ['/api/hpo/search', searchQuery],
    queryFn: async () => {
      if (searchQuery.length < 2) return [];
      const response = await fetch(`/api/hpo/search?q=${encodeURIComponent(searchQuery)}`);
      return response.json();
    },
    enabled: searchQuery.length >= 2
  });

  const analyzeMutation = useMutation({
    mutationFn: async (symptoms: Array<{hpoId: string; label: string; frequency?: string}>) => {
      const response = await apiRequest('POST', '/api/analyze', { symptoms });
      return response.json();
    },
    onSuccess: (results) => {
      onAnalysisComplete(results);
      toast({
        title: "Analysis Complete",
        description: `Found ${results.length} potential matches for the symptoms.`
      });
    },
    onError: () => {
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze symptoms. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleAddSymptom = (hpoTerm: HpoTerm) => {
    if (selectedSymptoms.some(s => s.hpoId === hpoTerm.id)) {
      toast({
        title: "Symptom Already Added",
        description: "This symptom is already in your list.",
        variant: "destructive"
      });
      return;
    }

    const newSymptom = {
      hpoId: hpoTerm.id,
      label: hpoTerm.label,
      frequency: 'frequent'
    };

    onSymptomsChange([...selectedSymptoms, newSymptom]);
    setSearchQuery("");
    setShowSuggestions(false);
  };

  const handleRemoveSymptom = (hpoId: string) => {
    onSymptomsChange(selectedSymptoms.filter(s => s.hpoId !== hpoId));
  };

  const handleAnalyze = () => {
    if (selectedSymptoms.length === 0) {
      toast({
        title: "No Symptoms Selected",
        description: "Please add at least one symptom to analyze.",
        variant: "destructive"
      });
      return;
    }

    analyzeMutation.mutate(selectedSymptoms);
  };

  const handleClear = () => {
    onSymptomsChange([]);
    setPatientAge("");
    setPatientSex("");
    setSearchQuery("");
    onAnalysisComplete([]);
  };

  return (
    <Card className="bg-white shadow-sm border border-slate-200">
      <CardHeader className="border-b border-slate-200">
        <CardTitle className="flex items-center">
          <Stethoscope className="medical-blue mr-2" />
          Symptom Entry
        </CardTitle>
        <p className="text-sm professional-gray">Enter patient symptoms using HPO terms or natural language</p>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        {/* Patient Info */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="age" className="text-sm font-medium text-slate-700">Patient Age</Label>
            <Input
              id="age"
              type="number"
              placeholder="Age"
              value={patientAge}
              onChange={(e) => setPatientAge(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="sex" className="text-sm font-medium text-slate-700">Sex</Label>
            <Select value={patientSex} onValueChange={setPatientSex}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Symptom Input with HPO Autocomplete */}
        <div>
          <Label htmlFor="symptoms" className="text-sm font-medium text-slate-700">Symptoms (HPO Terms)</Label>
          <div className="relative mt-1">
            <Input
              id="symptoms"
              placeholder="Start typing symptoms..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              className="pr-10"
            />
            <div className="absolute right-3 top-2.5">
              {isSearching ? (
                <Loader2 className="h-4 w-4 animate-spin professional-gray" />
              ) : (
                <Search className="h-4 w-4 professional-gray" />
              )}
            </div>
            
            {/* HPO Autocomplete Suggestions */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 max-h-40 overflow-y-auto bg-white border border-slate-200 rounded-md shadow-lg">
                {suggestions.map((term: HpoTerm) => (
                  <div
                    key={term.id}
                    className="p-2 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-b-0"
                    onClick={() => handleAddSymptom(term)}
                  >
                    <div className="font-medium text-sm">{term.label}</div>
                    <div className="text-xs professional-gray">{term.id}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Selected Symptoms */}
        {selectedSymptoms.length > 0 && (
          <div>
            <Label className="text-sm font-medium text-slate-700">Selected Symptoms</Label>
            <div className="space-y-2 mt-2">
              {selectedSymptoms.map((symptom) => (
                <div key={symptom.hpoId} className="flex items-center justify-between bg-slate-50 p-3 rounded-md">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-sm">{symptom.label}</span>
                    <Badge variant="secondary" className="text-xs">{symptom.hpoId}</Badge>
                    {symptom.frequency && (
                      <Badge variant="outline" className="text-xs">{symptom.frequency}</Badge>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveSymptom(symptom.hpoId)}
                    className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-4">
          <Button 
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            onClick={handleAnalyze}
            disabled={analyzeMutation.isPending || selectedSymptoms.length === 0}
          >
            {analyzeMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Search className="mr-2 h-4 w-4" />
            )}
            Analyze Symptoms
          </Button>
          <Button
            variant="outline"
            onClick={handleClear}
            disabled={analyzeMutation.isPending}
          >
            <Eraser className="mr-2 h-4 w-4" />
            Clear
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
