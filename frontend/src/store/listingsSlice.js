import { createSlice } from '@reduxjs/toolkit';

const listingsSlice = createSlice({
  name: 'listings',
  initialState: {
    books: [],
    loading: false,
    error: null,
  },
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setListings: (state, action) => {
      state.books = action.payload;
      state.error = null;
    },
    addListing: (state, action) => {
      // action.payload is the new book object
      state.books.unshift(action.payload);
    },
    removeListing: (state, action) => {
      // action.payload is the bookId
      state.books = state.books.filter(b => b.id !== action.payload);
    }
  }
});

export const { setLoading, setError, setListings, addListing, removeListing } = listingsSlice.actions;
export default listingsSlice.reducer;
