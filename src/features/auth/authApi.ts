import { rootApi } from "@/services/rootApi";
import { loginSuccess } from "./authSlice";
import { type User, type LoginResponse } from "@/types"; 

export const authApi = rootApi.injectEndpoints({
  endpoints: (build) => ({
    login: build.mutation<LoginResponse, any>({
      query: (credentials) => ({
        url: "/Users/login",
        method: "POST",
        data: credentials,
      }),

      transformResponse: (rawResult: any) => {
        console.log("📨 Raw API response:", rawResult);
        
        // 1. Map 'token' của BE thành biến 'token' cho FE
        const accessToken = rawResult.token; 

        // 2. Xử lý Role: Normalize role từ API
        const roleFromApi = rawResult.roleName || 'User';
        let role = roleFromApi.toUpperCase();
        
        console.log("📋 Original roleName:", roleFromApi, "→ Uppercase:", role);
        
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

        console.log("✅ Final role:", role);


        const user: User = {
          email: rawResult.email,
          fullName: rawResult.fullName,
          campusName: rawResult.campusName,
          role: role, 
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
        } catch (err) {
          console.error("Login failed: ", err);
        }
      },
    }),

    register: build.mutation({
      query: (userData) => ({
        url: "/Users/register",
        method: "POST",
        data: userData,
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