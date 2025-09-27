import { Card, CardContent } from "@/components/ui/card";
import { 
  ClipboardList, 
  TriangleAlert, 
  CheckCircle, 
  Database 
} from "lucide-react";
import type { Analytics } from "@shared/schema";

interface DashboardStatsProps {
  analytics?: Analytics;
}

export default function DashboardStats({ analytics }: DashboardStatsProps) {
  const stats = [
    {
      title: "Total Cases",
      value: analytics?.totalCases || 0,
      icon: ClipboardList,
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600"
    },
    {
      title: "Alerts Generated",
      value: analytics?.alertsGenerated || 0,
      icon: TriangleAlert,
      bgColor: "bg-orange-50",
      iconColor: "text-orange-600"
    },
    {
      title: "Diagnosed Cases",
      value: analytics?.diagnosedCases || 0,
      icon: CheckCircle,
      bgColor: "bg-green-50",
      iconColor: "text-green-600"
    },
    {
      title: "Knowledge Base",
      value: analytics?.knowledgeBaseSize || 0,
      icon: Database,
      bgColor: "bg-emerald-50",
      iconColor: "text-emerald-600",
      subtitle: "diseases"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <Card key={index} className="bg-white shadow-sm border border-slate-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium professional-gray">{stat.title}</p>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                {stat.subtitle && (
                  <p className="text-xs professional-gray">{stat.subtitle}</p>
                )}
              </div>
              <div className={`p-3 ${stat.bgColor} rounded-full`}>
                <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
