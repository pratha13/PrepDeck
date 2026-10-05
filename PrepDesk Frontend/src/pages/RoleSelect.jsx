import { motion } from "framer-motion";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setRole } from "../store/authSlice";
import Seo from "../components/Seo";
const options = [
    { role: "student", title: "I'm a student", body: "Follow free courses, set targets, keep a diary and track your progress." },
    { role: "educator", title: "I'm an educator", body: "Publish courses for students to find, and remove them when they go out of date." },
];
export default function RoleSelect() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const choose = (r) => { dispatch(setRole(r)); navigate("/login"); };
    return (<main className="mx-auto grid min-h-dvh max-w-3xl content-center gap-8 px-5 py-12">
      <Seo title="Choose your role | PrepDeck" noindex/>
      <motion.h1 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="font-serif text-3xl sm:text-4xl">
        Who is studying today?
      </motion.h1>
      <div className="grid gap-4 sm:grid-cols-2">
        {options.map((o, i) => (<motion.button key={o.role} onClick={() => choose(o.role)} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.12 }} whileHover={{ y: -3 }} whileTap={{ scale: 0.98 }} className="border border-line bg-surface p-6 text-left transition-colors hover:border-accent focus-visible:outline-2 focus-visible:outline-accent">
            <span className="block text-xl font-semibold">{o.title}</span>
            <span className="mt-2 block text-muted">{o.body}</span>
          </motion.button>))}
      </div>
    </main>);
}
