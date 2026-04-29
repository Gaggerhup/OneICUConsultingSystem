'use client';

import { Check } from 'lucide-react';
import type { Notification } from '@/context/AppContext';

type TFunction = (key: string) => string;

export function HeaderNotificationsDropdown({
  notifications,
  markNotificationAsRead,
  clearNotifications,
  t,
}: {
  notifications: Notification[];
  markNotificationAsRead: (id: string) => Promise<void>;
  clearNotifications: () => Promise<void>;
  t: TFunction;
}) {
  return (
    <div className="notification-dropdown">
      <div className="dropdown-header">
        <h3>{t('header.notifications')}</h3>
        {notifications.length > 0 && (
          <button className="clear-all" onClick={clearNotifications}>
            {t('common.clearAll')}
          </button>
        )}
      </div>
      <div className="notification-list">
        {notifications.length === 0 ? (
          <div className="empty-notifications">
            <p>No new notifications</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div key={notification.id} className={`notification-item ${notification.read ? 'read' : 'unread'}`}>
              <div className="notif-content">
                <div className="notif-title-row">
                  <span className="notif-title">{notification.title}</span>
                  <span className="notif-time">{notification.time}</span>
                </div>
                <p className="notif-msg">{notification.message}</p>
              </div>
              {!notification.read && (
                <button
                  className="mark-read-btn"
                  onClick={() => markNotificationAsRead(notification.id)}
                  title="Mark as read"
                >
                  <Check size={14} />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
