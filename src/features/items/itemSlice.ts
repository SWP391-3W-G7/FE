import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { type RootState } from '@/store';

export type FilterType = 'ALL' | 'LOST' | 'FOUND';
export type FilterStatus = 'ALL' | 'PENDING' | 'VERIFIED' | 'RETURNED' | 'REJECTED';
export type ViewMode = 'grid' | 'list';

export interface ItemFilters {
  searchTerm: string;
  campusId: string | 'ALL';
  type: FilterType;
  status: FilterStatus;
  dateRange?: { from: string; to: string } | null;
}

interface ItemUiState {
  filters: ItemFilters;
  viewMode: ViewMode;
}

const initialState: ItemUiState = {
  filters: {
    searchTerm: '',
    campusId: 'ALL',
    type: 'ALL',
    status: 'ALL',
    dateRange: null,
  },
  viewMode: 'grid',
};

const itemSlice = createSlice({
  name: 'itemsUi',
  initialState,
  reducers: {
    setFilter: (state, action: PayloadAction<Partial<ItemFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },
    toggleViewMode: (state) => {
      state.viewMode = state.viewMode === 'grid' ? 'list' : 'grid';
    },
    setViewMode: (state, action: PayloadAction<ViewMode>) => {
      state.viewMode = action.payload;
    }
  },
});

export const { setFilter, resetFilters, toggleViewMode, setViewMode } = itemSlice.actions;

export const selectItemFilters = (state: RootState): ItemFilters => state.itemsUi.filters;
export const selectItemViewMode = (state: RootState): ViewMode => state.itemsUi.viewMode;

export default itemSlice.reducer;