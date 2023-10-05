import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const initialState = {
  loadingStatus: false,
  marketSummaryData: {},
  marketSummaryDataStatus: null,
};

export const getMarketSummary = createAsyncThunk('marketSummary/getMarketSummary', async () => {
  const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/market-summary`);

  return response.data && response.data.result ? response.data.result : {};
});

const marketSummarySlice = createSlice({
  name: 'marketOverview',
  initialState,
  reducers: {},
  extraReducers: {
    // Get market overview data
    [getMarketSummary.pending]: (state) => {
      state.marketSummaryDataStatus = 'loading';
      state.loadingStatus = true;
    },
    [getMarketSummary.fulfilled]: (state, action) => {
      state.marketSummaryData = action.payload;
      state.marketSummaryDataStatus = 'success';
      state.loadingStatus = false;
    },
    [getMarketSummary.rejected]: (state) => {
      state.marketSummaryDataStatus = 'failed';
      state.loadingStatus = false;
    },
  },
});

export default marketSummarySlice.reducer;
