import React, { useState, useEffect } from 'react';

interface ReminderSettings {
  enabled: boolean;
  notificationMethods: ('push' | 'email')[];
  reviewIntervals: number[];
}

interface ReminderSettingsProps {
  onSettingsChange?: (settings: ReminderSettings) => void;
}

export const ReminderSettings: React.FC<ReminderSettingsProps> = ({ onSettingsChange }) => {
  const [settings, setSettings] = useState<ReminderSettings>({
    enabled: true,
    notificationMethods: ['push'],
    reviewIntervals: [1, 3, 7, 14, 30]
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // デフォルトの忘却曲線スケジュール
  const DEFAULT_INTERVALS = [1, 3, 7, 14, 30];
  const INTERVAL_LABELS = ['1日後', '3日後', '1週間後', '2週間後', '1ヶ月後'];

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/reminderSettings`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setSettings(data.data);
        }
      } else {
        console.log('Using default settings');
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/reminderSettings`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      });

      if (response.ok) {
        onSettingsChange?.(settings);
        alert('設定が保存されました');
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('設定の保存に失敗しました');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEnabledToggle = () => {
    setSettings(prev => ({ ...prev, enabled: !prev.enabled }));
  };

  const handleNotificationMethodChange = (method: 'push' | 'email', checked: boolean) => {
    setSettings(prev => ({
      ...prev,
      notificationMethods: checked
        ? [...prev.notificationMethods, method]
        : prev.notificationMethods.filter(m => m !== method)
    }));
  };

  const handleIntervalChange = (index: number, value: number) => {
    const newIntervals = [...settings.reviewIntervals];
    newIntervals[index] = value;
    setSettings(prev => ({ ...prev, reviewIntervals: newIntervals }));
  };

  const resetToDefault = () => {
    setSettings(prev => ({ ...prev, reviewIntervals: DEFAULT_INTERVALS }));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="text-[var(--color-muted-foreground)]">設定を読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-[var(--color-text-light)]">リマインド設定</h2>

      {/* リマインド有効/無効 */}
      <div className="mb-6">
        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={settings.enabled}
            onChange={handleEnabledToggle}
            className="w-5 h-5 text-[var(--color-accent)] bg-[var(--color-bg-light)] border-[var(--color-border)] rounded focus:ring-[var(--color-accent)] focus:ring-opacity-20"
          />
          <span className="text-lg font-medium text-[var(--color-text-light)]">
            学習リマインドを有効にする
          </span>
        </label>
      </div>

      {settings.enabled && (
        <>
          {/* 通知方法選択 */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3 text-[var(--color-text-light)]">通知方法</h3>
            <div className="space-y-2">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={settings.notificationMethods.includes('push')}
                  onChange={(e) => handleNotificationMethodChange('push', e.target.checked)}
                  className="w-4 h-4 text-[var(--color-accent)] bg-[var(--color-bg-light)] border-[var(--color-border)] rounded focus:ring-[var(--color-accent)] focus:ring-opacity-20"
                />
                <span className="text-[var(--color-text-light)]">プッシュ通知</span>
              </label>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={settings.notificationMethods.includes('email')}
                  onChange={(e) => handleNotificationMethodChange('email', e.target.checked)}
                  className="w-4 h-4 text-[var(--color-accent)] bg-[var(--color-bg-light)] border-[var(--color-border)] rounded focus:ring-[var(--color-accent)] focus:ring-opacity-20"
                />
                <span className="text-[var(--color-text-light)]">メール通知</span>
              </label>
            </div>
          </div>

          {/* 忘却曲線スケジュール */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-medium text-[var(--color-text-light)]">復習スケジュール</h3>
              <button
                onClick={resetToDefault}
                className="text-sm text-[var(--color-accent)] hover:text-[var(--color-primary)] transition-colors"
              >
                デフォルトに戻す
              </button>
            </div>

            <div className="bg-[var(--color-muted)] bg-opacity-30 p-4 rounded-lg border border-[var(--color-border)]">
              <p className="text-sm text-[var(--color-muted-foreground)] mb-4">
                ※デフォルトの値はエビングハウスの忘却曲線に基づく復習タイミングです。
              </p>

              <div className="space-y-3">
                {settings.reviewIntervals.map((interval, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <span className="w-20 text-sm text-[var(--color-text-light)]">
                      {index + 1}回目:
                    </span>
                    <input
                      type="number"
                      value={interval}
                      onChange={(e) => handleIntervalChange(index, parseInt(e.target.value) || 1)}
                      min="1"
                      max="365"
                      className="input-field w-20 text-center"
                    />
                    <span className="text-sm text-[var(--color-text-light)]">日後</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 保存ボタン */}
          <div className="flex justify-end">
            <button
              onClick={saveSettings}
              disabled={isSaving}
              className={`btn-primary disabled:opacity-50 disabled:cursor-not-allowed ${
                isSaving ? 'bg-[var(--color-muted)] text-[var(--color-muted-foreground)]' : ''
              }`}
            >
              {isSaving ? '保存中...' : '設定を保存'}
            </button>
          </div>
        </>
      )}
    </div>
  );
};
