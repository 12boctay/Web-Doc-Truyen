'use client';

import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import createWebStorage from 'redux-persist/lib/storage/createWebStorage';

const createNoopStorage = () => ({
  getItem(_key: string) { return Promise.resolve(null); },
  setItem(_key: string, value: string) { return Promise.resolve(value); },
  removeItem(_key: string) { return Promise.resolve(); },
});

const storage = typeof window !== 'undefined'
  ? createWebStorage('local')
  : createNoopStorage();
import authReducer from './slices/authSlice';
import uiReducer from './slices/uiSlice';
import readerReducer from './slices/readerSlice';
import chatReducer from './slices/chatSlice';
import notificationReducer from './slices/notificationSlice';

const persistConfig = {
  key: 'webdoctruyen',
  storage,
  whitelist: ['auth', 'ui', 'reader'],
};

const rootReducer = combineReducers({
  auth: authReducer,
  ui: uiReducer,
  reader: readerReducer,
  chat: chatReducer,
  notification: notificationReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
