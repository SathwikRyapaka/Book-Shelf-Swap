import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_BASE_URL } from '../App.jsx';

export const fetchMyListings = createAsyncThunk(
  'listings/fetch',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await axios.get(`${API_BASE_URL}/users/${auth.currentUser.id}/listings`);
      return response.data;
    } catch (err) {
      return rejectWithValue('Failed to fetch your listings.');
    }
  }
);

export const addListing = createAsyncThunk(
  'listings/add',
  async (bookData, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await axios.post(`${API_BASE_URL}/books`, {
        ...bookData,
        owner_id: auth.currentUser.id
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || 'Failed to add book.');
    }
  }
);

export const deleteListing = createAsyncThunk(
  'listings/delete',
  async (bookId, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      await axios.delete(`${API_BASE_URL}/books/${bookId}?user_id=${auth.currentUser.id}`);
      return bookId;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || 'Failed to delete book.');
    }
  }
);

const listingsSlice = createSlice({
  name: 'listings',
  initialState: {
    books: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Listings
      .addCase(fetchMyListings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyListings.fulfilled, (state, action) => {
        state.loading = false;
        state.books = action.payload;
      })
      .addCase(fetchMyListings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add Listing
      .addCase(addListing.fulfilled, (state, action) => {
        state.books.unshift(action.payload);
        state.error = null;
      })
      .addCase(addListing.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Delete Listing
      .addCase(deleteListing.fulfilled, (state, action) => {
        state.books = state.books.filter(b => b.id !== action.payload);
        state.error = null;
      })
      .addCase(deleteListing.rejected, (state, action) => {
        state.error = action.payload;
      });
  }
});

export default listingsSlice.reducer;
