import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { setUser } from "../store/authSlice";
export default function AuthCallback() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    useEffect(() => {
        api("/auth/me")
            .then(({ user }) => { dispatch(setUser(user)); navigate("/home", { replace: true }); })
            .catch(() => navigate("/login?error=oauth", { replace: true }));
    }, [dispatch, navigate]);
    return <p className="grid min-h-dvh place-items-center text-muted">Signing you in</p>;
}
