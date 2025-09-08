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
      // TODO: API呼び出しを実装
      console.log('Fetching reminder settings...');
      // const response = await fetch('/api/reminderSettings');
      // const data = await response.json();
      // setSettings(data.data);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async () => {
    setIsSaving(true);
    try {
      // TODO: API呼び出しを実装
      console.log('Saving reminder settings:', settings);
      // const response = await fetch('/api/reminderSettings', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(settings)
      // });

      onSettingsChange?.(settings);
      alert('設定が保存されました');
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
        <div className="text-gray-600">設定を読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">リマインド設定</h2>

      {/* リマインド有効/無効 */}
      <div className="mb-6">
        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={settings.enabled}
            onChange={handleEnabledToggle}
            className="w-5 h-5 text-blue-600"
          />
          <span className="text-lg font-medium text-gray-700">
            学習リマインドを有効にする
          </span>
        </label>
      </div>

      {settings.enabled && (
        <>
          {/* 通知方法選択 */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3 text-gray-700">通知方法</h3>
            <div className="space-y-2">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={settings.notificationMethods.includes('push')}
                  onChange={(e) => handleNotificationMethodChange('push', e.target.checked)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-gray-600">プッシュ通知</span>
              </label>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={settings.notificationMethods.includes('email')}
                  onChange={(e) => handleNotificationMethodChange('email', e.target.checked)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-gray-600">メール通知</span>
              </label>
            </div>
          </div>

          {/* 忘却曲線スケジュール */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-medium text-gray-700">復習スケジュール</h3>
              <button
                onClick={resetToDefault}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                デフォルトに戻す
              </button>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-4">
                エビングハウスの忘却曲線に基づく復習タイミングです
              </p>

              <div className="space-y-3">
                {settings.reviewIntervals.map((interval, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <span className="w-16 text-sm text-gray-600">
                      {INTERVAL_LABELS[index] || `${index + 1}回目`}:
                    </span>
                    <input
                      type="number"
                      value={interval}
                      onChange={(e) => handleIntervalChange(index, parseInt(e.target.value) || 1)}
                      min="1"
                      max="365"
                      className="w-20 px-2 py-1 border border-gray-300 rounded text-center"
                    />
                    <span className="text-sm text-gray-600">日後</span>
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
              className={`px-6 py-2 rounded-lg font-medium ${
                isSaving
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
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
