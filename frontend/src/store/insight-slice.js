import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getData } from "../hooks/useAPI";

export const fetchInsights = createAsyncThunk(
  "insights/fetchInsights",
  async (_, thunkApi) => {
    try {
      const data = await getData("http://localhost:5000/api/recommendations");
      let parsedData;
      if (data && data[0] && data[0].text) {
        parsedData = JSON.parse(data[0].text);
      }
      return parsedData;
    } catch (error) {
      return thunkApi.rejectWithValue(
        `Fetching Insights Data Failed: ${error.message}`
      );
    }
  }
);

const insightsSlice = createSlice({
  name: "insights",
  initialState: {
    data: { insights: [], alerts: [] },
    loading: false,
    error: null,
  },
  reducers: {
    updateInsights: (state, action) => {
      state.data = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInsights.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInsights.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchInsights.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default insightsSlice;
