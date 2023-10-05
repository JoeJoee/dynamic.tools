import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { collectionColumns, getCollectionFieldSortKey } from '../../utils/Collection';

const initialState = {
  loadingStatus: false,
  currency: 'ETH',
  searchValue: '',
  mode: 'trending',
  collectionData: [],
  collectionDataStatus: null,
  collectionDetailsData: null,
  collectionDetailsStatus: null,
  collectionNotes: [],
  timeRange: '7d',
  sortKey: '',
  sortDirection: '',
  changePercentageSortedData: null,
  collectionListings: [],
  collectionSales: [],
  collectionWatchlist: [],
};

// Get a list of trending collections
export const getCollections = createAsyncThunk('collection/getCollections', async (data, { getState }) => {
  data = data || {};

  const { offset = 0 } = data;
  const state = getState();
  const { currency, mode, searchValue, sortDirection, sortKey, timeRange } = state.collection;

  let sortDirectionValue = sortDirection;
  const walletAddress = state.user.walletAddress || '';

  let sortKeyValue = '';

  if (sortKey) {
    const sortColumnData = collectionColumns.find((item) => item && item.field === sortKey);

    if (sortColumnData) {
      sortKeyValue = `stats.${getCollectionFieldSortKey(sortColumnData, timeRange)}`;
    }
  } else {
    sortKeyValue = `stats.${getCollectionFieldSortKey({ field: 'volume', isTimeRangeSpecific: true }, timeRange)}`;
    sortDirectionValue = 'desc';
  }

  const response = await axios.get(
    `${process.env.REACT_APP_BASE_URL}/collections?offset=${offset || 0}&currency=${currency || 'ETH'}&walletAddress=${
      walletAddress || ''
    }&search=${searchValue}&sortKey=${sortKeyValue || ''}&sortDirection=${sortDirectionValue || ''}&own=${
      mode === 'own'
    }`
  );

  return {
    data: response.data,
    addItems: offset > 0,
  };
});

