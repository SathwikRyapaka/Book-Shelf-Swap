import { createSlice } from '@reduxjs/toolkit';

const availableBooksSlice = createSlice({
  name: 'availableBooks',
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
    setBooks: (state, action) => {
      state.books = action.payload;
      state.error = null;
    },
    removeBook: (state, action) => {
      // action.payload will be the bookId
      state.books = state.books.filter(b => b.id !== action.payload);
    }
  }
});

export const { setLoading, setError, setBooks, removeBook } = availableBooksSlice.actions;
export default availableBooksSlice.reducer;
