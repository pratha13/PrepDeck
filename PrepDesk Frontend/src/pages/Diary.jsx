import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Skeleton from "../components/Skeleton";
import { useDiaryQuery, useSaveEntryMutation } from "../store/dataApi";
const pad = (n) => String(n).padStart(2, "0");
const fmt = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parse = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
const shift = (s, n) => { const d = parse(s); d.setDate(d.getDate() + n); return fmt(d); };
const btn = "h-11 min-w-11 border border-line px-3 text-sm hover:border-accent disabled:opacity-40 disabled:hover:border-line";
const flip = {
    enter: (d) => (d > 0 ? { rotateY: 0, zIndex: 0 } : { rotateY: -105, zIndex: 2 }),
    center: { rotateY: 0, zIndex: 1 },
    exit: (d) => (d > 0 ? { rotateY: -105, zIndex: 2 } : { rotateY: 0, zIndex: 0 }),
};
const fade = { enter: { opacity: 0 }, center: { opacity: 1 }, exit: { opacity: 0 } };
function Page({ date, initial, onSaved }) {
    const [text, setText] = useState(initial);
    const [status, setStatus] = useState("idle");
    const [save] = useSaveEntryMutation();
    const latest = useRef(initial);
    const dirty = useRef(false);
    const timer = useRef();
    const flush = useCallback(async () => {
        window.clearTimeout(timer.current);
        if (!dirty.current)
            return;
        dirty.current = false;
        setStatus("saving");
        try {
            await save({ date, text: latest.current }).unwrap();
            onSaved(date, latest.current);
            setStatus("saved");
        }
        catch {
            dirty.current = true;
            setStatus("error");
        }
    }, [date, save, onSaved]);
    useEffect(() => () => { flush(); }, [flush]);
    const label = parse(date).toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    return (<article className="border border-line bg-surface p-5 sm:p-8">
      <h2 className="font-serif text-2xl">{label}</h2>
      <textarea value={text} maxLength={5000} aria-label={`Diary entry for ${label}`} placeholder="What did you study today? What got stuck? What is the first task for tomorrow?" onChange={(e) => {
            setText(e.target.value);
            latest.current = e.target.value;
            dirty.current = true;
            setStatus("idle");
            window.clearTimeout(timer.current);
            timer.current = window.setTimeout(flush, 900);
        }} className="mt-4 block h-[56dvh] min-h-80 w-full resize-none bg-transparent font-serif text-lg leading-8 outline-none placeholder:text-muted" style={{ backgroundImage: "repeating-linear-gradient(to bottom, transparent 0, transparent 31px, var(--line) 31px, var(--line) 32px)", backgroundAttachment: "local" }}/>
      <p className="mt-3 flex justify-between text-sm text-muted" role="status">
        <span>{words} {words === 1 ? "word" : "words"}</span>
        <span>{status === "saving" ? "Saving" : status === "saved" ? "Saved" : status === "error" ? "Could not save. Keep typing to retry." : ""}</span>
      </p>
    </article>);
}
export default function Diary() {
    const today = fmt(new Date());
    const [date, setDate] = useState(today);
    const [dir, setDir] = useState(1);
    const [saved, setSaved] = useState({});
    const reduce = useReducedMotion();
    const { currentData } = useDiaryQuery(Number(date.slice(0, 4)), { refetchOnMountOrArgChange: true });
    const onSaved = useCallback((d, t) => setSaved((s) => ({ ...s, [d]: t })), []);
    const texts = useMemo(() => {
        const m = {};
        currentData?.entries.forEach((e) => { m[e.date] = e.text; });
        return { ...m, ...saved };
    }, [currentData, saved]);
    const streak = useMemo(() => {
        let d = texts[today]?.trim() ? today : shift(today, -1);
        let n = 0;
        while (texts[d]?.trim()) {
            n++;
            d = shift(d, -1);
        }
        return n;
    }, [texts, today]);
    const go = (d) => {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(d) || d > today || d === date)
            return;
        setDir(d > date ? 1 : -1);
        setDate(d);
    };
    return (<div>
      <h1 className="font-serif text-3xl sm:text-4xl">Diary</h1>
      <p className="mt-3 text-muted">
        {streak > 0 ? `You have written ${streak} ${streak === 1 ? "day" : "days"} in a row.` : "Write a few lines today to start a streak."}
      </p>
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <button onClick={() => go(shift(date, -1))} className={btn} aria-label="Previous day">Prev</button>
        <input type="date" value={date} max={today} onChange={(e) => go(e.target.value)} aria-label="Go to date" className="h-11 border border-line bg-transparent px-3 text-sm"/>
        <button onClick={() => go(shift(date, 1))} disabled={date >= today} className={btn} aria-label="Next day">Next</button>
        <button onClick={() => go(today)} disabled={date === today} className={btn}>Today</button>
      </div>

      <div className="mt-6" style={{ perspective: 1800 }}>
        {!currentData ? <Skeleton rows={3}/> : (<div className="grid">
            <AnimatePresence initial={false} custom={dir}>
              <motion.div key={date} custom={dir} variants={reduce ? fade : flip} initial="enter" animate="center" exit="exit" transition={{ duration: reduce ? 0.15 : 0.75, ease: [0.4, 0.1, 0.2, 1] }} style={{ gridArea: "1 / 1", transformOrigin: "left center", backfaceVisibility: "hidden" }}>
                <Page date={date} initial={texts[date] ?? ""} onSaved={onSaved}/>
              </motion.div>
            </AnimatePresence>
          </div>)}
      </div>
    </div>);
}