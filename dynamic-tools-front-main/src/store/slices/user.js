import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const initialState = {
  token: null,
  userId: null,
  walletAddress: '',
  watchlistData: null,
  watchlistDataStatus: null,
  saveCustomFormatStatus: null,
  saveNotesData: { projectInfo: '', analytics: '', sales: '', listings: '', trends: '' },
  saveNotesStatus: 'idle',
  addToWatchListStatus: 'idle',
  saveFeedbackStatus: 'idle',
};

export const saveUserAddress = createAsyncThunk('user/saveUserAddress', async (data) => {
  const response = await axios.post(`${process.env.REACT_APP_BASE_URL}/users`, data);

  return response.data;
});

export const saveCustomFormat = createAsyncThunk('user/saveCustomFormat', async ({ token, ...data }) => {
  const response = await axios.post(`${process.env.REACT_APP_BASE_URL}/format`, data, {
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
    },
  });

  return response.data;
});

export const getCustomFormat = createAsyncThunk('user/getCustomFormat', async ({ token, ...data }, { dispatch }) => {
  const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/format`, {
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
    },
  });
  const resData = response.data;

  if (resData && resData.data && resData.data.length) {
    // TODO: handle response
  }
});

export const saveFeedback = createAsyncThunk('user/saveFeedback', async ({ token, text, walletAddress }) => {
  const response = await axios.post(
    `${process.env.REACT_APP_BASE_URL}/feedback`,
    {
      text,
      walletAddress,
    },
    {
      headers: {
        Authorization: token,
        'Content-Type': 'application/json',
      },
    }
  );

  return response.data;
});

export const saveNotes = createAsyncThunk('user/saveNotes', async ({ token, ...data }) => {
  const response = await axios.post(`${process.env.REACT_APP_BASE_URL}/notes`, data, {
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
    },
  });

  return response.data;
});

export const getNotes = createAsyncThunk('user/getNotes', async ({ token, ...data }) => {
  const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/notes`, {
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
    },
  });

  return response.data;
});

export const addToWatchList = createAsyncThunk('user/addToWatchList', async ({ token, ...data }) => {
  const response = await axios.post(`${process.env.REACT_APP_BASE_URL}/users/watchlist`, data, {
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
    },
  });

  return response.data;
});

export const getWatchlistCollection = createAsyncThunk('user/getWatchlistCollection', async ({ token, ...data }) => {
  const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/users/watchlist`, {
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
    },
  });

  return response.data;
});

const userSlice = createSlice({
  name: 'userSlice',
  initialState,
  reducers: {
    setAddToWatchListStatus: (state) => {
      state.addToWatchListStatus = 'idle';
    },
    setSaveNoteStatus: (state) => {
      state.saveNotesStatus = 'idle';
    },
    setWalletAddress: (state, action) => {
      state.walletAddress = action.payload;
    },
  },
  extraReducers: {
    // Save user feedback
    [saveFeedback.pending]: (state) => {
      state.saveFeedbackStatus = 'loading';
    },
    [saveFeedback.fulfilled]: (state) => {
      state.saveFeedbackStatus = 'success';
    },
    [saveFeedback.rejected]: (state) => {
      state.saveFeedbackStatus = 'failed';
    },
    // Save user address
    [saveUserAddress.fulfilled]: (state, action) => {
      state.token = action.payload.token;
      state.userId = action.payload.userId;
    },
    // Save custom format
    [saveCustomFormat.fulfilled]: (state, action) => {
      state.saveCustomFormatStatus = true;
    },
    // Save notes
    [saveNotes.rejected]: (state) => {
      state.saveNotesStatus = 'failed';
    },
    [saveNotes.fulfilled]: (state) => {
      state.saveNotesStatus = 'success';
    },
    // Save notes
    [getNotes.fulfilled]: (state, action) => {
      const data = action.payload?.Notes;
      const newGetNotes = (type) => {
        return data?.filter((e) => e.type === type);
      };

      state.saveNotesData.projectInfo = newGetNotes('project_Info');
      state.saveNotesData.analytics = newGetNotes('analytics');
      state.saveNotesData.sales = newGetNotes('sales');
      state.saveNotesData.listings = newGetNotes('listings');
      state.saveNotesData.trends = action.payload?.Notes[0]?.trends;
    },

    // Add the collection to the watchList
    [addToWatchList.pending]: (state) => {
      state.addToWatchListStatus = 'loading';
    },
    [addToWatchList.fulfilled]: (state, action) => {
      const message = action.payload?.message;

      if (message === 'already Exist') {
        state.addToWatchListStatus = 'already Exist';
      } else if (message === 'success') {
        state.addToWatchListStatus = 'success';
      } else {
        state.addToWatchListStatus = 'failed';
      }
    },
    [addToWatchList.rejected]: (state) => {
      state.addToWatchListStatus = 'failed';
    },
    // Get the watchlist data
    [getWatchlistCollection.pending]: (state) => {
      state.watchlistDataStatus = 'loading';
    },
    [getWatchlistCollection.fulfilled]: (state, action) => {
      state.watchlistData = action.payload?.result;
      state.watchlistDataStatus = 'success';
    },
    [getWatchlistCollection.rejected]: (state) => {
      state.watchlistDataStatus = 'failed';
    },
  },
});

export const { setWalletAddress, setAddToWatchListStatus, setSaveNoteStatus } = userSlice.actions;

export default userSlice.reducer;
