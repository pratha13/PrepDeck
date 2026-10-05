import { createSlice } from "@reduxjs/toolkit";
const initialState = { role: localStorage.getItem("role") ?? null, user: null };
const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setRole(state, action) {
            state.role = action.payload;
            if (action.payload)
                localStorage.setItem("role", action.payload);
        },
        setUser(state, action) {
            state.user = action.payload;
            if (action.payload) {
                state.role = action.payload.role;
                localStorage.setItem("role", action.payload.role);
            }
        },
        logout(state) { state.user = null; state.role = null; localStorage.removeItem("role"); },
    },
});
export const { setRole, setUser, logout } = authSlice.actions;
export default authSlice.reducer;
