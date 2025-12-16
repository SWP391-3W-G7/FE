import { rootApi } from "@/services/rootApi";
import {
  type Campus,
  type Category,
  type Claim,
  type FoundItem,
  type LostItem,
  type StaffReport,
} from "@/types";

export const itemApi = rootApi.injectEndpoints({
  endpoints: (build) => ({
    // got it
    getCategories: build.query<Category[], void>({
      query: () => ({
        url: "/categories",
        method: "GET",
      }),
    }),
    // got it
    getCampuses: build.query<Campus[], void>({
      query: () => ({
        url: "/Campus/enum-values",
        method: "GET",
      }),
    }),

    createLostItem: build.mutation<LostItem, FormData>({
      query: (formData) => ({
        url: "/lost-items",
        method: "POST",
        data: formData,
      }),
    }),

    createFoundItem: build.mutation<FoundItem, FormData>({
      query: (formData) => ({
        url: "/items/found",
        method: "POST",
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }),
    }),

    // got it
    getFoundItems: build.query<
      FoundItem[],
      {
        campusId?: string;
        status?: string;
      }
    >({
      query: (params) => ({
        url: "/found-items",
        method: "GET",
        params: params,
      }),
    }),

    /// got it
    getFoundItemById: build.query<FoundItem, string>({
      query: (id) => ({
        url: `/found-items/${id}/user-details`,
        method: "GET",
      }),
    }),

    createClaim: build.mutation({
      query: (formData) => ({
        url: "/claims",
        method: "POST",
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }),
    }),
    //got it
    getMyLostItems: build.query<LostItem[], void>({
      query: () => ({
        url: "/lost-items",
        method: "GET",
      }),
    }),
    // got it
    getMyFoundItems: build.query<FoundItem[], void>({
      query: () => ({
        url: "/found-items/my-found-items",
        method: "GET",
      }),
    }),

    // got it
    getMyClaims: build.query<Claim[], void>({
      query: () => ({
        url: "/claim-requests/my-claims",
        method: "GET",
      }),
    }),

    // got it
    getIncomingItems: build.query<FoundItem[], void>({
      query: () => ({
        url: "/found-items",
        method: "GET",
      }),
      providesTags: ["IncomingItems"],
    }),
    // got it
    updateItemStatus: build.mutation<void, { id: number; status: string }>({
      query: ({ id, status }) => ({
        url: `/found-items/${id}/status`,
        method: "PUT",
        data: { status },
      }),
      invalidatesTags: ["StatusItems"],
    }),
    //got it
    getPendingClaims: build.query<Claim[], void>({
      query: () => ({
        url: "claim-requests?status=Pending",
        method: "GET",
      }),
      providesTags: ["Claims"],
    }),

    // [STAFF] Xử lý duyệt/từ chối
    verifyClaim: build.mutation<
      void,
      { claimId: number; status: "Approved" | "Rejected"; reason?: string }
    >({
      query: ({ claimId, status, reason }) => ({
        url: `/staff/claims/${claimId}/verify`,
        method: "POST",
        body: { status, reason },
      }),
      invalidatesTags: ["Claims"],
    }),
    // got it
    getReadyToReturnItems: build.query<Claim[], void>({
     query: () => ({
        url: "claim-requests?status=Approved",
        method: "GET",
      }),
      providesTags: ["Claims"],
    }),

    // got it
    getInventoryItems: build.query<FoundItem[], void>({
       query: () => ({
        url: "/found-items",
        method: "GET",
      }),
      providesTags: ["InventoryItems"],
    }),

    requestMoreInfo: build.mutation<void, { claimId: number; title: string; description: string; images: string[] }>(
      {
        query: ({ claimId, title, description, images }) => ({
          url: `/claim-requests/${claimId}/evidence`,
          method: "POST",
          body: { title, description, images },
        }),
        invalidatesTags: ["Claims"],
      }
    ),
    // got it
    getAllLostItems: build.query<LostItem[], void>({
      query: () => ({
        url: "/lost-items",
        method: "GET",
      }),
    }),

    // got it
    getStaffStats: build.query<StaffReport, void>({
      query: () => ({
        url: "reports/dashboard",
        method: "GET",
      }),
    }),

    resolveDispute: build.mutation<
      void,
      { winnerClaimId: number; itemId: number }
    >({
      query: ({ winnerClaimId, itemId }) => ({
        url: `/staff/claims/resolve-dispute`,
        method: "POST",
        body: { winnerClaimId, itemId },
      }),
      invalidatesTags: ["Disputes", "Claims", "ReadyItems"],
    }),

    // got it
    getDisputedItems: build.query<FoundItem[], void>({
      query: () => ({
        url: `/found-items`,
        method: "GET",
      }),
      providesTags: ["Disputes"],
    }),
  }),
});

export const {
  useGetCategoriesQuery,
  useGetCampusesQuery,
  useCreateLostItemMutation,
  useCreateFoundItemMutation,
  useGetFoundItemsQuery,
  useGetFoundItemByIdQuery,
  useUpdateItemStatusMutation,
  useCreateClaimMutation,
  useGetMyLostItemsQuery,
  useGetMyFoundItemsQuery,
  useGetMyClaimsQuery,
  useGetIncomingItemsQuery,
  useGetPendingClaimsQuery,
  useVerifyClaimMutation,
  useGetReadyToReturnItemsQuery,
  useGetInventoryItemsQuery,
  useRequestMoreInfoMutation,
  useGetAllLostItemsQuery,
  useGetStaffStatsQuery,
  useResolveDisputeMutation,
  useGetDisputedItemsQuery,
} = itemApi;
