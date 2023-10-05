import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { toast } from 'react-toastify';

const initialState = {
  contactUsData: null,
  contactUsStatus: 'idle',
};

export const contactUs = createAsyncThunk('contact/contactUs', async (data) => {
  const response = await axios.post(`${process.env.REACT_APP_BASE_URL}/contact`, data);

  return response.data;
});

const contactUsSlice = createSlice({
  name: 'contactUsSlice',
  initialState,
  reducers: {},
  extraReducers: {
    [contactUs.pending]: (state) => {
      state.contactUsStatus = 'loading';
    },
    [contactUs.fulfilled]: (state, action) => {
      if (action.payload?.message === 'Success') {
        state.contactUsData = action.payload;
        state.contactUsStatus = true;
        toast("Contact Send Successfully , We'll back to you shortly");
      } else {
        toast('Something wend wrong');
      }
    },
  },
});

export default contactUsSlice.reducer;
