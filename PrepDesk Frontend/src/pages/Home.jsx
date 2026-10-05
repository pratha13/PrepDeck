import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import Bar from "../components/Bar";
import Skeleton from "../components/Skeleton";
import { usePathQuery } from "../store/dataApi";
export default function Home() {
    const user = useSelector((s) => s.auth.user);
    const { data, isLoading } = usePathQuery();
    const path = data?.path ?? [];
    const total = path.reduce((n, p) => n + p.lessons.length, 0);
    const done = path.reduce((n, p) => n + p.done.length, 0);
    const pct = total ? Math.round((100 * done) / total) : 0;
    const h = new Date().getHours();
    const greet = h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
    return (<div>
      <h1 className="font-serif text-3xl sm:text-4xl">{greet}, {user.name.split(" ")[0]}</h1>
      {isLoading ? <div className="mt-8"><Skeleton rows={3}/></div> : path.length === 0 ? (<section className="mt-8 border border-line bg-surface p-6">
          <h2 className="text-xl font-semibold">Your learning path is empty</h2>
          <p className="mt-2 max-w-prose text-muted">Pick the courses you want to follow. They appear here in the order you add them, with your progress.</p>
          <Link to="/courses" className="mt-5 inline-block bg-accent px-4 py-2.5 text-sm font-semibold text-paper">Browse courses</Link>
        </section>) : (<>
          <p className="mt-3 text-muted">You have finished {done} of {total} lessons across {path.length} {path.length === 1 ? "course" : "courses"}.</p>
          <div className="mt-4 max-w-md"><Bar value={pct} label="Overall progress"/></div>
          <h2 className="mt-10 text-xl font-semibold">Pick up where you left off</h2>
          <ul className="mt-3 divide-y divide-line border-y border-line">
            {path.map((p) => {
                const next = p.lessons.find((l) => !p.done.includes(l.id));
                return (<li key={p.id} className="grid gap-2 py-4 sm:grid-cols-[1fr_12rem] sm:items-center sm:gap-6">
                  <div>
                    <p className="font-semibold">{p.title}</p>
                    <p className="text-sm text-muted">{next ? `Next: ${next.title}` : "Course complete"}</p>
                  </div>
                  <div className="flex items-center gap-3"><Bar value={p.percent} label={p.title}/><span className="w-10 text-right text-sm">{p.percent}%</span></div>
                </li>);
            })}
          </ul>
          <Link to="/courses?tab=path" className="mt-4 inline-block text-sm underline underline-offset-4">Open my path</Link>
        </>)}
    </div>);
}
