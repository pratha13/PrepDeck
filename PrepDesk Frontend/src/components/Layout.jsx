import { useEffect, useRef, useState } from "react";
import { Link, Navigate, Outlet, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Navbar from "./Navbar";
import Motivation from "./Motivation";
import Seo from "./Seo";
import { api } from "../lib/api";
import { setUser } from "../store/authSlice";
const titles = {
    "/home": "Home", "/courses": "Courses", "/checklist": "Checklist", "/diary": "Diary", "/chat": "Student chat",
    "/educator/add": "Add course", "/educator/remove": "Remove course",
};
export default function Layout({ role }) {
    const user = useSelector((s) => s.auth.user);
    const dispatch = useDispatch();
    const { pathname } = useLocation();
    const main = useRef(null);
    const [checking, setChecking] = useState(!user);
    useEffect(() => {
        if (user)
            return;
        api("/auth/me").then(({ user }) => dispatch(setUser(user))).catch(() => { }).finally(() => setChecking(false));
    }, [user, dispatch]);
    // Move focus to the page content after each navigation so keyboard and screen reader users start at the top
    useEffect(() => { main.current?.focus(); window.scrollTo(0, 0); }, [pathname]);
    if (checking)
        return <p className="grid min-h-dvh place-items-center text-muted">Loading your space</p>;
    if (!user)
        return <Navigate to="/login" replace/>;
    if (user.role !== role)
        return <Navigate to={user.role === "student" ? "/home" : "/educator/add"} replace/>;
    return (<>
      <Seo title={`${titles[pathname] ?? "PrepDeck"} | PrepDeck`} noindex/>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:bg-accent focus:px-4 focus:py-2 focus:text-paper">Skip to content</a>
      <Navbar />
      <main id="main" ref={main} tabIndex={-1} className="mx-auto max-w-5xl px-4 py-8 sm:px-6"><Outlet /></main>
      <footer className="mx-auto flex max-w-5xl gap-5 px-4 pb-28 pt-6 text-sm text-muted sm:px-6">
        <Link to="/terms" className="underline underline-offset-4 hover:text-ink">Terms</Link>
        <Link to="/privacy" className="underline underline-offset-4 hover:text-ink">Privacy</Link>
      </footer>
      {user.role === "student" && <Motivation />}
    </>);
}
