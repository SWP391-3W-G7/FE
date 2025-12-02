import { rootApi } from '@/store/rootApi';
import { type LostItem } from '@/types';

interface GetItemsParams {
  campusId?: string;
  type?: 'LOST' | 'FOUND';
  status?: string;
}

const itemApi = rootApi.injectEndpoints({
  endpoints: (build) => ({
    getItems: build.query<LostItem[], GetItemsParams>({
      query: (params) => ({
        url: '/items',
        method: 'GET',
        params,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Items' as const, id })),
              { type: 'Items', id: 'LIST' },
            ]
          : [{ type: 'Items', id: 'LIST' }],
    }),

    reportItem: build.mutation<LostItem, FormData>({
      query: (formData) => ({
        url: '/items',
        method: 'POST',
        data: formData,
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
      invalidatesTags: [{ type: 'Items', id: 'LIST' }],
    }),

    updateItemStatus: build.mutation<LostItem, { id: string; status: string }>({
      query: ({ id, status }) => ({
        url: `/items/${id}/status`,
        method: 'PATCH',
        data: { status },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Items', id }],
    }),
  }),
});

export const { 
  useGetItemsQuery, 
  useReportItemMutation, 
  useUpdateItemStatusMutation 
} = itemApi;