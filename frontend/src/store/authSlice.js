import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentUser: { id: 'user1', name: 'Alice' },
  users: [
    { id: 'user1', name: 'Alice' },
    { id: 'user2', name: 'Bob' },
    { id: 'user3', name: 'Charlie' },
  ]
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCurrentUser: (state, action) => {
      const user = state.users.find(u => u.id === action.payload);
      if (user) {
        state.currentUser = user;
      }
    }
  }
});

export const { setCurrentUser } = authSlice.actions;
export default authSlice.reducer;
