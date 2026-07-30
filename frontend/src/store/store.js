import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import uiReducer from './uiSlice';
import availableBooksReducer from './availableBooksSlice';
import listingsReducer from './listingsSlice';
import claimsReducer from './claimsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    availableBooks: availableBooksReducer,
    listings: listingsReducer,
    claims: claimsReducer,
  }
});
