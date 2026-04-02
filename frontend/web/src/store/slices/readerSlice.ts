'use client';

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type ReadingMode = 'vertical' | 'horizontal';
type ImageFit = 'width' | 'height' | 'original';

interface CurrentChapter {
  number: number;
  title: string;
  slug: string;
}

interface ReaderState {
  readingMode: ReadingMode;
  imageFit: ImageFit;
  currentChapter: CurrentChapter | null;
}

const initialState: ReaderState = {
  readingMode: 'vertical',
  imageFit: 'width',
  currentChapter: null,
};

const readerSlice = createSlice({
  name: 'reader',
  initialState,
  reducers: {
    setReadingMode(state, action: PayloadAction<ReadingMode>) {
      state.readingMode = action.payload;
    },
    setImageFit(state, action: PayloadAction<ImageFit>) {
      state.imageFit = action.payload;
    },
    setCurrentChapter(state, action: PayloadAction<CurrentChapter | null>) {
      state.currentChapter = action.payload;
    },
  },
});

export const { setReadingMode, setImageFit, setCurrentChapter } = readerSlice.actions;
export default readerSlice.reducer;
