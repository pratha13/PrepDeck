import { motion } from "framer-motion";
export default function Bar({ value, label }) {
    return (<div className="h-1.5 w-full bg-line/50" role="progressbar" aria-label={label} aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
      <motion.div className="h-full bg-accent" initial={false} animate={{ width: `${value}%` }} transition={{ duration: 0.5, ease: "easeOut" }}/>
    </div>);
}
