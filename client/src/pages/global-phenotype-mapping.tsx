import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Globe, 
  MapPin, 
  TrendingUp, 
  Search, 
  Users, 
  BarChart3, 
  Filter,
  Eye,
  Database,
  Target,
  Activity
} from "lucide-react";
import type { PhenotypeMapping } from "@shared/schema";

// Mock world map component - in a real app, use a proper mapping library
const WorldMap = ({ data }: { data: PhenotypeMapping[] }) => {
  const getCountryFrequency = (country: string) => {
    return data.filter(d => d.country === country).reduce((sum, d) => sum + (d.frequency || 0), 0);
  };

  const countries = Array.from(new Set(data.map(d => d.country)));
  const maxFrequency = Math.max(...countries.map(getCountryFrequency));

  return (
    <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-6 h-96 flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900" />
      
      {/* Simulated world map visualization */}
      <div className="relative z-10 text-center">
        <Globe className="h-16 w-16 text-blue-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
          Global Phenotype Distribution
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
          Interactive world map showing phenotype frequencies by region
        </p>
        
        {/* Sample data points */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          {countries.slice(0, 6).map((country, idx) => {
            const frequency = getCountryFrequency(country);
            const intensity = frequency / maxFrequency;
            return (
              <div key={country} className="text-center">
                <div 
                  className="w-8 h-8 rounded-full mx-auto mb-1"
                  style={{ 
                    backgroundColor: `rgba(59, 130, 246, ${Math.max(0.2, intensity)})` 
                  }}
                />
                <span className="text-xs text-slate-600 dark:text-slate-400">{country}</span>
                <div className="text-xs font-medium text-slate-900 dark:text-slate-100">{frequency}</div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-white dark:bg-slate-800 rounded p-2 shadow-lg">
        <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Frequency</div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-blue-200" />
          <span className="text-xs">Low</span>
          <div className="w-3 h-3 rounded bg-blue-400" />
          <span className="text-xs">Medium</span>
          <div className="w-3 h-3 rounded bg-blue-600" />
          <span className="text-xs">High</span>
        </div>
      </div>
    </div>
  );
};

const PhenotypeChart = ({ data }: { data: PhenotypeMapping[] }) => {
  const topPhenotypes = data
    .reduce((acc, curr) => {
      const existing = acc.find(p => p.hpoId === curr.hpoId);
      if (existing) {
        existing.totalFrequency += curr.frequency || 0;
        existing.countries.add(curr.country);
      } else {
        acc.push({
          hpoId: curr.hpoId,
          hpoLabel: curr.hpoLabel,
          totalFrequency: curr.frequency || 0,
          countries: new Set([curr.country])
        });
      }
      return acc;
    }, [] as Array<{ hpoId: string; hpoLabel: string; totalFrequency: number; countries: Set<string> }>)
    .sort((a, b) => b.totalFrequency - a.totalFrequency)
    .slice(0, 10);

  const maxFrequency = Math.max(...topPhenotypes.map(p => p.totalFrequency));

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
        Top Global Phenotypes
      </h3>
      <div className="space-y-3">
        {topPhenotypes.map((phenotype, idx) => (
          <div key={phenotype.hpoId} className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium text-slate-900 dark:text-slate-100">
                  {phenotype.hpoLabel}
                </span>
                <Badge variant="outline" className="ml-2 text-xs">
                  {phenotype.hpoId}
                </Badge>
              </div>
              <div className="text-right">
                <div className="font-bold text-slate-900 dark:text-slate-100">
                  {phenotype.totalFrequency}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {phenotype.countries.size} countries
                </div>
              </div>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(phenotype.totalFrequency / maxFrequency) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function GlobalPhenotypeMapping() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<string>("all");
  const [selectedView, setSelectedView] = useState<"map" | "chart" | "table">("map");

  // Fetch phenotype mapping data
  const { data: mappingData = [], isLoading } = useQuery<PhenotypeMapping[]>({
    queryKey: ['/api/community/phenotype-mapping', searchTerm, selectedCountry],
  });

  // Fetch mapping statistics
  const { data: stats } = useQuery({
    queryKey: ['/api/community/phenotype-stats'],
  });

  // Get unique countries for filter
  const countries = Array.from(new Set(mappingData.map(m => m.country).filter(Boolean)));

  const filteredData = mappingData.filter(mapping => {
    const matchesSearch = mapping.hpoLabel.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         mapping.hpoId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCountry = selectedCountry === "all" || mapping.country === selectedCountry;
    
    return matchesSearch && matchesCountry;
  });

  // Group data by country for statistics
  const countryStats = countries.map(country => {
    const countryData = mappingData.filter(m => m.country === country);
    const totalFrequency = countryData.reduce((sum, m) => sum + (m.frequency || 0), 0);
    const uniquePhenotypes = new Set(countryData.map(m => m.hpoId)).size;
    
    return {
      country,
      totalFrequency,
      uniquePhenotypes,
      lastUpdated: countryData.reduce((latest, m) => {
        const date = new Date(m.lastUpdated || 0);
        return date > latest ? date : latest;
      }, new Date(0))
    };
  }).sort((a, b) => b.totalFrequency - a.totalFrequency);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-3">
          <Globe className="h-8 w-8 text-green-600" />
          Global Phenotype Mapping
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          Track geographic distribution patterns of rare disease phenotypes worldwide - iGEM 2025 Community Impact
        </p>
      </div>

      {/* Overview Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Target className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Phenotypes</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {new Set(mappingData.map(m => m.hpoId)).size}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <MapPin className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Countries</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{countries.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Activity className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Reports</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {mappingData.reduce((sum, m) => sum + (m.frequency || 0), 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Avg. Prevalence</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {mappingData.length > 0 
                      ? (mappingData.reduce((sum, m) => sum + parseFloat(m.prevalence || "0"), 0) / mappingData.length).toFixed(2)
                      : "0"
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  placeholder="Search phenotypes by HPO ID or label..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-phenotypes"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Countries" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Countries</SelectItem>
                  {countries.map(country => (
                    <SelectItem key={country} value={country}>{country}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedView} onValueChange={(value: "map" | "chart" | "table") => setSelectedView(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="map">Map View</SelectItem>
                  <SelectItem value="chart">Chart View</SelectItem>
                  <SelectItem value="table">Table View</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Primary Visualization */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {selectedView === "map" && <Eye className="h-5 w-5" />}
                {selectedView === "chart" && <BarChart3 className="h-5 w-5" />}
                {selectedView === "table" && <Database className="h-5 w-5" />}
                
                {selectedView === "map" && "Global Distribution Map"}
                {selectedView === "chart" && "Phenotype Frequency Analysis"}
                {selectedView === "table" && "Detailed Phenotype Data"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedView === "map" && <WorldMap data={filteredData} />}
              
              {selectedView === "chart" && <PhenotypeChart data={filteredData} />}
              
              {selectedView === "table" && (
                <div className="space-y-4">
                  <div className="max-h-96 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50 dark:bg-slate-800 sticky top-0">
                        <tr>
                          <th className="text-left p-3 font-medium text-slate-900 dark:text-slate-100">HPO ID</th>
                          <th className="text-left p-3 font-medium text-slate-900 dark:text-slate-100">Phenotype</th>
                          <th className="text-left p-3 font-medium text-slate-900 dark:text-slate-100">Country</th>
                          <th className="text-right p-3 font-medium text-slate-900 dark:text-slate-100">Frequency</th>
                          <th className="text-right p-3 font-medium text-slate-900 dark:text-slate-100">Prevalence</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredData.slice(0, 100).map((mapping, idx) => (
                          <tr key={`${mapping.hpoId}-${mapping.country}-${idx}`} className="border-t border-slate-200 dark:border-slate-700">
                            <td className="p-3">
                              <Badge variant="outline" className="text-xs">
                                {mapping.hpoId}
                              </Badge>
                            </td>
                            <td className="p-3 text-slate-900 dark:text-slate-100">{mapping.hpoLabel}</td>
                            <td className="p-3 text-slate-600 dark:text-slate-400">{mapping.country}</td>
                            <td className="p-3 text-right font-medium text-slate-900 dark:text-slate-100">
                              {mapping.frequency}
                            </td>
                            <td className="p-3 text-right text-slate-600 dark:text-slate-400">
                              {mapping.prevalence ? parseFloat(mapping.prevalence).toFixed(2) : "N/A"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {filteredData.length > 100 && (
                    <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
                      Showing first 100 results of {filteredData.length} total
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Country Statistics Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Country Rankings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {countryStats.slice(0, 10).map((stat, idx) => (
                  <div key={stat.country} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-slate-900 dark:text-slate-100">
                        #{idx + 1} {stat.country}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {stat.uniquePhenotypes} unique phenotypes
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-slate-900 dark:text-slate-100">
                        {stat.totalFrequency}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        reports
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Quick Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm">
                <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded">
                  <div className="font-medium text-blue-900 dark:text-blue-100">Most Common Phenotype</div>
                  <div className="text-blue-700 dark:text-blue-300">
                    {mappingData.length > 0 
                      ? mappingData.reduce((prev, curr) => (curr.frequency || 0) > (prev.frequency || 0) ? curr : prev).hpoLabel
                      : "No data"
                    }
                  </div>
                </div>
                
                <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded">
                  <div className="font-medium text-green-900 dark:text-green-100">Top Contributing Country</div>
                  <div className="text-green-700 dark:text-green-300">
                    {countryStats.length > 0 ? countryStats[0].country : "No data"}
                  </div>
                </div>
                
                <div className="bg-purple-50 dark:bg-purple-950/20 p-3 rounded">
                  <div className="font-medium text-purple-900 dark:text-purple-100">Data Coverage</div>
                  <div className="text-purple-700 dark:text-purple-300">
                    {countries.length} countries contributing
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}