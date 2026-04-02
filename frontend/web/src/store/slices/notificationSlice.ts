'use client';

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { INotification } from '@webdoctruyen/shared-fe';

interface NotificationState {
  notifications: INotification[];
  unreadCount: number;
}

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
};

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    setNotifications(state, action: PayloadAction<INotification[]>) {
      state.notifications = action.payload;
    },
    addNotification(state, action: PayloadAction<INotification>) {
      state.notifications.unshift(action.payload);
      state.unreadCount += 1;
    },
    setUnreadCount(state, action: PayloadAction<number>) {
      state.unreadCount = action.payload;
    },
    markNotificationRead(state, action: PayloadAction<string>) {
      const notif = state.notifications.find((n) => n._id === action.payload);
      if (notif && !notif.read) {
        notif.read = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    markAllNotificationsRead(state) {
      state.notifications.forEach((n) => {
        n.read = true;
      });
      state.unreadCount = 0;
    },
    resetNotifications() {
      return initialState;
    },
  },
});

export const {
  setNotifications,
  addNotification,
  setUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
  resetNotifications,
} = notificationSlice.actions;
export default notificationSlice.reducer;
