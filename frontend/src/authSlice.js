import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import  axiosClient  from './utills/axiosClient';




// Thunks
export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      
      const response = await axiosClient.post('/user/register', userData);
      
      return response.data.user;
      
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post('/user/login', credentials);
       
      return response.data.user;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const checkAuth = createAsyncThunk(
  'auth/checkAuth',
  async (_, { rejectWithValue }) => {
    try {
       const {data} = await axiosClient.get('/user/check');
      return data.user;
    } catch (err) {
      if(err.response?.status===401){
        return rejectWithValue(null);
      }
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await axiosClient.post('/user/logout');
      return null;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Slice
const authSlice = createSlice({
  name: 'auth',
   initialState : {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
},
  reducers: {},
  extraReducers: (builder) => {
    // Register
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = !!action.payload;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Something went wrong';
        state.isAuthenticated=false;
        state.user=null;
      });

    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = !!action.payload;
      })
      .addCase(loginUser.rejected, (state, action) => {
       state.loading = false;
        state.error = action.payload?.message || 'Something went wrong';
        state.isAuthenticated=false;
        state.user=null;
      });

    // Check Auth
    builder
      .addCase(checkAuth.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = !!action.payload;
      })
      .addCase(checkAuth.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Something went wrong';
        state.isAuthenticated=false;
        state.user=null;
      });

    // Logout
    builder
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Something went wrong';
        state.isAuthenticated=false;
        state.user=null;
      });
  },
});




// Async thunk to fetch paginated problems
export const fetchProblems = createAsyncThunk(
  'problems/fetchProblems',
  // Accepts an object like { page: 1, limit: 10 }
  async ({ page = 1, limit = 10 }, thunkAPI) => {
    try {
      const { data } = await axiosClient.get('/problem/getAllProblem', {
        params: { page, limit }
      });
      // data: { problems: [...], meta: {...} }
      return data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || 'Fetch failed'
      );
    }
  }
);

export const deleteProblem = createAsyncThunk(
  'problems/deleteProblem',
  async (problemId, { rejectWithValue }) => {
    try {
      // This makes the API call: DELETE /api/problem/delete/:id
      await axiosClient.delete(`/problem/delete/${problemId}`);
      // If successful, return the ID. The reducer will use this to remove the problem.
      return problemId;
    } catch (error) {
      // If the API call fails, return the error message.
      return rejectWithValue(error.response.data.message || 'Failed to delete problem');
    }
  }
);

// Problems slice
const problemsSlice = createSlice({
  name: 'problems',
  initialState: {
    list: [],
    meta: {
      currentPage: 1,
      totalPages: 1,
      totalProblems: 0,
      limit: 10
    },
    status: 'idle', 
    error: null
  },
  reducers: {
    
    clearProblems(state) {
      state.list = [];
      state.meta = {
        currentPage: 1,
        totalPages: 1,
        totalProblems: 0,
        limit: 10
      };
      state.status = 'idle';
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProblems.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchProblems.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.list = action.payload.problems;
        state.meta = action.payload.meta;
      })
      .addCase(fetchProblems.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

        .addCase(deleteProblem.pending, (state) => {
        state.status = 'loading'; // Show a loading state while deleting
      })
      .addCase(deleteProblem.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // On success, filter the list to remove the problem with the matching ID
        state.list = state.list.filter(problem => problem._id !== action.payload);
      })
      .addCase(deleteProblem.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload; // Store the error message
      })
  }
});

// Export actions and reducer
export const { clearProblems } = problemsSlice.actions;
export const problemsReducer = problemsSlice.reducer;

 export default authSlice.reducer;