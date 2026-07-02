import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { userService } from "../services/userService";

// FETCH USERS
export const fetchUsers = createAsyncThunk(
  "users/fetchAll",
  async (_, thunkAPI) => {
    try {
      const res = await userService.getAllUsers();
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

// DELETE USER
export const deleteUser = createAsyncThunk(
  "users/delete",
  async (id, thunkAPI) => {
    try {
      await userService.deleteUser(id);
      return id;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

const userSlice = createSlice({
  name: "users",
  initialState: {
    users: [],
    loading: false,
    error: null,
  },

  reducers: {},

  extraReducers: (builder) => {
    builder

      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
      })

      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })

      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter(
          (u) => u._id !== action.payload
        );
      });
  },
});

export default userSlice.reducer;   