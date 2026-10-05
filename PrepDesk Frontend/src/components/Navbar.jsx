import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";
import { api } from "../lib/api";
import { logout } from "../store/authSlice";
import { dataApi } from "../store/dataApi";
const links = {
    student: [["/home", "Home"], ["/courses", "Courses"], ["/checklist", "Checklist"], ["/diary", "Diary"], ["/chat", "Chat"]],
    educator: [["/educator/add", "Add course"], ["/educator/remove", "Remove course"]],
};
const btn = "h-9 border border-line px-3 text-sm hover:border-accent";
export default function Navbar() {
    const user = useSelector((s) => s.auth.user);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const [confirm, setConfirm] = useState(false);
    const [dark, setDark] = useState(document.documentElement.classList.contains("dark"));
    const items = links[user.role];
    useEffect(() => {
        const onKey = (e) => e.key === "Escape" && setConfirm(false);
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);
    const toggleTheme = () => {
        document.documentElement.classList.toggle("dark", !dark);
        localStorage.setItem("theme", dark ? "light" : "dark");
        setDark(!dark);
    };
    async function signOut() {
        await api("/auth/logout", { method: "POST" }).catch(() => { });
        dispatch(logout());
        dispatch(dataApi.util.resetApiState());
        navigate("/login", { replace: true });
    }
    const linkCls = ({ isActive }) => `py-2 text-sm transition-colors ${isActive ? "text-ink underline decoration-2 underline-offset-8" : "text-muted hover:text-ink"}`;
    return (<header className="sticky top-0 z-30 border-b border-line bg-paper">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
        <NavLink to={items[0][0]} className="font-serif text-xl font-semibold">PrepDeck</NavLink>
        <nav className="hidden items-center gap-6 md:flex" aria-label="Main">
          {items.map(([to, label]) => <NavLink key={to} to={to} className={linkCls}>{label}</NavLink>)}
        </nav>
        <div className="flex items-center gap-2">
          <button onClick={toggleTheme} className={`${btn} hidden md:block`}>{dark ? "Light" : "Dark"}</button>
          <button onClick={() => setConfirm(true)} className={`${btn} hidden md:block`}>Log out</button>
          <button onClick={() => setOpen((v) => !v)} aria-expanded={open} className={`${btn} md:hidden`}>{open ? "Close" : "Menu"}</button>
        </div>
      </div>
      <AnimatePresence>
        {open && (<motion.nav initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t border-line md:hidden" aria-label="Menu">
            <div className="grid gap-1 px-4 py-3">
              {items.map(([to, label]) => <NavLink key={to} to={to} onClick={() => setOpen(false)} className={(s) => `${linkCls(s)} py-3`}>{label}</NavLink>)}
              <div className="mt-2 flex gap-2">
                <button onClick={toggleTheme} className={`${btn} flex-1`}>{dark ? "Light theme" : "Dark theme"}</button>
                <button onClick={() => { setOpen(false); setConfirm(true); }} className={`${btn} flex-1`}>Log out</button>
              </div>
            </div>
          </motion.nav>)}
      </AnimatePresence>
      <AnimatePresence>
        {confirm && (<motion.div className="fixed inset-0 z-40 grid place-items-center bg-ink/40 px-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setConfirm(false)}>
            <motion.div role="dialog" aria-modal="true" aria-labelledby="lo-title" onClick={(e) => e.stopPropagation()} initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 12, opacity: 0 }} className="w-full max-w-sm border border-line bg-surface p-6">
              <h2 id="lo-title" className="font-serif text-2xl">Log out?</h2>
              <p className="mt-2 text-sm text-muted">Your progress is saved. Sign back in any time to continue.</p>
              <div className="mt-6 flex justify-end gap-3">
                <button autoFocus onClick={() => setConfirm(false)} className={btn}>Stay signed in</button>
                <button onClick={signOut} className="h-9 bg-accent px-3 text-sm font-semibold text-paper">Log out</button>
              </div>
            </motion.div>
          </motion.div>)}
      </AnimatePresence>
    </header>);
}
