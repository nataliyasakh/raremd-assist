import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Stethoscope, Brain, User } from "lucide-react";
import { useSettings } from "@/hooks/useSettings";
import { useTranslation } from "@/lib/translations";

export default function Header() {
  const [location] = useLocation();
  const { settings } = useSettings();
  const { t } = useTranslation(settings.language);
  
  const isHomePage = location === "/";

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-slate-200 dark:border-gray-700 shadow-sm fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Title */}
          <div className="flex items-center gap-4">
            {!isHomePage && (
              <Button 
                variant="ghost" 
                size="sm" 
                asChild
                className="text-slate-600 hover:text-blue-600 h-6 px-2 text-xs"
              >
                <Link href="/">
                  <ArrowLeft className="w-3 h-3 mr-0.5" />
                  Back
                </Link>
              </Button>
            )}
            
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="flex items-center gap-1">
                <Stethoscope className="text-blue-600 w-6 h-6" />
                <Brain className="text-purple-600 w-5 h-5" />
              </div>
              <div>
                <h1 className="text-base font-bold text-slate-900 dark:text-white">RareMD Assist</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">v1.2.0</p>
              </div>
            </Link>
          </div>

          {/* Physician Navigation Message */}
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 bg-blue-50 dark:bg-blue-950/20 px-3 py-1.5 rounded-lg border border-blue-200 dark:border-blue-800">
              <User className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                For Physicians:
              </span>
              <span className="text-sm text-blue-700 dark:text-blue-300">
                Access diagnostic tools via sidebar menu
              </span>
            </div>
            
            {/* Mobile instruction */}
            <div className="md:hidden flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400">
              <User className="h-3 w-3" />
              <span>Tap menu for tools</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}