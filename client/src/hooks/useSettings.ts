import { useState, useEffect } from 'react';

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  autoSave: boolean;
  notifications: {
    alerts: boolean;
    updates: boolean;
    weeklyReports: boolean;
    emergencyAlerts: boolean;
  };
  cdss: {
    autoRecommendations: boolean;
    confidenceThreshold: number;
    interactionAlerts: boolean;
    pathwayGuidance: boolean;
  };
}

const defaultSettings: UserSettings = {
  theme: 'light',
  language: 'en',
  timezone: 'UTC-8',
  autoSave: true,
  notifications: {
    alerts: true,
    updates: false,
    weeklyReports: true,
    emergencyAlerts: true
  },
  cdss: {
    autoRecommendations: true,
    confidenceThreshold: 80,
    interactionAlerts: true,
    pathwayGuidance: true
  }
};

export function useSettings() {
  const [settings, setSettings] = useState<UserSettings>(() => {
    const saved = localStorage.getItem('raremd-settings');
    return saved ? JSON.parse(saved) : defaultSettings;
  });

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem('raremd-settings', JSON.stringify(updated));
      return updated;
    });
  };

  const updateNestedSettings = <K extends keyof UserSettings>(
    category: K, 
    updates: Partial<UserSettings[K]>
  ) => {
    setSettings(prev => {
      const updated = {
        ...prev,
        [category]: { ...prev[category] as object, ...updates }
      };
      localStorage.setItem('raremd-settings', JSON.stringify(updated));
      return updated;
    });
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    localStorage.setItem('raremd-settings', JSON.stringify(defaultSettings));
  };

  // Apply theme changes to document
  useEffect(() => {
    const root = document.documentElement;
    
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else if (settings.theme === 'light') {
      root.classList.remove('dark');
    } else {
      // System theme
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [settings.theme]);

  // Apply language changes to document
  useEffect(() => {
    document.documentElement.lang = settings.language;
  }, [settings.language]);

  return {
    settings,
    updateSettings,
    updateNestedSettings,
    resetSettings
  };
}