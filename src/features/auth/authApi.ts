import { rootApi } from "@/services/rootApi";
import { loginSuccess } from "./authSlice";
import { type User, type LoginResponse, type UserRole } from "@/types"; 

export const authApi = rootApi.injectEndpoints({
  endpoints: (build) => ({
    login: build.mutation<LoginResponse, { email: string; password: string }>({
      query: (credentials) => ({
        url: "/Users/login",
        method: "POST",
        data: credentials,
      }),

      transformResponse: (rawResult: { token: string; email: string; fullName: string; campusName: string; roleName: string; campusId: number }) => {
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

    // Update user profile
    updateProfile: build.mutation<void, { fullName: string }>({
      query: (data) => ({
        url: "/Users/profile",
        method: "PUT",
        data,
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

export const { useLoginMutation, useRegisterMutation, useUpdateProfileMutation, useChangePasswordMutation } = authApi;