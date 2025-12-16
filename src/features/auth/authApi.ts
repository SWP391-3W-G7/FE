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
        // rawResult là cái cục JSON ông vừa paste cho tôi đó
        
        // 1. Map 'token' của BE thành biến 'token' cho FE
        const accessToken = rawResult.token; 

        // 2. Xử lý Role: BE trả về "User" -> FE đổi thành "STUDENT"
        // (Hoặc giữ nguyên nếu ông muốn, nhưng nên chuẩn hóa Uppercase)
        let role = rawResult.roleName.toUpperCase();
        if (role === 'USER') role = 'STUDENT';

        // 3. Gom các trường lẻ tẻ thành object User
        const user: User = {
          email: rawResult.email,
          fullName: rawResult.fullName,
          campusName: rawResult.campusName,
          role: role, 
        };

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