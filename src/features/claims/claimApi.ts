import { rootApi } from "@/services/rootApi";
import { type Claim, type StaffWorkItems, type PaginatedResponse, type MatchedItem } from "@/types";

export const claimApi = rootApi.injectEndpoints({
    endpoints: (build) => ({
        getStaffWorkItems: build.query<StaffWorkItems, { pageNumber?: number; pageSize?: number } | void>({
            query: (params) => ({
                url: "/staff/work-items",
                method: "GET",
                params: params || { pageNumber: 0, pageSize: 15 },
            }),
            providesTags: ["Claims"],
        }),
        getClaimById: build.query<Claim, number>({
            query: (id) => ({
                url: `/claim-requests/${id}`,
                method: "GET",
            }),
            providesTags: (_result, _error, id) => [{ type: "Claims", id }],
        }),
        getPendingClaims: build.query<PaginatedResponse<Claim>, { pageNumber?: number; pageSize?: number } | void>({
            query: (params) => ({
                url: "/claim-requests",
                method: "GET",
                params: { ...params, status: "Pending" },
            }),
            providesTags: ["Claims"],
        }),
        getConflictedClaims: build.query<PaginatedResponse<Claim>, { pageNumber?: number; pageSize?: number } | void>({
            query: (params) => ({
                url: "/claim-requests",
                method: "GET",
                params: { ...params, status: "Conflicted" },
            }),
            providesTags: ["Claims"],
        }),

        // Get Approved claims for Return page - Claims sub-tab
        getApprovedClaims: build.query<PaginatedResponse<Claim>, { pageNumber?: number; pageSize?: number } | void>({
            query: (params) => ({
                url: "/claim-requests",
                method: "GET",
                params: {
                    status: "Approved",
                    PageNumber: params?.pageNumber || 1,
                    PageSize: params?.pageSize || 10
                },
            }),
            providesTags: ["Claims"],
        }),

        createClaim: build.mutation<any, FormData>({
            query: (formData) => ({
                url: "/claim-requests",
                method: "POST",
                data: formData,
                // Don't set Content-Type - let axios set it with boundary
            }),
            invalidatesTags: ["Claims"],
        }),

        getMyClaims: build.query<Claim[], void>({
            query: () => ({
                url: "/claim-requests/my-claims",
                method: "GET",
            }),
            providesTags: ["Claims"],
        }),

        // Lấy danh sách matches đã approved - sẵn sàng trả đồ
        getApprovedMatches: build.query<PaginatedResponse<MatchedItem>, void>({
            query: () => ({
                url: "/Matching/approved",
                method: "GET",
            }),
            providesTags: ["Claims"],
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

        updateClaimStatus: build.mutation<
            Claim,
            { claimId: number; status: "Approved" | "Rejected" | "Returned" }
        >({
            query: ({ claimId, status }) => ({
                url: `/claim-requests/${claimId}/status`,
                method: "PATCH",
                params: { status },
            }),
            invalidatesTags: ["Claims"],
        }),
        getMatchById: build.query<any, number>({
            query: (id) => ({
                url: `/Matching/${id}`,
                method: "GET",
            }),
            providesTags: (_result, _error, id) => [{ type: "Claims", id: `MATCH-${id}` }],
        }),
        getMatchingItems: build.query<PaginatedResponse<MatchedItem>, { pageNumber?: number; pageSize?: number } | void>({
            query: (params) => ({
                url: "/Matching/pending",
                method: "GET",
                params: {
                    PageNumber: params?.pageNumber || 1,
                    PageSize: params?.pageSize || 10,
                },
            }),
            providesTags: ["Claims"],
        }),

        // Confirm matching (approve) - Duyệt
        confirmMatch: build.mutation<void, number>({
            query: (matchId) => ({
                url: `/Matching/${matchId}/confirm`,
                method: "PUT",
            }),
            invalidatesTags: ["Claims"],
        }),

        // Dismiss matching (reject) - Từ chối
        dismissMatch: build.mutation<void, number>({
            query: (matchId) => ({
                url: `/Matching/${matchId}/dismiss`,
                method: "PUT",
            }),
            invalidatesTags: ["Claims"],
        }),

        // Return item - Đánh dấu đã trả đồ
        returnMatch: build.mutation<void, number>({
            query: (matchId) => ({
                url: `/Matching/${matchId}/return`,
                method: "PUT",
            }),
            invalidatesTags: ["Claims"],
        }),
    }),
});

export const {
    useGetStaffWorkItemsQuery,
    useGetClaimByIdQuery,
    useGetPendingClaimsQuery,
    useGetConflictedClaimsQuery,
    useGetApprovedClaimsQuery,
    useCreateClaimMutation,
    useGetMyClaimsQuery,
    useGetApprovedMatchesQuery,
    useRequestMoreInfoMutation,
    useVerifyClaimMutation,
    useUpdateClaimStatusMutation,
    useGetMatchByIdQuery,
    useGetMatchingItemsQuery,
    useConfirmMatchMutation,
    useDismissMatchMutation,
    useReturnMatchMutation,
} = claimApi;
