import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bolt, Plus, Download, BarChart3, Settings, Circle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function QuickActions() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const syncMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/sync-orphadata', {});
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/analytics'] });
      queryClient.invalidateQueries({ queryKey: ['/api/diseases'] });
      toast({
        title: "Knowledge Base Updated",
        description: data.message || "Successfully synced with Orphadata"
      });
    },
    onError: () => {
      toast({
        title: "Sync Failed",
        description: "Failed to update knowledge base. Please try again.",
        variant: "destructive"
      });
    }
  });

  const quickActions = [
    {
      title: "New Case Analysis",
      icon: Plus,
      bgColor: "bg-blue-600 hover:bg-blue-700",
      textColor: "text-white",
      action: () => {
        // Scroll to symptom entry
        document.querySelector('[data-testid="symptom-entry"]')?.scrollIntoView({ behavior: 'smooth' });
      }
    },
    {
      title: "Update Knowledge Base",
      icon: syncMutation.isPending ? Loader2 : Download,
      bgColor: "bg-green-600 hover:bg-green-700",
      textColor: "text-white",
      action: () => syncMutation.mutate(),
      disabled: syncMutation.isPending,
      spinning: syncMutation.isPending
    },
    {
      title: "View Analytics",
      icon: BarChart3,
      bgColor: "bg-gray-600 hover:bg-gray-700",
      textColor: "text-white",
      action: () => {
        toast({
          title: "Analytics",
          description: "Detailed analytics view would be implemented here."
        });
      }
    },
    {
      title: "Settings",
      icon: Settings,
      bgColor: "border border-slate-300 hover:bg-slate-50",
      textColor: "text-slate-700",
      action: () => {
        toast({
          title: "Settings",
          description: "Settings panel would be implemented here."
        });
      }
    }
  ];

  const systemStatus = [
    {
      name: "Orphadata API",
      status: "Active",
      statusColor: "text-green-600"
    },
    {
      name: "HPO Terms",
      status: "Updated",
      statusColor: "text-green-600"
    },
    {
      name: "Database",
      status: "Online",
      statusColor: "text-green-600"
    }
  ];

  return (
    <Card className="bg-white shadow-sm border border-slate-200">
      <CardHeader className="border-b border-slate-200">
        <CardTitle className="flex items-center">
          <Bolt className="warning-orange mr-2" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        {quickActions.map((action, index) => (
          <Button
            key={index}
            className={`w-full ${action.bgColor} ${action.textColor} justify-start font-medium`}
            onClick={action.action}
            disabled={action.disabled}
          >
            <action.icon className={`mr-2 h-4 w-4 ${action.spinning ? 'animate-spin' : ''}`} />
            {action.title}
          </Button>
        ))}

        {/* System Status */}
        <div className="pt-4 border-t border-slate-200">
          <h3 className="text-sm font-medium text-slate-900 mb-3">System Status</h3>
          <div className="space-y-2">
            {systemStatus.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm professional-gray">{item.name}</span>
                <span className={`text-sm ${item.statusColor} flex items-center`}>
                  <Circle className="h-2 w-2 mr-1 fill-current" />
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
