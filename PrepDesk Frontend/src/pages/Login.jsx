import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../lib/api";
import Seo from "../components/Seo";
import { setUser } from "../store/authSlice";
const providers = [["google", "Google"], ["github", "GitHub"], ["linkedin", "LinkedIn"]];
const field = "h-11 w-full border border-line bg-transparent px-3 text-sm outline-none focus:border-accent";
export default function Login() {
    const role = useSelector((s) => s.auth.role) ?? "student";
    const [params] = useSearchParams();
    const [mode, setMode] = useState("login");
    const [show, setShow] = useState(false);
    const [error, setError] = useState(params.get("error") ? "Sign in with that account did not work. Try again or use email." : "");
    const [busy, setBusy] = useState(false);
    const [notice, setNotice] = useState(params.get("verified") ? "Email confirmed. You can sign in now." : "");
    const [lastEmail, setLastEmail] = useState("");
    const dispatch = useDispatch();
    const navigate = useNavigate();
    async function submit(e) {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        setBusy(true);
        setError("");
        setNotice("");
        setLastEmail(String(f.get("email")));
        try {
            const res = await api(`/auth/${mode}`, {
                method: "POST",
                body: JSON.stringify({ name: f.get("name"), email: f.get("email"), password: f.get("password"), role }),
            });
            if (res.verify) {
                setNotice("Check your email and open the link to finish signing up.");
                setMode("login");
                return;
            }
            dispatch(setUser(res.user));
            navigate("/home");
        }
        catch (err) {
            setError(err.message);
        }
        finally {
            setBusy(false);
        }
    }
    async function resend() {
        await api("/auth/resend", { method: "POST", body: JSON.stringify({ email: lastEmail }) }).catch(() => { });
        setError("");
        setNotice("If that account needs confirming, a new link is on its way.");
    }
    return (<main className="grid min-h-dvh place-items-center px-4 py-10">
      <Seo title="Sign in | PrepDeck" description="Sign in or create a free PrepDeck account to plan your placement preparation."/>
      <section className="w-full max-w-md border border-line bg-surface p-6 sm:p-8">
        <h1 className="font-serif text-3xl">{mode === "login" ? "Welcome back" : `Create your ${role} account`}</h1>
        <p className="mt-1 text-sm text-muted">{mode === "login" ? "Sign in to pick up where you stopped." : "It takes under a minute."}</p>

        <form onSubmit={submit} className="mt-6 grid gap-4">
          {mode === "register" && <input name="name" required placeholder="Full name" autoComplete="name" className={field} aria-label="Full name"/>}
          <input name="email" type="email" required placeholder="Email" autoComplete="email" className={field} aria-label="Email"/>
          <div className="relative">
            <input name="password" type={show ? "text" : "password"} required minLength={8} placeholder="Password" autoComplete={mode === "login" ? "current-password" : "new-password"} className={`${field} pe-16`} aria-label="Password"/>
            <button type="button" onClick={() => setShow((v) => !v)} className="absolute end-0 top-0 h-11 px-3 text-sm text-muted hover:text-ink">
              {show ? "Hide" : "Show"}
            </button>
          </div>
          {notice && <p role="status" className="text-sm">{notice}</p>}
          {error && <p role="alert" className="text-sm text-accent">{error}</p>}
          {error.startsWith("Verify your email") && <button type="button" onClick={resend} className="w-fit text-sm underline underline-offset-4">Send the link again</button>}
          <button disabled={busy} className="h-11 bg-accent font-semibold text-paper transition-opacity disabled:opacity-60">
            {busy ? "Please wait" : mode === "login" ? "Sign in" : "Create account"}
          </button>
        </form>

        <div className="my-6 flex items-center gap-3 text-sm text-muted"><span className="h-px flex-1 bg-line"/>or continue with<span className="h-px flex-1 bg-line"/></div>
        <div className="grid grid-cols-3 gap-3">
          {providers.map(([id, label]) => (<a key={id} href={`/api/auth/${id}?role=${role}`} className="grid h-11 place-items-center border border-line text-sm hover:border-accent">{label}</a>))}
        </div>

        <p className="mt-6 text-center text-sm">
          {mode === "login" ? "New here?" : "Already registered?"}{" "}
          <button onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }} className="underline underline-offset-4">
            {mode === "login" ? "Create an account" : "Sign in"}
          </button>
        </p>
        <p className="mt-4 text-center text-xs text-muted">
          By continuing you agree to the <Link to="/terms" className="underline underline-offset-4">Terms</Link> and <Link to="/privacy" className="underline underline-offset-4">Privacy Policy</Link>.
        </p>
      </section>
    </main>);
}