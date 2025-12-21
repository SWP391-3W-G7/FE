import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "@/services/axiosBaseQuery";

export const rootApi = createApi({
  reducerPath: "api",
  baseQuery: axiosBaseQuery(),
  tagTypes: [
    "Auth",
    "Items",
    "Campuses",
    "Users",
    "IncomingItems",
    "FoundItems",
    "Claims",
    "ReadyItems",
    "InventoryItems",
    "StatusItems",
    "Disputes",
    "MyLostItems",
    "MyFoundItems",
    "SystemReports",
    "PendingUsers"
  ],
  endpoints: () => ({}),
});
