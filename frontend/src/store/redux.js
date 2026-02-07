import { configureStore } from "@reduxjs/toolkit";
import mapSlice from "./map-slice";
import insightsSlice from "./insight-slice";
const store = configureStore({
  reducer: { insights: insightsSlice.reducer, heatMap: mapSlice.reducer },
});

export default store;