// Get collection details
export const getCollectionDetails = createAsyncThunk('collection/getCollectionDetails', async (slug) => {
  const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/collections/${slug}`);

  return response.data;
});

// Get collection notes
export const getCollectionNotes = createAsyncThunk('collection/getCollectionNotes', async (payload) => {
  const response = await axios.get(
    `${process.env.REACT_APP_BASE_URL}/collections/${payload.slug}/notes?offset=${payload.offset || 0}&limit=${
      payload.limit
    }&sortKey=createdAt&sortDirection=desc&walletAddress=${payload.walletAddress}`
  );

  return response.data;
});

// Get collection watchlist
export const getCollectionWatchlist = createAsyncThunk('collection/getCollectionWatchlist', async (payload) => {
  const response = await axios.get(
    `${process.env.REACT_APP_BASE_URL}/collections/watchlist?offset=${payload.offset || 0}&limit=${
      payload.limit || 10
    }&walletAddress=${payload.walletAddress}`
  );

  return response.data;
});

// Add the collection to the watchlist
export const addCollectionToWatchlist = async (payload) => {
  const response = await axios.post(`${process.env.REACT_APP_BASE_URL}/collections/${payload.slug}/watchlist`, {
    walletAddress: payload.walletAddress,
  });

  return response.data;
};

// Delete the collection from the watchlist
export const deleteCollectionFromWatchlist = async (payload) => {
  const response = await axios.delete(
    `${process.env.REACT_APP_BASE_URL}/collections/${payload.slug}/watchlist?walletAddress=${payload.walletAddress}`
  );

  return response.data;
};

// Get collection notes
export const saveCollectionNote = async (payload) => {
  const response = await axios.post(`${process.env.REACT_APP_BASE_URL}/collections/${payload.slug}/notes`, {
    title: payload.title,
    text: payload.text,
    walletAddress: payload.walletAddress,
  });

  return response.data;
};

// Delete collection note
export const deleteCollectionNote = async (id) => {
  const response = await axios.delete(`${process.env.REACT_APP_BASE_URL}/notes/${id}`);

  return response.data;
};

// Get collection listings
export const getCollectionListings = createAsyncThunk('collection/getCollectionListings', async (payload) => {
  const { offset = 0, limit = 10, slug } = payload;

  const response = await axios.get(
    `${process.env.REACT_APP_BASE_URL}/collections/${slug}/listings?offset=${offset}&limit=${limit}&sortKey=eventTimestamp&sortDirection=desc`
  );

  return {
    data: response.data,
    addItems: offset > 0,
  };
});

// Get collection sales
export const getCollectionSales = createAsyncThunk('collection/getCollectionSales', async (data) => {
  data = data || {};
  const { offset = 0, limit = 10 } = data;

  const response = await axios.get(
    `${process.env.REACT_APP_BASE_URL}/collections/${data.slug}/sales?offset=${
      offset || 0
    }&limit=${limit}&sortKey=eventTimestamp&sortDirection=desc`
  );

  return {
    data: response.data,
    addItems: offset > 0,
  };
});

const collectionSlice = createSlice({
  name: 'collection',
  initialState,
  reducers: {
    updateCollectionWatchlistStatus: (state, action) => {
      const { slug, watchlistStatus } = action.payload;
      const collections = state.collectionData || [];

      const collection = collections.find((c) => c.slug === slug);

      if (collection) {
        collection.addedToWatchlist = watchlistStatus;
      }
    },
    setSearchValue: (state, action) => {
      state.searchValue = action.payload;
    },
    setMode: (state, action) => {
      state.mode = action.payload;
    },
    setCurrency: (state, action) => {
      state.currency = action.payload;
    },
    clearCollectionData: (state) => {
      state.collectionData = [];
    },
    clearCollectionListings: (state) => {
      state.collectionListings = null;
    },
    clearCollectionSales: (state) => {
      state.collectionSales = null;
    },
    setTimeRange: (state, action) => {
      state.timeRange = action.payload;
    },
    setSortKey: (state, action) => {
      if (state.sortKey === action.payload) {
        // state.sortDirection = state.sortDirection === 'asc' ? 'desc' : 'asc';
        state.sortDirection = 'desc';
      } else {
        state.sortKey = action.payload;
        state.sortDirection = 'desc';
      }
    },
  },

  // Handlers for the async thunks
  extraReducers: {
    // Get a list of collections
    [getCollections.pending]: (state) => {
      state.collectionDataStatus = 'loading';
    },
    [getCollections.fulfilled]: (state, action) => {
      const { data, addItems } = action.payload;

      if (addItems) {
        state.collectionData = [...state.collectionData, ...data.result.docs];
      } else {
        state.collectionData = [...data.result.docs];
      }

      state.collectionDataStatus = 'success';
    },
    [getCollections.rejected]: (state) => {
      state.collectionDataStatus = 'failed';
      state.collectionData = [];
    },

    // Get collection details data
    [getCollectionDetails.pending]: (state) => {
      state.collectionDetailsStatus = 'loading';
      state.loadingStatus = true;
    },
    [getCollectionDetails.fulfilled]: (state, action) => {
      const { result } = action.payload;

      state.collectionDetailsData = result;
      state.collectionDetailsStatus = 'success';
      state.loadingStatus = false;
    },
    [getCollectionDetails.rejected]: (state) => {
      state.collectionDetailsStatus = 'failed';
      state.loadingStatus = false;
    },

    // Get collection notes
    [getCollectionNotes.pending]: (state) => {
      state.collectionNotes = [];
    },
    [getCollectionNotes.fulfilled]: (state, action) => {
      const { result } = action.payload;

      state.collectionNotes = result && result.docs ? result.docs : [];
    },
    [getCollectionNotes.rejected]: (state) => {
      state.collectionNotes = [];
    },

    // Get the collection listings
    [getCollectionListings.fulfilled]: (state, action) => {
      const { data, addItems } = action.payload;

      if (addItems) {
        state.collectionListings = [...state.collectionListings, ...data.result.docs];
      } else {
        state.collectionListings = [...data.result.docs];
      }
    },

    // Get the collection sales
    [getCollectionSales.fulfilled]: (state, action) => {
      const { data, addItems } = action.payload;

      if (addItems) {
        state.collectionSales = [...state.collectionSales, ...data.result.docs];
      } else {
        state.collectionSales = [...data.result.docs];
      }
    },

    // Get collection watchlist
    [getCollectionWatchlist.pending]: (state) => {
      state.collectionWatchlist = [];
    },
    [getCollectionWatchlist.fulfilled]: (state, action) => {
      const { result } = action.payload;

      state.collectionWatchlist = result && result.docs ? result.docs : [];
    },
    [getCollectionWatchlist.rejected]: (state) => {
      state.collectionWatchlist = [];
    },
  },
});

export const {
  clearCollectionListings,
  clearCollectionSales,
  setCurrency,
  setMode,
  setSearchValue,
  clearCollectionData,
  setTimeRange,
  setSortKey,
  updateCollectionWatchlistStatus,
} = collectionSlice.actions;

export default collectionSlice.reducer;
