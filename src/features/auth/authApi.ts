import { rootApi } from "@/services/rootApi";
import { loginSuccess } from "./authSlice";

export const authApi = rootApi.injectEndpoints({
  endpoints: (build) => ({
    login: build.mutation({
      query: (credentials) => ({
        url: "/User/login",
        method: "POST",
        data: credentials,
      }),
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
        url: "/User/register",
        method: "POST",
        data: userData,
      }),
    }),
  }),
});

export const { useLoginMutation, useRegisterMutation } = authApi;
