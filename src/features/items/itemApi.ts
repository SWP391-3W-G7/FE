import { rootApi } from "@/services/rootApi";
import {
  type Campus,
  type Category,
  type FoundItem,
  type LostItem,
  type TemporaryFoundItem,
  type SystemReport,
  type CreateCampusRequest,
  type UserRole,
  type AdminUser,
  type AssignUserRequest,
  type StaffReport,
  type PaginatedResponse,
} from "@/types";

export const itemApi = rootApi.injectEndpoints({
  endpoints: (build) => ({
    // got it
    getCategories: build.query<Category[], void>({
      query: () => ({
        url: "/categories",
        method: "GET",
      }),
      transformResponse: (response: Array<{ id?: number; categoryId?: number; categoryID?: number; name?: string; categoryName?: string }>) => {
        return response.map((category) => ({
          categoryId: (category.id || category.categoryId || category.categoryID) as number,
          categoryName: (category.name || category.categoryName) as string,
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
      PaginatedResponse<FoundItem>,
      {
        CampusId?: number;
        Status?: string;
      }
    >({
      query: (params) => ({
        url: "/found-items",
        method: "GET",
        params: params,
      }),
      transformResponse: (response: PaginatedResponse<FoundItem>) => {
        // API trả về paginated response
        return response;
      },
    }),

    /// got it
    getFoundItemById: build.query<FoundItem, string>({
      query: (id) => ({
        url: `/found-items/${id}/user-details`,
        method: "GET",
      }),
    }),
    getLostItemById: build.query<LostItem, string | number>({
      query: (id) => ({
        url: `/lost-items/${id}`,
        method: "GET",
      }),
    }),
    getFoundItemDetails: build.query<FoundItem, number>({
      query: (id) => ({
        url: `/found-items/${id}/details`,
        method: "GET",
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
    getIncomingItems: build.query<
      PaginatedResponse<FoundItem>,
      { Status?: string; PageNumber?: number; PageSize?: number; CampusId?: number } | void
    >({
      query: (params) => ({
        url: "/found-items",
        method: "GET",
        params: params || { Status: 'Open', PageNumber: 1, PageSize: 20 }
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

    // Staff: Request dropoff notification
    requestDropoff: build.mutation<void, { id: number; note: string }>({
      query: ({ id, note }) => ({
        url: `/staff/found-items/${id}/request-dropoff`,
        method: "POST",
        data: { note },
      }),
    }),



    // got it
    getInventoryItems: build.query<
      PaginatedResponse<FoundItem>,
      { Status?: string; PageNumber?: number; PageSize?: number; CampusId?: number } | void
    >({
      query: (params) => ({
        url: "/found-items",
        method: "GET",
        params: params || { Status: 'Stored', PageNumber: 1, PageSize: 20 }
      }),
      providesTags: ["InventoryItems"],
    }),

    // got it
    getAllLostItems: build.query<LostItem[], void>({
      query: () => ({
        url: "/lost-items",
        method: "GET",
      }),
    }),

    // got it
    getStaffStats: build.query<StaffReport, { campusId?: number } | void>({
      query: (params) => ({
        url: "/reports/dashboard",
        method: "GET",
        params: params || undefined,
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

    // Get disputed/conflicted items - redirects to claim-requests API
    getDisputedItems: build.query<PaginatedResponse<{ claimId: number; foundItemId: number; foundItemTitle: string | null; claimDate: string; evidences: unknown[]; studentName: string | null; studentId: number }>, { pageNumber?: number; pageSize?: number } | void>({
      query: (params) => ({
        url: `/claim-requests`,
        method: "GET",
        params: { ...params, status: "Conflicted" },
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
      transformResponse: (response: Array<Record<string, unknown>>) => {
        // API trả về foundItemId, categoryId, imageUrls
        return response.map((item) => ({
          foundItemId: item.foundItemId as number,
          title: item.title as string,
          description: (item.description || "") as string,
          foundDate: item.foundDate as string,
          foundLocation: item.foundLocation as string,
          status: item.status as "Open",
          campusId: 0,
          campusName: (item.campusName || "") as string,
          categoryId: (item.categoryId || 0) as number,
          categoryName: (item.categoryName || "") as string,
          imageUrls: (item.imageUrls || []) as string[],
          createdBy: (item.createdBy || 0) as number,
          storedBy: (item.storedBy || null) as number | null,
          claimRequests: [],
          actionLogs: null,
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
            lostItemId: 1,
            title: "Laptop Macbook Air M1",
            lostDate: "2023-10-20T10:00:00",
            lostLocation: "Thư viện",
            status: "Open",
            campusId: 1,
            campusName: "Campus 1",
            description: "Màu xám, có dán sticker",
            categoryId: 3,
            categoryName: "Laptop",
            imageUrls: [],
            actionLogs: null,
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


    // Admin: Get system reports
    getSystemReports: build.query<SystemReport, { campusId?: number } | void>({
      query: (params) => ({
        url: "/reports/dashboard",
        method: "GET",
        params: params || undefined,
      }),
      providesTags: ["SystemReports"],
    }),
    // Admin: Get all campuses
    getCampusesForAdmin: build.query<Campus[], void>({
      query: () => ({
        url: "/Campus",
        method: "GET",
      })
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
    getAdminUsers: build.query<AdminUser[], { role?: string; campusId?: string } | void>({
      query: (params) => {
        // Map role string to roleId number
        let roleId: number | undefined;
        if (params?.role === 'STAFF') roleId = 2;
        else if (params?.role === 'SECURITY') roleId = 3;

        return {
          url: "/admin/get-users-by-role",
          method: "GET",
          params: {
            roleId: roleId, // Nếu undefined thì get all
          },
        };
      },
      transformResponse: (response: Array<Record<string, unknown>>) => {
        // Transform API response to AdminUser format
        const transformed = response.map((user) => {
          // Normalize role name
          let role = 'USER';
          const roleName = (user.roleName as string | undefined)?.toLowerCase() || '';
          if (roleName.includes('staff')) role = 'STAFF';
          else if (roleName.includes('security')) role = 'SECURITY';
          else if (roleName.includes('admin')) role = 'ADMIN';
          else if (roleName.includes('user') || roleName.includes('student')) role = 'USER';

          const transformed: AdminUser = {
            userId: user.userId as number,
            id: (user.userId as number)?.toString(),
            email: user.email as string,
            fullName: user.fullName as string,
            role: role as UserRole,
            campusId: Number(user.campusId) || 0,
            campusName: (user.campusName as string) || '',
            isActive: user.status === 'Active',
            phone: user.phoneNumber as string | undefined,
          };

          return transformed;
        });

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
    createUser: build.mutation<void, {
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
    updateUser: build.mutation<void, {
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
    banUser: build.mutation<void, { id: number; isBan: boolean }>({
      query: ({ id, isBan }) => ({
        url: `/admin/users/${id}/ban-status`,
        method: "PATCH",
        params: { isBan },
      }),
    }),

    // Admin: Get user detail
    getUserDetail: build.query<AdminUser, number>({
      query: (id) => ({
        url: `/admin/users/${id}`,
        method: "GET",
      }),
    }),

    // Admin: Update campus
    updateCampus: build.mutation<Campus, {
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
    deleteCampus: build.mutation<void, number>({
      query: (id) => ({
        url: `/Campus/${id}`,
        method: "DELETE",
      }),
    }),

    // Admin: Get pending users
    getPendingUsers: build.query<Array<{ userId: number; username: string; email: string; fullName: string; roleId: number; status: string; campusId: number; phoneNumber: string; roleName: string; campusName: string; studentIdCardUrl: string }>, void>({
      query: () => ({
        url: "/admin/users/pending",
        method: "GET",
      }),
      transformResponse: (response: Array<Record<string, unknown>>) => {
        return response.map((user) => ({
          userId: (user.userID || user.userId) as number,
          username: user.username as string,
          email: user.email as string,
          fullName: user.fullName as string,
          roleId: (user.roleId || user.roleID) as number,
          status: user.status as string,
          campusId: (user.campusId || user.campusID) as number,
          phoneNumber: user.phoneNumber as string,
          roleName: user.roleName as string,
          campusName: user.campusName as string,
          studentIdCardUrl: user.studentIdCardUrl as string,
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
      transformResponse: (response: { count?: number }) => {
        return response?.count || 0;
      },
    }),

    getFoundItemsMonthly: build.query<Array<{ month: string; name: string; count: number }>, void>({
      query: () => ({
        url: "/admin/dashboard/found-items-monthly",
        method: "GET",
      }),
      transformResponse: (response: { data?: number[] }) => {
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

    getTopContributor: build.query<Array<{ userId: number; userName: string; fullName: string; email: string; count: number; itemCount: number }>, void>({
      query: () => ({
        url: "/admin/dashboard/top-contributor",
        method: "GET",
      }),
      transformResponse: (response: { data?: { userId: number; fullName: string; email: string; totalFoundItems: number } }) => {
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

    getCampusMostLostItems: build.query<Array<{ campusId: number; campusName: string; count: number; lostItemCount: number }>, void>({
      query: () => ({
        url: "/admin/dashboard/campus-most-lost-items",
        method: "GET",
      }),
      transformResponse: (response: { data?: { campusId: number; campusName: string; totalLostItems: number } }) => {
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

    getUserMostLostItems: build.query<Array<{ userId: number; userName: string; fullName: string; email: string; count: number; lostItemCount: number }>, void>({
      query: () => ({
        url: "/admin/dashboard/user-most-lost-items",
        method: "GET",
      }),
      transformResponse: (response: { data?: { userId: number; fullName: string; email: string; totalLostItems: number } }) => {
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

    getLostItemsStatusStats: build.query<Array<{ status: string; count: number }>, void>({
      query: () => ({
        url: "/admin/dashboard/lost-items-status-stats",
        method: "GET",
      }),
      transformResponse: (response: { data?: { totalLost: number; totalMatched: number; totalReturned: number } }) => {
        const data = response?.data;
        if (!data) return [];
        
        return [
          { status: 'Lost', count: data.totalLost || 0 },
          { status: 'Matched', count: data.totalMatched || 0 },
          { status: 'Returned', count: data.totalReturned || 0 },
        ];
      },
    }),

    getFoundItemsStatusStats: build.query<Array<{ status: string; count: number }>, void>({
      query: () => ({
        url: "/admin/dashboard/found-items-status-stats",
        method: "GET",
      }),
      transformResponse: (response: { data?: { totalOpen: number; totalStored: number; totalClaimed: number; totalReturned: number; totalClosed: number } }) => {
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

    getClaimStatusStats: build.query<Array<{ status: string; count: number }>, void>({
      query: () => ({
        url: "/admin/dashboard/claim-status-stats",
        method: "GET",
      }),
      transformResponse: (response: { data?: { totalPending: number; totalApproved: number; totalRejected: number; totalReturned: number; totalConflicted: number } }) => {
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
  useGetFoundItemDetailsQuery,
  useUpdateItemStatusMutation,
  useRequestDropoffMutation,
  useGetMyLostItemsQuery,
  useUpdateLostItemMutation,
  useDeleteLostItemMutation,
  useUpdateFoundItemMutation,
  useDeleteFoundItemMutation,
  useGetMyFoundItemsQuery,
  useCreateTemporaryFoundItemMutation,
  useGetSecurityTemporaryItemsQuery,
  useUpdateSecurityItemStatusMutation,
  useGetLostItemsForVerificationQuery,
  useVerifyLostItemMutation,
  useGetSystemReportsQuery,
  useGetLostItemByIdQuery,
  useGetCampusesForAdminQuery,
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
  useGetInventoryItemsQuery,
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
