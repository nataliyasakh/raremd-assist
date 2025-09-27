import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Home, BookOpen, TestTube, Menu, X } from "lucide-react";
import { useSettings } from "@/hooks/useSettings";
import { useTranslation } from "@/lib/translations";
import { useState } from "react";

export default function SecondaryNav() {
  const [location] = useLocation();
  const { settings } = useSettings();
  const { t } = useTranslation(settings.language);
  const [isOpen, setIsOpen] = useState(false);

  const secondaryItems = [
    { path: "/", label: t("dashboard"), icon: Home },
    { path: "/knowledge-base", label: t("knowledgeBase"), icon: BookOpen },
    { path: "/test-cases", label: t("testCases"), icon: TestTube },
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

      {/* Collapsible Sidebar */}
      <aside className={`fixed left-0 top-16 w-64 h-[calc(100vh-4rem)] bg-white dark:bg-gray-900 border-r border-slate-200 dark:border-gray-700 z-50 transform transition-transform duration-200 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <nav className="p-4">
          <div className="space-y-2">
            {secondaryItems.map(({ path, label, icon: Icon }) => (
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
        </nav>
      </aside>

      {/* Mobile Navigation Fallback */}
      <nav className="md:hidden bg-white dark:bg-gray-900 border-b border-slate-200 dark:border-gray-700 fixed top-16 left-0 right-0 z-30">
        <div className="px-4 py-2">
          <div className="flex items-center gap-1 overflow-x-auto">
            {secondaryItems.map(({ path, label, icon: Icon }) => (
              <Button
                key={path}
                variant={location === path ? "default" : "ghost"}
                size="sm"
                asChild
                className="flex-shrink-0 h-8 px-3 text-xs"
              >
                <Link href={path}>
                  <Icon className="w-3 h-3 mr-1" />
                  {label}
                </Link>
              </Button>
            ))}
          </div>
        </div>
      </nav>
    </>
  );
}