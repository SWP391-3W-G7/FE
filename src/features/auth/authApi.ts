import { rootApi } from "@/services/rootApi";
import { loginSuccess, updateUser } from "./authSlice";
import { type User, type LoginResponse, type UserRole } from "@/types";

export const authApi = rootApi.injectEndpoints({
  endpoints: (build) => ({
    login: build.mutation<LoginResponse, { email: string; password: string }>({
      query: (credentials) => ({
        url: "/Users/login",
        method: "POST",
        data: credentials,
      }),

      transformResponse: (rawResult: {
        token: string;
        email: string;
        fullName: string;
        campusName: string;
        roleName: string;
        campusId: number;
        studentIdCardUrl?: string;
      }) => {
        // 1. Map 'token' của BE thành biến 'token' cho FE
        const accessToken = rawResult.token;

        // 2. Xử lý Role: Normalize role từ API
        const roleFromApi = rawResult.roleName || 'User';
        let role = roleFromApi.toUpperCase();

        // Map các role name từ API sang frontend (check substring trước)
        if (role.includes('SECURITY') || role === 'MANAGER') {
          role = 'SECURITY';
        } else if (role.includes('ADMIN')) {
          role = 'ADMIN';
        } else if (role.includes('STAFF')) {
          role = 'STAFF';
        } else if (role === 'USER' || role === 'STUDENT') {
          role = 'STUDENT';
        } else {
          // Default fallback
          role = 'STUDENT';
        }

        const user: User = {
          email: rawResult.email,
          fullName: rawResult.fullName,
          campusName: rawResult.campusName,
          role: role as UserRole,
          campusId: rawResult.campusId,
          studentIdCardUrl: rawResult.studentIdCardUrl,
        };

        return {
          user: user,
          token: accessToken,
        };
      },

      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;

          dispatch(loginSuccess(data));
        } catch {
          // Login failed
        }
      },
    }),

    register: build.mutation<void, FormData>({
      query: (formData) => ({
        url: "/Users/register",
        method: "POST",
        data: formData,
        // Don't set Content-Type - let axios set it with boundary
      }),
    }),

    getProfile: build.query<User, void>({
      query: () => ({
        url: "/Users/profile",
        method: "GET",
      }),
      transformResponse: (rawResult: any) => {
        const roleFromApi = rawResult.roleName || 'User';
        let role = roleFromApi.toUpperCase();

        if (role.includes('SECURITY') || role === 'MANAGER') {
          role = 'SECURITY';
        } else if (role.includes('ADMIN')) {
          role = 'ADMIN';
        } else if (role.includes('STAFF')) {
          role = 'STAFF';
        } else if (role === 'USER' || role === 'STUDENT') {
          role = 'STUDENT';
        } else {
          role = 'STUDENT';
        }

        return {
          userId: rawResult.userId,
          username: rawResult.username,
          email: rawResult.email,
          fullName: rawResult.fullName,
          campusName: rawResult.campusName,
          role: role as UserRole,
          campusId: rawResult.campusId,
          phoneNumber: rawResult.phoneNumber,
          status: rawResult.status,
          studentIdCardUrl: rawResult.studentIdCardUrl,
        } as User;
      },
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(updateUser(data));
        } catch (error) {
          console.error("Failed to sync profile:", error);
        }
      },
    }),

    // Update user profile
    updateProfile: build.mutation<void, { fullName: string }>({
      query: (data) => ({
        url: "/Users/profile",
        method: "PUT",
        data,
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          // Note: updateProfile might not return the full user, 
          // but we can at least update what we sent or refetch
          // For now, let's assume we might need to refetch profile
          // or just update the name locally.
          if (_arg.fullName) {
            dispatch(updateUser({ fullName: _arg.fullName }));
          }
        } catch { }
      }
    }),

    // Upload student ID card
    uploadStudentIdCard: build.mutation<{ message: string }, FormData>({
      query: (formData) => ({
        url: "/Users/upload-student-id-card",
        method: "POST",
        data: formData,
      }),
    }),

    // Change password
    changePassword: build.mutation<void, { currentPassword: string; newPassword: string }>({
      query: (data) => ({
        url: "/Users/change-password",
        method: "PUT",
        data,
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
  useUploadStudentIdCardMutation,
  useChangePasswordMutation
} = authApi;
