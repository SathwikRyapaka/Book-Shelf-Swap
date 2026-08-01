import { createSlice } from '@reduxjs/toolkit';

const claimsSlice = createSlice({
  name: 'claims',
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
    setClaims: (state, action) => {
      state.books = action.payload;
      state.error = null;
    }
  }
});

export const { setLoading, setError, setClaims } = claimsSlice.actions;
export default claimsSlice.reducer;
