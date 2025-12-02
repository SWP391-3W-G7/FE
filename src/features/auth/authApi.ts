import { rootApi } from "@/store/rootApi";
import { loginSuccess } from "./authSlice";

export const authApi = rootApi.injectEndpoints({
  endpoints: (build) => ({
    login: build.mutation({
      query: (credentials) => ({
        url: "/auth/login",
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
  }),
});

export const { useLoginMutation } = authApi;
