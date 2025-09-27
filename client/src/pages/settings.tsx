import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useSettings } from "@/hooks/useSettings";
import { useTranslation } from "@/lib/translations";
import { 
  Settings as SettingsIcon, 
  User, 
  Shield, 
  Database, 
  Bell, 
  Palette,
  Brain,
  Activity,
  Save,
  RefreshCw
} from "lucide-react";

export default function Settings() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const { settings, updateSettings, updateNestedSettings, resetSettings } = useSettings();
  const { t } = useTranslation(settings.language);

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: t('settingsSaved'),
        description: t('settingsSavedDesc'),
      });
    } catch (error) {
      toast({
        title: t('error'),
        description: t('errorSavingDesc'),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetSettings = () => {
    resetSettings();
    toast({
      title: t('settingsReset'),
      description: t('settingsResetDesc'),
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">{t('settingsTitle')}</h1>
        <p className="text-gray-600 dark:text-gray-400">{t('settingsDesc')}</p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">{t('general')}</TabsTrigger>
          <TabsTrigger value="cdss">{t('cdss')}</TabsTrigger>
          <TabsTrigger value="notifications">{t('notifications')}</TabsTrigger>
          <TabsTrigger value="security">{t('security')}</TabsTrigger>
          <TabsTrigger value="integrations">{t('integrations')}</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                {t('general')}
              </CardTitle>
              <CardDescription>
                Configure your basic application preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="theme">{t('theme')}</Label>
                  <Select value={settings.theme} onValueChange={(value: 'light' | 'dark' | 'system') => 
                    updateSettings({ theme: value })
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">{t('light')}</SelectItem>
                      <SelectItem value="dark">{t('dark')}</SelectItem>
                      <SelectItem value="system">{t('system')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language">{t('language')}</Label>
                  <Select value={settings.language} onValueChange={(value) => 
                    updateSettings({ language: value })
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">{t('english')}</SelectItem>
                      <SelectItem value="es">{t('spanish')}</SelectItem>
                      <SelectItem value="fr">{t('french')}</SelectItem>
                      <SelectItem value="de">{t('german')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timezone">{t('timezone')}</Label>
                  <Select value={settings.timezone} onValueChange={(value) => 
                    updateSettings({ timezone: value })
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC-8">Pacific Time (UTC-8)</SelectItem>
                      <SelectItem value="UTC-5">Eastern Time (UTC-5)</SelectItem>
                      <SelectItem value="UTC+0">GMT (UTC+0)</SelectItem>
                      <SelectItem value="UTC+1">Central European (UTC+1)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{t('autoSave')}</Label>
                    <p className="text-sm text-muted-foreground">{t('autoSaveDesc')}</p>
                  </div>
                  <Switch
                    checked={settings.autoSave}
                    onCheckedChange={(checked) => 
                      updateSettings({ autoSave: checked })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* CDSS Settings */}
        <TabsContent value="cdss">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                {t('cdssTitle')}
              </CardTitle>
              <CardDescription>
                {t('cdssDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{t('autoRecommendations')}</Label>
                    <p className="text-sm text-muted-foreground">{t('autoRecommendationsDesc')}</p>
                  </div>
                  <Switch
                    checked={settings.cdss.autoRecommendations}
                    onCheckedChange={(checked) => 
                      updateNestedSettings('cdss', { autoRecommendations: checked })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confidence">{t('confidenceThreshold')}</Label>
                  <Input
                    id="confidence"
                    type="number"
                    min="50"
                    max="100"
                    value={settings.cdss.confidenceThreshold}
                    onChange={(e) => 
                      updateNestedSettings('cdss', { confidenceThreshold: parseInt(e.target.value) })
                    }
                  />
                  <p className="text-sm text-muted-foreground">
                    {t('confidenceThresholdDesc')}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{t('drugInteractionAlerts')}</Label>
                    <p className="text-sm text-muted-foreground">{t('drugInteractionAlertsDesc')}</p>
                  </div>
                  <Switch
                    checked={settings.cdss.interactionAlerts}
                    onCheckedChange={(checked) => 
                      updateNestedSettings('cdss', { interactionAlerts: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{t('clinicalPathwayGuidance')}</Label>
                    <p className="text-sm text-muted-foreground">{t('clinicalPathwayGuidanceDesc')}</p>
                  </div>
                  <Switch
                    checked={settings.cdss.pathwayGuidance}
                    onCheckedChange={(checked) => 
                      updateNestedSettings('cdss', { pathwayGuidance: checked })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>
                Choose which notifications you want to receive
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>System Alerts</Label>
                    <p className="text-sm text-muted-foreground">Critical system notifications</p>
                  </div>
                  <Switch
                    checked={settings.notifications.alerts}
                    onCheckedChange={(checked) => 
                      updateNestedSettings('notifications', { alerts: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Software Updates</Label>
                    <p className="text-sm text-muted-foreground">New features and updates</p>
                  </div>
                  <Switch
                    checked={settings.notifications.updates}
                    onCheckedChange={(checked) => 
                      updateNestedSettings('notifications', { updates: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Weekly Reports</Label>
                    <p className="text-sm text-muted-foreground">Analytics and usage summaries</p>
                  </div>
                  <Switch
                    checked={settings.notifications.weeklyReports}
                    onCheckedChange={(checked) => 
                      updateNestedSettings('notifications', { weeklyReports: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Emergency Alerts</Label>
                    <p className="text-sm text-muted-foreground">Critical patient safety alerts</p>
                  </div>
                  <Switch
                    checked={settings.notifications.emergencyAlerts}
                    onCheckedChange={(checked) => 
                      updateNestedSettings('notifications', { emergencyAlerts: checked })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security & Privacy
              </CardTitle>
              <CardDescription>
                Manage your security settings and data privacy
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input id="current-password" type="password" placeholder="Enter current password" />
                </div>

                <div>
                  <Label htmlFor="new-password">New Password</Label>
                  <Input id="new-password" type="password" placeholder="Enter new password" />
                </div>

                <div>
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input id="confirm-password" type="password" placeholder="Confirm new password" />
                </div>

                <Button className="w-full">Update Password</Button>

                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">Data Privacy</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Data retention period</span>
                      <Badge variant="secondary">5 years</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">HIPAA compliance</span>
                      <Badge variant="secondary" className="text-green-600">Active</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Data encryption</span>
                      <Badge variant="secondary" className="text-green-600">AES-256</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations */}
        <TabsContent value="integrations">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                EHR Integrations
              </CardTitle>
              <CardDescription>
                Manage your Electronic Health Record system connections
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Epic MyChart</h4>
                    <p className="text-sm text-muted-foreground">FHIR R4 compatible</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-green-600">Connected</Badge>
                    <Button variant="outline" size="sm">Configure</Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Cerner PowerChart</h4>
                    <p className="text-sm text-muted-foreground">FHIR R4 compatible</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-green-600">Connected</Badge>
                    <Button variant="outline" size="sm">Configure</Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">athenahealth</h4>
                    <p className="text-sm text-muted-foreground">FHIR R4 compatible</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-yellow-600">Pending</Badge>
                    <Button variant="outline" size="sm">Setup</Button>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">API Configuration</h4>
                  <div className="space-y-2">
                    <div>
                      <Label htmlFor="api-endpoint">FHIR Endpoint URL</Label>
                      <Input 
                        id="api-endpoint" 
                        placeholder="https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/"
                        value="https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/"
                      />
                    </div>
                    <div>
                      <Label htmlFor="client-id">Client ID</Label>
                      <Input id="client-id" placeholder="Your EHR client ID" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={handleResetSettings}>
          <RefreshCw className="h-4 w-4 mr-2" />
          {t('resetDefaults')}
        </Button>
        <Button onClick={handleSaveSettings} disabled={loading}>
          <Save className="h-4 w-4 mr-2" />
          {loading ? t('saving') : t('saveSettings')}
        </Button>
      </div>
    </div>
  );
}