import { rootApi } from "@/services/rootApi";
import {
  type Category,
  type Claim,
  type FoundItem,
  type FoundItemDisplayDTO,
  type LostItem,
  type TemporaryFoundItem,
  type SystemReport,
  type Campus,
  type CreateCampusRequest,
  type AdminUser,
  type AssignUserRequest,
} from "@/types";

const mockFoundItems: FoundItemDisplayDTO[] = [
  {
    foundItemID: 1,
    title: "Ví da nam màu nâu (Levis)",
    description: "Ví cũ, có vết trầy xước.",
    foundDate: "2023-10-27T08:30:00",
    foundLocation: "Ghế đá sảnh chính",
    status: "Stored",
    campusID: 1,
    campusName: "HCM - NVH Sinh Viên",
    categoryID: 1,
    categoryName: "Ví/Túi xách",
    thumbnailURL:
      "https://placehold.co/400x300/5f4b32/ffffff?text=Leather+Wallet",
  },
  {
    foundItemID: 2,
    title: "Chìa khóa xe Honda Vision",
    description: "Móc khóa hình con gấu.",
    foundDate: "2023-10-27T09:15:00",
    foundLocation: "Bãi xe nhà 3",
    status: "Stored",
    campusID: 2,
    campusName: "HCM - SHTP (Q9)",
    categoryID: 4,
    categoryName: "Chìa khóa",
    thumbnailURL: "https://placehold.co/400x300/94a3b8/ffffff?text=Car+Key",
  },
  {
    foundItemID: 3,
    title: "Tai nghe AirPods 2",
    description: "Chỉ còn tai bên phải.",
    foundDate: "2023-10-26T14:00:00",
    foundLocation: "Thư viện",
    status: "Stored",
    campusID: 2,
    campusName: "HCM - SHTP (Q9)",
    categoryID: 3,
    categoryName: "Điện tử",
    thumbnailURL: "https://placehold.co/400x300/e2e8f0/1e293b?text=Airpods",
  },
  {
    foundItemID: 4,
    title: "Bình nước Lock&Lock",
    description: "Màu xanh dương.",
    foundDate: "2023-10-25T10:00:00",
    foundLocation: "Phòng 204",
    status: "Stored",
    campusID: 1,
    campusName: "HCM - NVH Sinh Viên",
    categoryID: 5,
    categoryName: "Đồ gia dụng",
    thumbnailURL: "https://placehold.co/400x300/2563eb/ffffff?text=Bottle",
  },
];

export const itemApi = rootApi.injectEndpoints({
  endpoints: (build) => ({
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

    createLostItem: build.mutation<LostItem, FormData>({
      query: (formData) => ({
        url: "/items/lost",
        method: "POST",
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
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

    getFoundItems: build.query<
      FoundItemDisplayDTO[],
      { campusId?: string; categoryId?: string; keyword?: string }
    >({
      queryFn: async () => {
        return { data: mockFoundItems };
      },
    }),

    // getFoundItems: build.query<FoundItemDisplayDTO[], { campusId?: string; categoryId?: string; keyword?: string }>({
    //   query: (params) => ({
    //     url: "/found-items",
    //     params: params,
    //   }),
    // }),

    getFoundItemById: build.query<FoundItemDisplayDTO, string>({
      queryFn: async (id) => {
        const found = mockFoundItems.find(
          (x) => x.foundItemID === parseInt(id)
        );

        if (!found) {
          return { error: { status: 404, data: "Item not found" } };
        }

        return { data: found };
      },
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

    getMyLostItems: build.query<LostItem[], void>({
      queryFn: async () => {
        const mock: LostItem[] = [
          {
            lostItemID: 1,
            title: "Laptop Macbook Air M1",
            lostDate: "2023-10-20",
            lostLocation: "Thư viện",
            status: "Open",
            campusID: 1,
            description: "Màu xám, có dán sticker",
            categoryID: 3,
            createdBy: 123,
          },
          {
            lostItemID: 2,
            title: "Bình nước Lock&Lock",
            lostDate: "2023-09-15",
            lostLocation: "Canteen",
            status: "Found",
            campusID: 1,
            description: "Màu xanh",
            categoryID: 5,
            createdBy: 123,
          },
        ];

        return { data: mock };
      },
    }),

    getMyFoundReports: build.query<FoundItemDisplayDTO[], void>({
      queryFn: async () => {
        const mock: FoundItemDisplayDTO[] = [
          {
            foundItemID: 99,
            title: "Thẻ xe buýt",
            description: "Thẻ xe buýt màu xanh, còn mới",
            foundDate: "2023-10-28T10:30:00",
            foundLocation: "Nhà xe",
            status: "Unclaimed",
            createdBy: 456,
            storedBy: 789,
            campusID: 1,
            categoryID: 3,
            campusName: "HCM - NVH",
            categoryName: "Giấy tờ",
            thumbnailURL: "https://placehold.co/400x300?text=Card",
          },
          {
            foundItemID: 100,
            title: "Ô dù màu đen",
            description: "Ô dù gấp, cán nhôm",
            foundDate: "2023-11-01T15:20:00",
            foundLocation: "Sảnh A",
            status: "Stored",
            createdBy: 321,
            storedBy: 654,
            campusID: 2,
            categoryID: 5,
            campusName: "HCM - Q9",
            categoryName: "Vật dụng cá nhân",
            thumbnailURL: "https://placehold.co/400x300?text=Umbrella",
          },
        ];

        return { data: mock };
      },
    }),

    getMyClaims: build.query<Claim[], void>({
      queryFn: async () => {
        const mock: Claim[] = [
          {
            claimID: 101,
            claimDate: "2023-10-27T10:00:00",
            status: "Pending",
            foundItem: {
              id: 1,
              title: "Ví da nam màu nâu",
              thumbnail:
                "https://placehold.co/400x300/5f4b32/ffffff?text=Wallet",
            },
          },
          {
            claimID: 102,
            claimDate: "2023-10-15T09:00:00",
            status: "Rejected",
            foundItem: {
              id: 55,
              title: "Tai nghe Sony",
              thumbnail:
                "https://placehold.co/400x300/000000/ffffff?text=Headphone",
            },
          },
        ];

        return { data: mock };
      },
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
  }),
});

export const {
  useGetCategoriesQuery,
  useCreateLostItemMutation,
  useCreateFoundItemMutation,
  useGetFoundItemsQuery,
  useGetFoundItemByIdQuery,
  useCreateClaimMutation,
  useGetMyLostItemsQuery,
  useGetMyFoundReportsQuery,
  useGetMyClaimsQuery,
  useCreateTemporaryFoundItemMutation,
  useGetSecurityTemporaryItemsQuery,
  useUpdateSecurityItemStatusMutation,
  useGetLostItemsForVerificationQuery,
  useVerifyLostItemMutation,
  useGetSystemReportsQuery,
  useGetCampusesQuery,
  useCreateCampusMutation,
  useGetAdminUsersQuery,
  useAssignUserMutation,
  useCreateUserMutation,
} = itemApi;
