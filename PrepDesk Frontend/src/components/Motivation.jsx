import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
const lines = [
    "Small steps today still count tomorrow.",
    "One solved problem beats ten bookmarked ones.",
    "Consistency is most of the trick.",
    "Finish the next lesson, then decide what comes after.",
    "You do not need a perfect day, only a started one.",
    "Review yesterday's mistakes. They are free lessons.",
    "Slow progress is still progress.",
    "Write it in your diary, then do the next task.",
    "Interviews reward practice, and you are practising.",
    "Tired is fine. Quitting is optional.",
    "Explain it out loud. If you cannot, revisit it.",
    "Today's effort is next month's confidence.",
];
const slot = () => Math.floor(Date.now() / (15 * 60 * 1000));
export default function Motivation() {
    const [s, setS] = useState(slot());
    const [hidden, setHidden] = useState(null);
    useEffect(() => {
        const t = setInterval(() => setS(slot()), 30_000);
        return () => clearInterval(t);
    }, []);
    if (hidden === s)
        return null;
    return (<div className="pointer-events-none fixed inset-x-0 bottom-4 z-20 flex justify-center px-4">
      <AnimatePresence mode="wait">
        <motion.div key={s} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} transition={{ duration: 0.6 }}>
          <motion.div animate={{ y: [0, -4, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} role="status" className="pointer-events-auto flex max-w-md items-start gap-4 border border-line bg-surface px-4 py-3">
            <p className="font-serif text-base leading-snug">{lines[s % lines.length]}</p>
            <button onClick={() => setHidden(s)} aria-label="Hide this message" className="shrink-0 text-sm text-muted hover:text-ink">Hide</button>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>);
}
