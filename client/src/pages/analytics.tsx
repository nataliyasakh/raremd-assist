import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Brain,
  Database
} from "lucide-react";

interface Analytics {
  id: number;
  totalCases: number;
  alertsGenerated: number;
  diagnosticAccuracy: number;
  averageResponseTime: number;
  activeSessions: number;
  systemUptime: number;
  ehrConnections: number;
  cdssQueries: number;
}

const mockCaseData = [
  { month: 'Jan', cases: 12, accuracy: 89 },
  { month: 'Feb', cases: 19, accuracy: 92 },
  { month: 'Mar', cases: 15, accuracy: 87 },
  { month: 'Apr', cases: 23, accuracy: 94 },
  { month: 'May', cases: 18, accuracy: 91 },
  { month: 'Jun', cases: 26, accuracy: 96 }
];

const mockDiseaseData = [
  { name: 'Marfan Syndrome', cases: 8, color: '#3b82f6' },
  { name: 'Ehlers-Danlos', cases: 6, color: '#10b981' },
  { name: 'Osteogenesis Imperfecta', cases: 4, color: '#f59e0b' },
  { name: 'Prader-Willi', cases: 3, color: '#ef4444' },
  { name: 'Other Rare Diseases', cases: 7, color: '#8b5cf6' }
];

const mockPerformanceData = [
  { time: '00:00', response: 234, accuracy: 94 },
  { time: '04:00', response: 189, accuracy: 96 },
  { time: '08:00', response: 276, accuracy: 92 },
  { time: '12:00', response: 298, accuracy: 89 },
  { time: '16:00', response: 245, accuracy: 93 },
  { time: '20:00', response: 201, accuracy: 95 }
];

export default function Analytics() {
  const { data: analytics, isLoading } = useQuery<Analytics>({
    queryKey: ['/api/analytics'],
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: "Total Cases",
      value: analytics?.totalCases || 28,
      change: "+12%",
      trend: "up",
      icon: Users,
      color: "text-blue-600"
    },
    {
      title: "Diagnostic Accuracy",
      value: `${analytics?.diagnosticAccuracy || 93}%`,
      change: "+2%",
      trend: "up",
      icon: CheckCircle,
      color: "text-green-600"
    },
    {
      title: "Avg Response Time",
      value: `${analytics?.averageResponseTime || 247}ms`,
      change: "-15ms",
      trend: "down",
      icon: Clock,
      color: "text-orange-600"
    },
    {
      title: "Active Sessions",
      value: analytics?.activeSessions || 7,
      change: "+3",
      trend: "up",
      icon: Activity,
      color: "text-purple-600"
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
        <p className="text-gray-600">Monitor system performance and diagnostic insights</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className={`text-xs flex items-center ${
                stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                <TrendingUp className="h-3 w-3 mr-1" />
                {stat.change} from last month
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Cases and Accuracy Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Cases & Accuracy Trends</CardTitle>
            <CardDescription>Monthly case volume and diagnostic accuracy</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mockCaseData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="cases" fill="#3b82f6" name="Cases" />
                <Bar dataKey="accuracy" fill="#10b981" name="Accuracy %" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Disease Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Disease Distribution</CardTitle>
            <CardDescription>Most frequently diagnosed rare diseases</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={mockDiseaseData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="cases"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {mockDiseaseData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* System Performance */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>System Performance</CardTitle>
          <CardDescription>Real-time response times and accuracy metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={mockPerformanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="response" stroke="#3b82f6" name="Response Time (ms)" />
              <Line type="monotone" dataKey="accuracy" stroke="#10b981" name="Accuracy %" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* System Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <Activity className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Uptime</span>
                <Badge variant="secondary">99.9%</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Database</span>
                <Badge variant="secondary" className="text-green-600">Online</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">API Status</span>
                <Badge variant="secondary" className="text-green-600">Healthy</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CDSS Activity</CardTitle>
            <Brain className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.cdssQueries || 156}</div>
            <p className="text-xs text-muted-foreground">Queries this week</p>
            <div className="mt-4">
              <Progress value={78} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">78% treatment recommendations accepted</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">EHR Integration</CardTitle>
            <Database className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.ehrConnections || 12}</div>
            <p className="text-xs text-muted-foreground">Active connections</p>
            <div className="mt-4 space-y-1">
              <div className="flex justify-between text-xs">
                <span>Epic</span>
                <span className="text-green-600">5 active</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Cerner</span>
                <span className="text-green-600">4 active</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>athenahealth</span>
                <span className="text-green-600">3 active</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}