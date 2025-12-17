import { rootApi } from "@/services/rootApi";
import {
  type Campus,
  type Category,
  type Claim,
  type FoundItem,
  type LostItem,
  type TemporaryFoundItem,
  type SystemReport,
  type Campus,
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
        // API trả về categoryId (lowercase), cần transform sang categoryID (uppercase)
        return response.map((category) => ({
          categoryID: category.categoryId,
          categoryName: category.categoryName,
        }));
      },
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


    // Admin: Get system reports
    getSystemReports: build.query<SystemReport, void>({
      queryFn: async () => {
        // Mock data
        const mock: SystemReport = {
          totalLostItems: 45,
          totalFoundItems: 78,
          itemsInStorage: 32,
          itemsReturned: 28,
          itemsClaimed: 12,
          itemsOpen: 6,
          campusStats: [
            {
              campusID: 1,
              campusName: "HCM - NVH Sinh Viên",
              totalLostItems: 25,
              totalFoundItems: 42,
              itemsInStorage: 18,
              itemsReturned: 16,
            },
            {
              campusID: 2,
              campusName: "HCM - SHTP (Q9)",
              totalLostItems: 20,
              totalFoundItems: 36,
              itemsInStorage: 14,
              itemsReturned: 12,
            },
          ],
        };
        return { data: mock };
      },
    }),

    // Admin: Get all campuses
    getCampuses: build.query<Campus[], void>({
      query: () => ({
        url: "/Campus",
        method: "GET",
      }),
      transformResponse: (response: any[]) => {
        // API trả về campusId (lowercase), cần transform sang campusID (uppercase)
        return response.map((campus) => ({
          campusID: campus.campusId,
          campusName: campus.campusName,
          address: campus.address,
          storageLocation: campus.storageLocation,
        }));
      },
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
      campusId: number;
      status: string;
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
  useCreateTemporaryFoundItemMutation,
  useGetSecurityTemporaryItemsQuery,
  useUpdateSecurityItemStatusMutation,
  useGetLostItemsForVerificationQuery,
  useVerifyLostItemMutation,
  useGetSystemReportsQuery,
  useGetCampusesQuery,
  useCreateCampusMutation,
  useUpdateCampusMutation,
  useDeleteCampusMutation,
  useGetAdminUsersQuery,
  useAssignUserMutation,
  useCreateUserMutation,
  useUpdateUserMutation,
  useBanUserMutation,
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
