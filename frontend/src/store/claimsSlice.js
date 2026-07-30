import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_BASE_URL } from '../App.jsx';

export const fetchMyClaims = createAsyncThunk(
  'claims/fetch',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await axios.get(`${API_BASE_URL}/users/${auth.currentUser.id}/claims`);
      return response.data;
    } catch (err) {
      return rejectWithValue('Failed to fetch your claims.');
    }
  }
);

const claimsSlice = createSlice({
  name: 'claims',
  initialState: {
    books: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyClaims.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyClaims.fulfilled, (state, action) => {
        state.loading = false;
        state.books = action.payload;
      })
      .addCase(fetchMyClaims.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export default claimsSlice.reducer;
