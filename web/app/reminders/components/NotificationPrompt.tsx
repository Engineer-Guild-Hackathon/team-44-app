import React, { useState, useEffect } from 'react';
import { initializeFirebaseMessaging, getFCMToken, isFCMSupported, registerFCMTokenWithBackend } from '../../../lib/firebaseMessaging';

interface NotificationPromptProps {
  onPermissionResult?: (granted: boolean) => void;
  autoShow?: boolean;
  forceShow?: boolean; // Add prop to force show the prompt
}

export const NotificationPrompt: React.FC<NotificationPromptProps> = ({
  onPermissionResult,
  autoShow = false,
  forceShow = false
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [permissionState, setPermissionState] = useState<NotificationPermission>('default');
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    // 現在の通知許可状態を確認
    if ('Notification' in window) {
      setPermissionState(Notification.permission);

      // 自動表示が有効で、まだ許可を求めていない場合に表示
      if (autoShow && Notification.permission === 'default') {
        setIsVisible(true);
      }
      
      // 強制表示が有効な場合
      if (forceShow && Notification.permission === 'default') {
        setIsVisible(true);
      }
    }
  }, [autoShow, forceShow]);

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      onPermissionResult?.(false);
      return;
    }

    if (!isFCMSupported()) {
      console.warn('FCM is not supported in this browser');
      onPermissionResult?.(false);
      return;
    }

    setIsRegistering(true);

    try {
      // Request notification permission
      const permission = await Notification.requestPermission();
      setPermissionState(permission);
      setIsVisible(false);

      const granted = permission === 'granted';

      if (granted) {
        try {
          // Initialize FCM and get token
          await initializeFirebaseMessaging();
          const token = await getFCMToken();
          
          if (token) {
            setFcmToken(token);
            
            // Register token with backend
            const backendRegistered = await registerFCMTokenWithBackend(token);
            if (backendRegistered) {
              console.log('FCM token registered with backend successfully');
            } else {
              console.warn('Failed to register FCM token with backend');
            }
            
            // テスト通知を送信
            new Notification('学習リマインド設定完了', {
              body: '通知が有効になりました。学習の復習タイミングをお知らせします。',
              icon: '/icons/icon-192x192.png'
            });
          } else {
            console.warn('Failed to get FCM token');
          }
        } catch (fcmError) {
          console.error('FCM setup failed:', fcmError);
          // Still call success if basic notification permission was granted
        }
      }

      onPermissionResult?.(granted);
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      onPermissionResult?.(false);
    } finally {
      setIsRegistering(false);
    }
  };

  const handleLater = () => {
    setIsVisible(false);
    onPermissionResult?.(false);
  };

  const handleAllow = () => {
    requestPermission();
  };

  // 手動で表示する関数を公開するため、forwardRefを使用
  const show = () => {
    if (Notification.permission === 'default') {
      setIsVisible(true);
    }
  };

  // 外部で使用するため、showメソッドを公開
  (NotificationPrompt as any).show = show;

  if (!isVisible || !('Notification' in window)) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[var(--color-bg-light)] rounded-lg p-6 max-w-sm mx-4 shadow-xl">
        <div className="text-center">
          {/* アイコン */}
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-[var(--color-accent)] bg-opacity-10 mb-4">
            <svg
              className="h-6 w-6 text-[var(--color-accent)]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-5 5v-5zM11 17H6l5 5v-5zM12 3v4m0 4v4m0-8a4 4 0 100 8 4 4 0 000-8z"
              />
            </svg>
          </div>

          {/* タイトル */}
          <h3 className="text-lg font-medium text-[var(--color-text-light)] mb-2">
            通知を許可しますか？
          </h3>

          {/* 説明 */}
          <p className="text-sm text-[var(--color-muted-foreground)] mb-6">
            学習リマインドを受け取るために<br />
            通知を有効にしてください。<br />
            忘却曲線に基づいて最適なタイミングで<br />
            復習をお知らせします。
          </p>

          {/* ボタン */}
          <div className="flex space-x-3">
            <button
              onClick={handleLater}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
            >
              後で
            </button>
            <button
              onClick={handleAllow}
              disabled={isRegistering}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRegistering ? '設定中...' : '許可する'}
            </button>
          </div>

          {/* 補足情報 */}
          <p className="text-xs text-gray-400 mt-4">
            設定はいつでも変更できます
          </p>
        </div>
      </div>
    </div>
  );
};

// 通知許可状態を確認するヘルパー関数
export const checkNotificationPermission = (): NotificationPermission => {
  if (!('Notification' in window)) {
    return 'denied';
  }
  return Notification.permission;
};

// FCM対応状況を確認するヘルパー関数
export const checkFCMSupport = (): {
  supported: boolean;
  permission: NotificationPermission;
  serviceWorkerSupported: boolean;
} => {
  const permission = checkNotificationPermission();
  const serviceWorkerSupported = 'serviceWorker' in navigator;
  const supported = isFCMSupported();
  
  return {
    supported,
    permission,
    serviceWorkerSupported
  };
};

// 通知を送信するヘルパー関数
export const sendNotification = (title: string, options?: NotificationOptions) => {
  if (Notification.permission === 'granted') {
    return new Notification(title, {
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      ...options
    });
  } else {
    console.warn('Notification permission not granted');
    return null;
  }
};
