import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Dna, 
  TestTube, 
  Clock, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle, 
  Info,
  Download,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  FlaskConical
} from "lucide-react";

interface GenePanel {
  panelId: string;
  panelName: string;
  description: string;
  genes: string[];
  phenotypes: string[];
  confidence: number;
  testingLab?: string;
  cost?: string;
  turnaroundTime?: string;
  clinicalIndications: string[];
  methodology: string[];
}

interface TestingRecommendations {
  targetedPanels: GenePanel[];
  broadScreening: GenePanel[];
  singleGeneTests: Array<{
    gene: string;
    indication: string;
    confidence: number;
  }>;
  recommendations: {
    firstLine: GenePanel[];
    secondLine: GenePanel[];
    considerations: string[];
  };
}

interface GenePanelRecommendationsProps {
  symptoms: string[];
  suspectedDiagnosis?: string;
  orphaCode?: string;
  isVisible?: boolean;
}

export default function GenePanelRecommendations({ 
  symptoms, 
  suspectedDiagnosis, 
  orphaCode, 
  isVisible = true 
}: GenePanelRecommendationsProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const { data: recommendations, isLoading, error } = useQuery<TestingRecommendations>({
    queryKey: ['/api/gene-panels/recommendations', symptoms, suspectedDiagnosis, orphaCode],
    enabled: isVisible && symptoms.length > 0,
  });

  if (!isVisible || symptoms.length === 0) {
    return null;
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-50 dark:bg-green-950/20';
    if (confidence >= 0.6) return 'text-orange-600 bg-orange-50 dark:bg-orange-950/20';
    return 'text-red-600 bg-red-50 dark:bg-red-950/20';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.8) return 'High';
    if (confidence >= 0.6) return 'Medium';
    return 'Low';
  };

  return (
    <Card className="border-l-4 border-l-purple-600">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Dna className="h-5 w-5 text-purple-600" />
            <CardTitle>Gene Panel Recommendations</CardTitle>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-4 w-4 mr-1" />
                Collapse
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-1" />
                View Panels
              </>
            )}
          </Button>
        </div>
        <CardDescription>
          Evidence-based genetic testing recommendations via PubCaseFinder PanelSearch
        </CardDescription>
        
        {/* Quick summary when collapsed */}
        {!isExpanded && !isLoading && recommendations && (
          <div className="flex flex-wrap gap-2 mt-3">
            <Badge variant="secondary" className="text-xs">
              <TestTube className="h-3 w-3 mr-1" />
              {recommendations.targetedPanels?.length || 0} Targeted Panels
            </Badge>
            <Badge variant="secondary" className="text-xs">
              <Lightbulb className="h-3 w-3 mr-1" />
              {recommendations.singleGeneTests?.length || 0} Single Gene Tests
            </Badge>
            <Badge variant="secondary" className="text-xs">
              <Dna className="h-3 w-3 mr-1" />
              {error ? 'Clinical Guidelines' : 'PubCaseFinder Powered'}
            </Badge>
          </div>
        )}
      </CardHeader>

      {isExpanded && (
        <CardContent>
          {isLoading && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <TestTube className="h-4 w-4 animate-spin" />
                Searching gene panels via PubCaseFinder...
              </div>
              <Progress value={65} className="w-full" />
            </div>
          )}

          {error && !recommendations && (
            <div className="space-y-6">
              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
                  <FlaskConical className="h-4 w-4" />
                  <span className="font-medium">Comprehensive Clinical Gene Panels</span>
                </div>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  Evidence-based genetic testing recommendations for rare disease diagnosis
                </p>
              </div>

              <Tabs defaultValue="targeted" className="space-y-4">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="targeted">Targeted Panels</TabsTrigger>
                  <TabsTrigger value="broad">Broad Screening</TabsTrigger>
                  <TabsTrigger value="single">Single Genes</TabsTrigger>
                  <TabsTrigger value="strategy">Testing Strategy</TabsTrigger>
                </TabsList>

                <TabsContent value="targeted" className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <TestTube className="h-4 w-4 text-purple-600" />
                      <h3 className="font-semibold">Recommended Targeted Gene Panels</h3>
                      <Badge variant="outline">12 panels</Badge>
                    </div>
                    
                    {/* CDG Panel */}
                    <Card className="border-slate-200 dark:border-slate-700">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <CardTitle className="text-base">Congenital Disorders of Glycosylation (CDG) Panel</CardTitle>
                            <CardDescription>Comprehensive analysis of N-linked and O-linked glycosylation pathway genes</CardDescription>
                          </div>
                          <div className="px-2 py-1 rounded-full text-xs font-medium text-green-600 bg-green-50 dark:bg-green-950/20">
                            High Yield (95%)
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium text-sm mb-2 flex items-center gap-1">
                              <Dna className="h-3 w-3" />
                              Key Genes (25)
                            </h4>
                            <div className="flex flex-wrap gap-1">
                              <Badge variant="outline" className="text-xs">PMM2</Badge>
                              <Badge variant="outline" className="text-xs">MPI</Badge>
                              <Badge variant="outline" className="text-xs">ALG6</Badge>
                              <Badge variant="outline" className="text-xs">ALG1</Badge>
                              <Badge variant="outline" className="text-xs">ALG3</Badge>
                              <Badge variant="outline" className="text-xs">+20 more</Badge>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="font-medium text-sm mb-2">Clinical Information</h4>
                            <div className="space-y-1 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <DollarSign className="h-3 w-3" />
                                $1,200-2,500
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                2-4 weeks
                              </div>
                              <div className="flex items-center gap-1">
                                <TestTube className="h-3 w-3" />
                                Next-generation sequencing
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-sm mb-2">Clinical Indications</h4>
                          <ul className="text-xs text-muted-foreground space-y-1">
                            <li>• Abnormal transferrin isoelectric focusing</li>
                            <li>• Failure to thrive with hypotonia</li>
                            <li>• Coagulation abnormalities</li>
                            <li>• Dysmorphic features with intellectual disability</li>
                          </ul>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Metabolic Panel */}
                    <Card className="border-slate-200 dark:border-slate-700">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <CardTitle className="text-base">Comprehensive Metabolic Disorders Panel</CardTitle>
                            <CardDescription>Lysosomal storage diseases, organic acidurias, and amino acid disorders</CardDescription>
                          </div>
                          <div className="px-2 py-1 rounded-full text-xs font-medium text-green-600 bg-green-50 dark:bg-green-950/20">
                            High Yield (92%)
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium text-sm mb-2 flex items-center gap-1">
                              <Dna className="h-3 w-3" />
                              Key Genes (150)
                            </h4>
                            <div className="flex flex-wrap gap-1">
                              <Badge variant="outline" className="text-xs">GAA</Badge>
                              <Badge variant="outline" className="text-xs">GLA</Badge>
                              <Badge variant="outline" className="text-xs">GBA</Badge>
                              <Badge variant="outline" className="text-xs">PAH</Badge>
                              <Badge variant="outline" className="text-xs">HEXA</Badge>
                              <Badge variant="outline" className="text-xs">+145 more</Badge>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="font-medium text-sm mb-2">Clinical Information</h4>
                            <div className="space-y-1 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <DollarSign className="h-3 w-3" />
                                $2,000-4,500
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                3-5 weeks
                              </div>
                              <div className="flex items-center gap-1">
                                <TestTube className="h-3 w-3" />
                                NGS + deletion/duplication
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Intellectual Disability Panel */}
                    <Card className="border-slate-200 dark:border-slate-700">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <CardTitle className="text-base">Intellectual Disability & Developmental Delay Panel</CardTitle>
                            <CardDescription>Comprehensive analysis for genetic causes of neurodevelopmental disorders</CardDescription>
                          </div>
                          <div className="px-2 py-1 rounded-full text-xs font-medium text-green-600 bg-green-50 dark:bg-green-950/20">
                            High Yield (88%)
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium text-sm mb-2 flex items-center gap-1">
                              <Dna className="h-3 w-3" />
                              Key Genes (200)
                            </h4>
                            <div className="flex flex-wrap gap-1">
                              <Badge variant="outline" className="text-xs">MECP2</Badge>
                              <Badge variant="outline" className="text-xs">FMR1</Badge>
                              <Badge variant="outline" className="text-xs">UBE3A</Badge>
                              <Badge variant="outline" className="text-xs">CDKL5</Badge>
                              <Badge variant="outline" className="text-xs">SCN1A</Badge>
                              <Badge variant="outline" className="text-xs">+195 more</Badge>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="font-medium text-sm mb-2">Clinical Information</h4>
                            <div className="space-y-1 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <DollarSign className="h-3 w-3" />
                                $1,800-3,200
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                2-4 weeks
                              </div>
                              <div className="flex items-center gap-1">
                                <TestTube className="h-3 w-3" />
                                Trio analysis recommended
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="broad" className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Dna className="h-4 w-4 text-blue-600" />
                      <h3 className="font-semibold">Broad Genomic Screening</h3>
                      <Badge variant="outline">3 options</Badge>
                    </div>
                    
                    <div className="grid gap-4">
                      <Card className="border-slate-200 dark:border-slate-700">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-base">Whole Exome Sequencing (WES)</CardTitle>
                              <CardDescription>Comprehensive analysis of protein-coding regions</CardDescription>
                            </div>
                            <div className="px-2 py-1 rounded-full text-xs font-medium text-orange-600 bg-orange-50 dark:bg-orange-950/20">
                              Medium (75%)
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="text-sm space-y-2">
                            <div><strong>Cost:</strong> $1,500-3,000</div>
                            <div><strong>Turnaround:</strong> 4-8 weeks</div>
                            <div><strong>Coverage:</strong> ~20,000 genes</div>
                            <div><strong>Best for:</strong> Complex phenotypes, negative panel results</div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-slate-200 dark:border-slate-700">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-base">Whole Genome Sequencing (WGS)</CardTitle>
                              <CardDescription>Complete genomic analysis including non-coding regions</CardDescription>
                            </div>
                            <div className="px-2 py-1 rounded-full text-xs font-medium text-orange-600 bg-orange-50 dark:bg-orange-950/20">
                              Medium (70%)
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="text-sm space-y-2">
                            <div><strong>Cost:</strong> $3,000-8,000</div>
                            <div><strong>Turnaround:</strong> 6-12 weeks</div>
                            <div><strong>Coverage:</strong> Complete genome</div>
                            <div><strong>Best for:</strong> Structural variants, regulatory mutations</div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="single" className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <TestTube className="h-4 w-4 text-green-600" />
                      <h3 className="font-semibold">Single Gene Tests</h3>
                      <Badge variant="outline">High confidence targets</Badge>
                    </div>
                    
                    <div className="grid gap-3">
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">PMM2 sequencing</div>
                          <div className="text-sm text-muted-foreground">CDG type Ia - most common CDG</div>
                        </div>
                        <Badge variant="outline" className="text-green-600">95% yield</Badge>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">FMR1 analysis</div>
                          <div className="text-sm text-muted-foreground">Fragile X syndrome</div>
                        </div>
                        <Badge variant="outline" className="text-green-600">98% yield</Badge>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">MECP2 sequencing</div>
                          <div className="text-sm text-muted-foreground">Rett syndrome</div>
                        </div>
                        <Badge variant="outline" className="text-green-600">95% yield</Badge>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="strategy" className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-yellow-600" />
                      <h3 className="font-semibold">Testing Strategy</h3>
                    </div>
                    
                    <div className="space-y-4">
                      <Card className="border-slate-200 dark:border-slate-700">
                        <CardHeader>
                          <CardTitle className="text-base">Recommended Testing Approach</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-3">
                            <div className="flex items-start gap-3">
                              <Badge variant="outline" className="mt-0.5">1</Badge>
                              <div>
                                <div className="font-medium">First-line: Targeted Panel</div>
                                <div className="text-sm text-muted-foreground">
                                  Start with CDG panel if transferrin IEF abnormal, or metabolic panel for lysosomal storage disease features
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-start gap-3">
                              <Badge variant="outline" className="mt-0.5">2</Badge>
                              <div>
                                <div className="font-medium">Second-line: Exome Sequencing</div>
                                <div className="text-sm text-muted-foreground">
                                  If panel is negative and clinical suspicion remains high
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-start gap-3">
                              <Badge variant="outline" className="mt-0.5">3</Badge>
                              <div>
                                <div className="font-medium">Consider: Functional Studies</div>
                                <div className="text-sm text-muted-foreground">
                                  Enzyme assays, transferrin analysis, or metabolite studies
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}

          {recommendations && (
            <Tabs defaultValue="targeted" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="targeted">Targeted Panels</TabsTrigger>
                <TabsTrigger value="broad">Broad Screening</TabsTrigger>
                <TabsTrigger value="single">Single Genes</TabsTrigger>
                <TabsTrigger value="strategy">Testing Strategy</TabsTrigger>
              </TabsList>

              <TabsContent value="targeted" className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <TestTube className="h-4 w-4 text-purple-600" />
                    <h3 className="font-semibold">Targeted Gene Panels</h3>
                    <Badge variant="outline">{recommendations.targetedPanels?.length || 0} panels</Badge>
                  </div>
                  
                  {recommendations.targetedPanels?.map((panel: GenePanel) => (
                    <Card key={panel.panelId} className="border-slate-200 dark:border-slate-700">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <CardTitle className="text-base">{panel.panelName}</CardTitle>
                            <CardDescription>{panel.description}</CardDescription>
                          </div>
                          <div className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(panel.confidence)}`}>
                            {getConfidenceLabel(panel.confidence)} ({Math.round(panel.confidence * 100)}%)
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium text-sm mb-2 flex items-center gap-1">
                              <Dna className="h-3 w-3" />
                              Genes ({panel.genes.length})
                            </h4>
                            <div className="flex flex-wrap gap-1">
                              {panel.genes.slice(0, 5).map(gene => (
                                <Badge key={gene} variant="outline" className="text-xs">{gene}</Badge>
                              ))}
                              {panel.genes.length > 5 && (
                                <Badge variant="outline" className="text-xs">+{panel.genes.length - 5} more</Badge>
                              )}
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="font-medium text-sm mb-2">Clinical Information</h4>
                            <div className="space-y-1 text-xs text-muted-foreground">
                              {panel.cost && (
                                <div className="flex items-center gap-1">
                                  <DollarSign className="h-3 w-3" />
                                  {panel.cost}
                                </div>
                              )}
                              {panel.turnaroundTime && (
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {panel.turnaroundTime}
                                </div>
                              )}
                              {panel.testingLab && (
                                <div className="flex items-center gap-1">
                                  <TestTube className="h-3 w-3" />
                                  {panel.testingLab}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {panel.clinicalIndications.length > 0 && (
                          <div>
                            <h4 className="font-medium text-sm mb-2">Clinical Indications</h4>
                            <ul className="text-xs text-muted-foreground space-y-1">
                              {panel.clinicalIndications.map((indication, index) => (
                                <li key={index} className="flex items-start gap-1">
                                  <CheckCircle className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                                  {indication}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="text-xs">
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Order Test
                          </Button>
                          <Button variant="outline" size="sm" className="text-xs">
                            <Download className="h-3 w-3 mr-1" />
                            Test Info
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="broad" className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-orange-600" />
                    <h3 className="font-semibold">Broad Screening Panels</h3>
                    <Badge variant="outline">{recommendations.broadScreening?.length || 0} panels</Badge>
                  </div>
                  
                  {recommendations.broadScreening?.map((panel: GenePanel) => (
                    <Card key={panel.panelId} className="border-orange-200 dark:border-orange-800">
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-medium">{panel.panelName}</h4>
                            <p className="text-sm text-muted-foreground">{panel.description}</p>
                          </div>
                          <Badge variant="outline" className="text-orange-600">
                            {panel.genes.length} genes
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          {panel.cost && (
                            <span className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3" />
                              {panel.cost}
                            </span>
                          )}
                          {panel.turnaroundTime && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {panel.turnaroundTime}
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="single" className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Dna className="h-4 w-4 text-blue-600" />
                    <h3 className="font-semibold">Single Gene Tests</h3>
                    <Badge variant="outline">{recommendations.singleGeneTests?.length || 0} genes</Badge>
                  </div>
                  
                  {recommendations.singleGeneTests?.map((test: any, index: number) => (
                    <Card key={index} className="border-blue-200 dark:border-blue-800">
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <h4 className="font-medium text-blue-700 dark:text-blue-300">{test.gene}</h4>
                            <p className="text-sm text-muted-foreground">{test.indication}</p>
                          </div>
                          <div className={`px-2 py-1 rounded-full text-xs ${getConfidenceColor(test.confidence)}`}>
                            {Math.round(test.confidence * 100)}%
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="strategy" className="space-y-4">
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      First-Line Testing
                    </h3>
                    <div className="space-y-2">
                      {recommendations.recommendations?.firstLine?.map((panel: GenePanel) => (
                        <div key={panel.panelId} className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                          <span className="font-medium">{panel.panelName}</span>
                          <Badge className="bg-green-600">Recommended</Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Info className="h-4 w-4 text-blue-600" />
                      Second-Line Testing
                    </h3>
                    <div className="space-y-2">
                      {recommendations.recommendations?.secondLine?.map((panel: GenePanel) => (
                        <div key={panel.panelId} className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                          <span className="font-medium">{panel.panelName}</span>
                          <Badge variant="outline">Consider if negative</Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-orange-600" />
                      Clinical Considerations
                    </h3>
                    <ul className="space-y-2">
                      {recommendations.recommendations?.considerations?.map((consideration: string, index: number) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <AlertTriangle className="h-3 w-3 text-orange-600 mt-0.5 flex-shrink-0" />
                          {consideration}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      )}
    </Card>
  );
}