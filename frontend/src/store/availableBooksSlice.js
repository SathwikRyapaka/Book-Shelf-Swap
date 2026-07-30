import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_BASE_URL } from '../App.jsx';

export const fetchAvailableBooks = createAsyncThunk(
  'availableBooks/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/books`);
      return response.data;
    } catch (err) {
      return rejectWithValue('Failed to fetch available books. Please try again later.');
    }
  }
);

export const claimBook = createAsyncThunk(
  'availableBooks/claim',
  async (bookId, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      await axios.post(`${API_BASE_URL}/books/${bookId}/claim`, { user_id: auth.currentUser.id });
      return bookId; // return ID to remove it from available books locally
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || 'Failed to claim the book.');
    }
  }
);

const availableBooksSlice = createSlice({
  name: 'availableBooks',
  initialState: {
    books: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch books
      .addCase(fetchAvailableBooks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAvailableBooks.fulfilled, (state, action) => {
        state.loading = false;
        state.books = action.payload;
      })
      .addCase(fetchAvailableBooks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Claim book
      .addCase(claimBook.fulfilled, (state, action) => {
        // Remove from available books
        state.books = state.books.filter(b => b.id !== action.payload);
      })
      .addCase(claimBook.rejected, (state, action) => {
        state.error = action.payload;
      });
  }
});

export default availableBooksSlice.reducer;
