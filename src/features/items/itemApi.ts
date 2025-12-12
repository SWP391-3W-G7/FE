import { rootApi } from "@/services/rootApi";
import {
  type Category,
  type Claim,
  type FoundItem,
  type FoundItemDisplayDTO,
  type LostItem,
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

    // Security: Create temporary found item record
    createTemporaryFoundItem: build.mutation<FoundItem, FormData>({
      query: (formData) => ({
        url: "/security/found-items/temporary",
        method: "POST",
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }),
    }),

    // Staff: Get all found items for management
    getStaffFoundItems: build.query<
      FoundItemDisplayDTO[],
      { campusId?: string; status?: string; keyword?: string }
    >({
      queryFn: async () => {
        // Mock data - in real app this would filter by campus and status
        return { data: mockFoundItems };
      },
    }),

    // Staff: Create official found item record (with storage location)
    createOfficialFoundItem: build.mutation<FoundItem, FormData>({
      query: (formData) => ({
        url: "/staff/found-items/official",
        method: "POST",
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }),
    }),

    // Staff: Update found item status
    updateFoundItemStatus: build.mutation<
      FoundItem,
      { foundItemId: string; status: string }
    >({
      query: ({ foundItemId, status }) => ({
        url: `/staff/found-items/${foundItemId}/status`,
        method: "PATCH",
        data: { status },
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
  useGetStaffFoundItemsQuery,
  useCreateOfficialFoundItemMutation,
  useUpdateFoundItemStatusMutation,
} = itemApi;
