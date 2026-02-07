import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getData } from "../hooks/useAPI";
export const fetchMapData = createAsyncThunk(
  "map/fetchMap",
  async (_, thunkApi) => {
    try {
      const data = await getData("http://localhost:5000/api/map/heatmap");
      return data;
    } catch (error) {
      return thunkApi.rejectWithValue(
        `Fetching Map Data Failed: ${error.message}`
      );
    }
  }
);

const mapSlice = createSlice({
  name: "heatMap",
  initialState: {
    data: [],
    loading: false,
    error: null,
  },
  reducers: {
    updateMapData: (state, action) => {
      state.data = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMapData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMapData.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchMapData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default mapSlice;
export const mapActions = mapSlice.actions;
