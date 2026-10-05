import { configureStore } from "@reduxjs/toolkit";
import auth from "./authSlice";
import { dataApi } from "./dataApi";
export const store = configureStore({
    reducer: { auth, [dataApi.reducerPath]: dataApi.reducer },
    middleware: (gdm) => gdm().concat(dataApi.middleware),
});
