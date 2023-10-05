import { configureStore } from '@reduxjs/toolkit';
import collectionReducer from './slices/collection';
import marketSummaryReducer from './slices/market-summary';
import userReducer from './slices/user';
import contactUsReducer from './slices/contact-us';

export default configureStore({
  reducer: {
    collection: collectionReducer,
    marketSummary: marketSummaryReducer,
    user: userReducer,
    contact: contactUsReducer,
  },
});
