import { configureStore } from '@reduxjs/toolkit';
import dagReducer from './dagSlice';

export const store = configureStore({
  reducer: {
    dag: dagReducer
  }
});
