import { useState, useEffect, useCallback } from 'react';

const NOTIFICATION_SETTINGS_KEY = 'financas-notification-settings';

export interface NotificationSettings {
  debtDue: {
    enabled: boolean;
    days: number;
  };
  installmentDue: {
    enabled: boolean;
    days: number;
  };
  subscriptionDue: {
    enabled: boolean;
    days: number;
  };
}

const defaultSettings: NotificationSettings = {
  debtDue: { enabled: true, days: 3 },
  installmentDue: { enabled: true, days: 3 },
  subscriptionDue: { enabled: true, days: 3 },
};

export const useNotificationSettings = () => {
  const [settings, setSettings] = useState<NotificationSettings>(defaultSettings);

  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem(NOTIFICATION_SETTINGS_KEY);
      if (savedSettings) {
        // Merge saved settings with defaults to avoid errors if new settings are added
        const saved = JSON.parse(savedSettings);
        setSettings(prev => ({ ...prev, ...saved }));
      }
    } catch (error) {
      console.error("Failed to load notification settings from localStorage", error);
    }
  }, []);

  const updateSettings = useCallback((newSettings: Partial<NotificationSettings>) => {
    setSettings(prevSettings => {
      const updated = { ...prevSettings, ...newSettings };
      try {
        localStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(updated));
      } catch (error) {
        console.error("Failed to save notification settings to localStorage", error);
      }
      return updated;
    });
  }, []);

  return { settings, updateSettings };
};