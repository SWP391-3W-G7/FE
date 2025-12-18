import { rootApi } from "@/services/rootApi";
import { loginSuccess } from "./authSlice";
import { type User, type LoginResponse } from "@/types"; // Import type ông đã định nghĩa

export const authApi = rootApi.injectEndpoints({
  endpoints: (build) => ({
    login: build.mutation<LoginResponse, any>({
      query: (credentials) => ({
        url: "/Users/login",
        method: "POST",
        data: credentials, // Dùng 'data' vì ông dùng axiosBaseQuery
      }),

      // 🔥 ĐOẠN NÀY LÀ QUAN TRỌNG NHẤT
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

        // 3. Gom các trường lẻ tẻ thành object User
        const user: User = {
          email: rawResult.email,
          fullName: rawResult.fullName,
          campusName: rawResult.campusName,
          role: role, 
          campusId: rawResult.campusId,
        };

        console.log("👤 User object:", user);

        // 4. Trả về đúng cấu trúc { user, token } mà authSlice đang đợi
        return {
          user: user,
          token: accessToken,
        };
      },

      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          // data lúc này đã qua transformResponse => { user: {...}, token: "..." }
          
          dispatch(loginSuccess(data)); // Redux lưu ngon lành!
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
  }),
});

export const { useLoginMutation, useRegisterMutation } = authApi;