import { rootApi } from "@/services/rootApi";
import { loginSuccess } from "./authSlice";

export const authApi = rootApi.injectEndpoints({
  endpoints: (build) => ({
    login: build.mutation<{ token: string; user: any }, any>({
      query: (credentials) => ({
        url: "/Users/login",
        method: "POST",
        data: credentials,
      }),
      transformResponse: (response: any) => {
        console.log("📨 transformResponse - Raw response:", response);
        
        // Response is: { token, email, fullName, roleName, campusId, campusName }
        const token = response?.token;
        console.log("Token:", token);
        
        // Normalize role to match ROLES config
        const roleFromApi = response?.roleName || 'STUDENT';
        let normalizedRole = roleFromApi.toUpperCase();
        
        // Map API role names to our ROLES
        if (normalizedRole === 'MANAGER' || roleFromApi.toLowerCase().includes('security')) {
          normalizedRole = 'SECURITY';
        } else if (normalizedRole === 'ADMIN' || roleFromApi.toLowerCase().includes('admin')) {
          normalizedRole = 'ADMIN';
        } else if (normalizedRole === 'STAFF' || roleFromApi.toLowerCase().includes('staff')) {
          normalizedRole = 'STAFF';
        } else {
          normalizedRole = 'STUDENT';
        }
        
        console.log("Role normalized:", roleFromApi, "→", normalizedRole);
        
        const user = {
          id: response?.email || 'unknown',
          email: response?.email || '',
          fullName: response?.fullName || '',
          role: normalizedRole,
          campusId: response?.campusId || '',
          campusName: response?.campusName || '',
        };
        
        console.log("User object created:", user);
        
        return {
          token,
          user
        };
      },
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          console.log("✅ onQueryStarted - data from queryFulfilled:", data);
          console.log("✅ User role:", data?.user?.role, "Type:", typeof data?.user?.role);
          
          if (data?.token && data?.user) {
            console.log("Dispatching loginSuccess with user:", data.user);
            console.log("User role being saved:", data.user.role);
            
            dispatch(loginSuccess({
              token: data.token,
              user: data.user
            }));
            
            // Verify it was saved
            console.log("localStorage user after save:", localStorage.getItem('user'));
          } else {
            console.error("❌ Missing token or user in data", data);
          }
        } catch (err) {
          console.error("❌ Error in onQueryStarted: ", err);
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
