import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Database,
  RefreshCw,
  Loader2,
  CheckCircle,
  Clock,
  AlertCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Analytics } from "@shared/schema";

export default function DatabaseManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: analytics } = useQuery<Analytics>({
    queryKey: ['/api/analytics'],
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

  const handleSync = () => {
    syncMutation.mutate();
  };

  return (
    <Card className="bg-white shadow-sm border border-slate-200">
      <CardContent className="p-4">
        {/* Sync Status Banner */}
        {syncMutation.isPending && (
          <div className="mb-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="font-medium text-sm">Syncing Orphadata Database...</span>
            </div>
          </div>
        )}

        {/* Compact Actions Bar */}
        <div className="bg-gradient-to-r from-blue-50 to-emerald-50 dark:from-blue-950/20 dark:to-emerald-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-blue-600" />
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">Database Management</h3>
                <Badge variant="secondary" className="text-xs px-2 py-0.5">
                  {analytics?.knowledgeBaseSize || 0} diseases
                </Badge>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Sync with Orphadata for latest rare disease information
              </p>
            </div>
            <Button
              onClick={handleSync}
              disabled={syncMutation.isPending}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              size="sm"
              data-testid="button-sync-orphadata"
            >
              {syncMutation.isPending ? (
                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
              ) : (
                <RefreshCw className="mr-1 h-3 w-3" />
              )}
              Sync Database
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}