import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
const lines = ["Hi, I'm Pip.", "Getting better each day.", "Let's plan your placement."];
export default function Landing() {
    const root = useRef(null);
    const navigate = useNavigate();
    useEffect(() => {
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const ctx = gsap.context(() => {
            if (!reduce) {
                gsap.fromTo("#arm", { rotate: -10, svgOrigin: "155 120" }, { rotate: 35, svgOrigin: "155 120", duration: 0.35, yoyo: true, repeat: 7, ease: "sine.inOut" });
                gsap.from("#robot", { y: 24, opacity: 0, duration: 0.6, ease: "power2.out" });
            }
            const tl = gsap.timeline();
            lines.forEach((_, i) => {
                tl.fromTo(`.line-${i}`, { opacity: 0 }, { opacity: 1, duration: 0.3 })
                    .to(`.line-${i}`, { opacity: 0, duration: 0.3 }, "+=0.4");
            });
        }, root);
        const t = setTimeout(() => navigate("/role", { replace: true }), 3000);
        return () => { clearTimeout(t); ctx.revert(); };
    }, [navigate]);
    return (<main ref={root} className="grid min-h-dvh place-items-center px-6 text-center" aria-label="PrepDeck welcome">
      <div>
        <h1 className="sr-only">PrepDeck, a free placement preparation planner</h1>
        <svg id="robot" viewBox="0 0 220 240" className="mx-auto w-44 sm:w-56" role="img" aria-label="A robot waving hello">
          <line x1="110" y1="14" x2="110" y2="36" stroke="var(--ink)" strokeWidth="4"/>
          <circle cx="110" cy="12" r="6" fill="var(--brass)"/>
          <rect x="62" y="36" width="96" height="76" rx="6" fill="var(--paper)" stroke="var(--ink)" strokeWidth="4"/>
          <circle cx="90" cy="70" r="9" fill="var(--accent)"/>
          <circle cx="130" cy="70" r="9" fill="var(--accent)"/>
          <rect x="92" y="92" width="36" height="5" fill="var(--ink)"/>
          <rect x="72" y="120" width="76" height="86" rx="6" fill="var(--accent)" stroke="var(--ink)" strokeWidth="4"/>
          <rect x="94" y="144" width="32" height="20" rx="3" fill="var(--paper)"/>
          <rect x="78" y="206" width="22" height="22" fill="var(--ink)"/>
          <rect x="120" y="206" width="22" height="22" fill="var(--ink)"/>
          <rect x="46" y="128" width="26" height="14" rx="4" fill="var(--ink)"/>
          <g id="arm"><rect x="148" y="52" width="14" height="70" rx="5" fill="var(--ink)"/><circle cx="155" cy="48" r="10" fill="var(--brass)"/></g>
        </svg>
        <div className="relative mt-6 h-10 font-serif text-2xl sm:text-3xl">
          {lines.map((l, i) => (<p key={l} className={`line-${i} absolute inset-x-0 opacity-0`}>{l}</p>))}
        </div>
      </div>
      <button onClick={() => navigate("/role", { replace: true })} className="fixed bottom-6 right-6 p-2 text-sm text-muted underline underline-offset-4 hover:text-ink">Skip intro</button>
    </main>);
}