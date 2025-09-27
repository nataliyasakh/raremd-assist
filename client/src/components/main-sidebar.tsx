import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Menu, 
  X, 
  Settings,
  Home, 
  BookOpen, 
  TestTube, 
  BarChart3, 
  User,
  Users,
  MapPin,
  Target,
  HelpCircle
} from "lucide-react";
import { useSettings } from "@/hooks/useSettings";
import { useTranslation } from "@/lib/translations";
import { useState } from "react";

export default function MainSidebar() {
  const [location] = useLocation();
  const { settings } = useSettings();
  const { t } = useTranslation(settings.language);
  const [isOpen, setIsOpen] = useState(false);

  const navigationSections = [
    {
      title: t("settings"),
      items: [
        { path: "/settings", label: t("settings"), icon: Settings },
      ]
    },
    {
      title: t("mainPages"),
      items: [
        { path: "/", label: t("dashboard"), icon: Home },
        { path: "/knowledge-base", label: t("knowledgeBase"), icon: BookOpen },
        { path: "/test-cases", label: t("testCases"), icon: TestTube },
      ]
    },
    {
      title: t("tools"),
      items: [
        { path: "/analytics", label: t("analytics"), icon: BarChart3 },
        { path: "/physician-profile", label: t("profile"), icon: User },
        { path: "/help", label: "Help & Usage Guide", icon: HelpCircle },
      ]
    },
    {
      title: "iGEM 2025 Community Features",
      items: [
        { path: "/community/repository", label: "Case Repository", icon: Users },
        { path: "/community/phenotype-mapping", label: "Phenotype Mapping", icon: MapPin },
        { path: "/community/challenges", label: "Diagnostic Challenges", icon: Target },
      ]
    }
  ];

  return (
    <>
      {/* Toggle Button */}
      <Button
        variant="ghost"
        size="sm"
        className="fixed top-20 left-4 z-50 h-8 w-8 p-0"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
      </Button>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Main Sidebar */}
      <aside className={`fixed left-0 top-16 w-72 h-[calc(100vh-4rem)] bg-white dark:bg-gray-900 border-r border-slate-200 dark:border-gray-700 z-50 transform transition-transform duration-200 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-4 h-full overflow-y-auto">
          {/* Navigation Sections */}
          <nav className="space-y-6">
            {navigationSections.map((section, sectionIndex) => (
              <div key={section.title}>
                <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  {section.title}
                </h3>
                <div className="space-y-1">
                  {section.items.map(({ path, label, icon: Icon }) => (
                    <Button
                      key={path}
                      variant={location === path ? "default" : "ghost"}
                      size="sm"
                      asChild
                      className="w-full justify-start h-10 px-4 text-sm"
                      onClick={() => setIsOpen(false)}
                    >
                      <Link href={path}>
                        <Icon className="w-4 h-4 mr-3" />
                        {label}
                      </Link>
                    </Button>
                  ))}
                </div>
                {sectionIndex < navigationSections.length - 1 && (
                  <Separator className="mt-4" />
                )}
              </div>
            ))}
          </nav>

          {/* System Status */}
          <div className="mt-8 pt-4 border-t border-slate-200 dark:border-gray-700">
            <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
              {t("systemStatus")}
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-xs px-2 py-1">
                  CDSS Active
                </Badge>
                <Badge variant="secondary" className="text-xs px-2 py-1">
                  FHIR R4
                </Badge>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t("ehrIntegrationReady")}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}