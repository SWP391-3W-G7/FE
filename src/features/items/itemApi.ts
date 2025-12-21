import { rootApi } from "@/services/rootApi";
import {
  type Campus,
  type Category,
  type Claim,
  type FoundItem,
  type LostItem,
  type TemporaryFoundItem,
  type SystemReport,
  type CreateCampusRequest,
  type AdminUser,
  type AssignUserRequest,
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
      transformResponse: (response: any[]) => {
        return response.map((category) => ({
          categoryId: category.id || category.categoryId || category.categoryID,
          categoryName: category.name || category.categoryName,
        }));
      },
    }),
    // got it
    getCampuses: build.query<Campus[], void>({
      query: () => ({
        url: "/Campus",
        method: "GET",
      }),
    }),
    //got it 
    createLostItem: build.mutation<LostItem, FormData>({
      query: (formData) => ({
        url: "/lost-items",
        method: "POST",
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }),
    }),
    // got it
    createFoundItem: build.mutation<FoundItem, FormData>({
      query: (formData) => ({
        url: "/found-items/public",
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
        url: "/claim-requests",
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
      providesTags: ["MyLostItems"],
    }),

    // Update lost item (only if status = Open)
    updateLostItem: build.mutation<LostItem, { id: number; formData: FormData }>({
      query: ({ id, formData }) => ({
        url: `/lost-items/${id}`,
        method: "PUT",
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }),
      invalidatesTags: ["MyLostItems"],
    }),

    // Delete lost item (only if status = Open)
    deleteLostItem: build.mutation<void, number>({
      query: (id) => ({
        url: `/lost-items/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["MyLostItems"],
    }),

    // Update found item (only if status = Open)
    updateFoundItem: build.mutation<FoundItem, { id: number; formData: FormData }>({
      query: ({ id, formData }) => ({
        url: `/found-items/${id}`,
        method: "PUT",
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }),
      invalidatesTags: ["MyFoundItems"],
    }),

    // Delete found item (only if status = Open)
    deleteFoundItem: build.mutation<void, number>({
      query: (id) => ({
        url: `/found-items/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["MyFoundItems"],
    }),
    // got it
    getMyFoundItems: build.query<FoundItem[], void>({
      query: () => ({
        url: "/found-items/my-found-items",
        method: "GET",
      }),
      providesTags: ["MyFoundItems"],
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
      invalidatesTags: ["StatusItems", "IncomingItems", "InventoryItems"],
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

    // Security: Create temporary found item record (Status = Open)
    createTemporaryFoundItem: build.mutation<TemporaryFoundItem, FormData>({
      query: (formData) => ({
        url: "/found-items/public",
        method: "POST",
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }),
    }),


    // Security: Get temporary found items (Status = Open)
    getSecurityTemporaryItems: build.query<
      TemporaryFoundItem[],
      { campusId?: string }
    >({
      query: () => ({
        url: "/security/my-open-found-items",
        method: "GET",
      }),
      transformResponse: (response: any[]) => {
        // API trả về foundItemId, categoryId, imageUrls
        return response.map((item) => ({
          foundItemID: item.foundItemId,
          title: item.title,
          description: item.description || "",
          foundDate: item.foundDate,
          foundLocation: item.foundLocation,
          status: item.status,
          campusID: 0,
          categoryID: item.categoryId || 0,
          categoryName: item.categoryName || "",
          imageUrl: item.imageUrls && item.imageUrls.length > 0 ? item.imageUrls[0] : null,
          finderName: "",
          finderContact: "",
          transferredToStaff: false,
        }));
      },
    }),

    // Security: Mark item as returned
    updateSecurityItemStatus: build.mutation<
      TemporaryFoundItem,
      { foundItemId: number }
    >({
      query: ({ foundItemId }) => ({
        url: `/security/found-items/${foundItemId}/return`,
        method: "PUT",
      }),
    }),

    // Security: Get lost items for verification (campus-based)
    getLostItemsForVerification: build.query<
      LostItem[],
      { campusId?: string; keyword?: string }
    >({
      queryFn: async () => {
        // Mock data - Lost items that Security can verify
        const mock: LostItem[] = [
          {
            lostItemID: 1,
            title: "Laptop Macbook Air M1",
            lostDate: "2023-10-20T10:00:00",
            lostLocation: "Thư viện",
            status: "Open",
            campusID: 1,
            description: "Màu xám, có dán sticker",
            categoryID: 3,
            createdBy: 123,
          },
        ];
        return { data: mock };
      },
    }),

    // Security: Verify lost item location/time
    verifyLostItem: build.mutation<
      LostItem,
      { lostItemId: string; verified: boolean; notes?: string }
    >({
      query: ({ lostItemId, verified, notes }) => ({
        url: `/security/lost-items/${lostItemId}/verify`,
        method: "POST",
        data: { verified, notes },
      }),
    }),


    // Admin: Get system reports (dashboard stats)
    getSystemReports: build.query<any, { campusId?: number }>({
      query: ({ campusId }) => ({
        url: "/reports/dashboard",
        method: "GET",
        params: campusId ? { campusId } : undefined,
      }),
    }),

    // Admin: Create new campus
    createCampus: build.mutation<Campus, CreateCampusRequest>({
      query: (data) => ({
        url: "/admin/campuses",
        method: "POST",
        data,
      }),
    }),

    // Admin: Get all users (for assignment)
    getAdminUsers: build.query<AdminUser[], { role?: string; campusId?: string }>({
      query: ({ role, campusId }) => {
        // Map role string to roleId number
        let roleId: number | undefined;
        if (role === 'STAFF') roleId = 2;
        else if (role === 'SECURITY') roleId = 3;
        
        return {
          url: "/admin/get-users-by-role",
          method: "GET",
          params: {
            roleId: roleId, // Nếu undefined thì get all
          },
        };
      },
      transformResponse: (response: any[]) => {
        // Transform API response to AdminUser format
        console.log("Raw API response:", response);
        
        const transformed = response.map((user) => {
          // Normalize role name
          let role = 'USER';
          const roleName = user.roleName?.toLowerCase() || '';
          if (roleName.includes('staff')) role = 'STAFF';
          else if (roleName.includes('security')) role = 'SECURITY';
          else if (roleName.includes('admin')) role = 'ADMIN';
          else if (roleName.includes('user') || roleName.includes('student')) role = 'USER';
          
          const transformed = {
            id: user.userId?.toString() || user.email,
            userId: user.userId,
            email: user.email,
            fullName: user.fullName,
            role: role,
            campusId: user.campusId?.toString() || '',
            campusName: user.campusName || '',
            isActive: user.status === 'Active',
          };
          
          console.log(`User: ${user.fullName}, roleName: ${user.roleName}, normalized role: ${role}`);
          return transformed;
        });
        
        console.log("Transformed users:", transformed);
        return transformed;
      },
    }),

    // Admin: Assign user role and campus
    assignUser: build.mutation<AdminUser, AssignUserRequest>({
      query: (data) => ({
        url: "/admin/assign-role",
        method: "POST",
        data,
      }),
    }),

    // Admin: Create new user (STAFF or SECURITY)
    createUser: build.mutation<any, {
      email: string;
      fullName: string;
      phone: string;
      password: string;
      role: 'STAFF' | 'SECURITY';
      campusId: string;
    }>({
      query: (data) => ({
        url: "/admin/create-user",
        method: "POST",
        data,
      }),
    }),

    // Admin: Update user
    updateUser: build.mutation<any, {
      id: number;
      fullName: string;
      phoneNumber: string;
      roleId: number;
      campusId: number;
      isActive: boolean;
    }>({
      query: ({ id, ...data }) => ({
        url: `/admin/users/${id}`,
        method: "PUT",
        data,
      }),
    }),

    // Admin: Ban/Unban user
    banUser: build.mutation<any, { id: number; isBan: boolean }>({
      query: ({ id, isBan }) => ({
        url: `/admin/users/${id}/ban-status`,
        method: "PATCH",
        params: { isBan },
      }),
    }),

    // Admin: Get user detail
    getUserDetail: build.query<any, number>({
      query: (id) => ({
        url: `/admin/users/${id}`,
        method: "GET",
      }),
    }),

    // Admin: Update campus
    updateCampus: build.mutation<any, {
      id: number;
      campusName: string;
      address: string;
      storageLocation: string;
    }>({
      query: ({ id, ...data }) => ({
        url: `/Campus/${id}`,
        method: "PUT",
        data,
      }),
    }),

    // Admin: Delete campus
    deleteCampus: build.mutation<any, number>({
      query: (id) => ({
        url: `/Campus/${id}`,
        method: "DELETE",
      }),
    }),

    // Admin: Get pending users
    getPendingUsers: build.query<any[], void>({
      query: () => ({
        url: "/admin/users/pending",
        method: "GET",
      }),
      transformResponse: (response: any[]) => {
        return response.map((user) => ({
          userId: user.userID || user.userId,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          roleId: user.roleId || user.roleID,
          status: user.status,
          campusId: user.campusId || user.campusID,
          phoneNumber: user.phoneNumber,
          roleName: user.roleName,
          campusName: user.campusName,
          studentIdCardUrl: user.studentIdCardUrl,
        }));
      },
      providesTags: ["PendingUsers"],
    }),

    // Admin: Approve user
    approveUser: build.mutation<void, number>({
      query: (id) => ({
        url: `/admin/users/${id}/approve`,
        method: "PATCH",
      }),
      invalidatesTags: ["PendingUsers"],
    }),

    // Admin: Reject user
    rejectUser: build.mutation<void, number>({
      query: (id) => ({
        url: `/admin/users/${id}/reject`,
        method: "PATCH",
      }),
      invalidatesTags: ["PendingUsers"],
    }),

    // Admin Dashboard APIs
    getUnreturnedItemsCount: build.query<number, void>({
      query: () => ({
        url: "/admin/dashboard/unreturned-items-count",
        method: "GET",
      }),
      transformResponse: (response: any) => {
        return response?.count || 0;
      },
    }),

    getFoundItemsMonthly: build.query<any[], void>({
      query: () => ({
        url: "/admin/dashboard/found-items-monthly",
        method: "GET",
      }),
      transformResponse: (response: any) => {
        const data = response?.data;
        if (!Array.isArray(data)) return [];
        
        const months = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
        return data.map((count: number, index: number) => ({
          month: months[index],
          name: months[index],
          count: count
        }));
      },
    }),

    getTopContributor: build.query<any[], void>({
      query: () => ({
        url: "/admin/dashboard/top-contributor",
        method: "GET",
      }),
      transformResponse: (response: any) => {
        const data = response?.data;
        if (!data) return [];
        
        // API trả về single object, wrap vào array
        return [{
          userId: data.userId,
          userName: data.fullName,
          fullName: data.fullName,
          email: data.email,
          count: data.totalFoundItems || 0,
          itemCount: data.totalFoundItems || 0
        }];
      },
    }),

    getCampusMostLostItems: build.query<any[], void>({
      query: () => ({
        url: "/admin/dashboard/campus-most-lost-items",
        method: "GET",
      }),
      transformResponse: (response: any) => {
        const data = response?.data;
        if (!data) return [];
        
        // API trả về single object, wrap vào array
        return [{
          campusId: data.campusId,
          campusName: data.campusName,
          count: data.totalLostItems || 0,
          lostItemCount: data.totalLostItems || 0
        }];
      },
    }),

    getUserMostLostItems: build.query<any[], void>({
      query: () => ({
        url: "/admin/dashboard/user-most-lost-items",
        method: "GET",
      }),
      transformResponse: (response: any) => {
        const data = response?.data;
        if (!data) return [];
        
        // API trả về single object, wrap vào array
        return [{
          userId: data.userId,
          userName: data.fullName,
          fullName: data.fullName,
          email: data.email,
          count: data.totalLostItems || 0,
          lostItemCount: data.totalLostItems || 0
        }];
      },
    }),

    getLostItemsStatusStats: build.query<any[], void>({
      query: () => ({
        url: "/admin/dashboard/lost-items-status-stats",
        method: "GET",
      }),
      transformResponse: (response: any) => {
        const data = response?.data;
        if (!data) return [];
        
        return [
          { status: 'Lost', count: data.totalLost || 0 },
          { status: 'Matched', count: data.totalMatched || 0 },
          { status: 'Returned', count: data.totalReturned || 0 },
        ];
      },
    }),

    getFoundItemsStatusStats: build.query<any[], void>({
      query: () => ({
        url: "/admin/dashboard/found-items-status-stats",
        method: "GET",
      }),
      transformResponse: (response: any) => {
        const data = response?.data;
        if (!data) return [];
        
        return [
          { status: 'Open', count: data.totalOpen || 0 },
          { status: 'Stored', count: data.totalStored || 0 },
          { status: 'Claimed', count: data.totalClaimed || 0 },
          { status: 'Returned', count: data.totalReturned || 0 },
          { status: 'Closed', count: data.totalClosed || 0 },
        ];
      },
    }),

    getClaimStatusStats: build.query<any[], void>({
      query: () => ({
        url: "/admin/dashboard/claim-status-stats",
        method: "GET",
      }),
      transformResponse: (response: any) => {
        const data = response?.data;
        if (!data) return [];
        
        return [
          { status: 'Pending', count: data.totalPending || 0 },
          { status: 'Approved', count: data.totalApproved || 0 },
          { status: 'Rejected', count: data.totalRejected || 0 },
          { status: 'Returned', count: data.totalReturned || 0 },
          { status: 'Conflicted', count: data.totalConflicted || 0 },
        ];
      },
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
  useUpdateLostItemMutation,
  useDeleteLostItemMutation,
  useUpdateFoundItemMutation,
  useDeleteFoundItemMutation,
  useGetMyFoundItemsQuery,
  useGetMyClaimsQuery,
  useCreateTemporaryFoundItemMutation,
  useGetSecurityTemporaryItemsQuery,
  useUpdateSecurityItemStatusMutation,
  useGetLostItemsForVerificationQuery,
  useVerifyLostItemMutation,
  useGetSystemReportsQuery,
  useCreateCampusMutation,
  useUpdateCampusMutation,
  useDeleteCampusMutation,
  useGetAdminUsersQuery,
  useAssignUserMutation,
  useCreateUserMutation,
  useUpdateUserMutation,
  useBanUserMutation,
  useGetUserDetailQuery,
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
  useGetPendingUsersQuery,
  useApproveUserMutation,
  useRejectUserMutation,
  useGetUnreturnedItemsCountQuery,
  useGetFoundItemsMonthlyQuery,
  useGetTopContributorQuery,
  useGetCampusMostLostItemsQuery,
  useGetUserMostLostItemsQuery,
  useGetLostItemsStatusStatsQuery,
  useGetFoundItemsStatusStatsQuery,
  useGetClaimStatusStatsQuery,
} = itemApi;
