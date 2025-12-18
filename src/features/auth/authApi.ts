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
        const accessToken = rawResult.token; 

        let role = rawResult.roleName.toUpperCase();
        if (role === 'USER') role = 'STUDENT';

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

      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
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