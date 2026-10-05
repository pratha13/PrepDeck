import { useSearchParams } from "react-router-dom";
import Bar from "../components/Bar";
import Skeleton from "../components/Skeleton";
import Playlists from "./Playlists";
import { useCoursesQuery, usePathQuery, useEnrollMutation, useToggleMutation } from "../store/dataApi";
const cats = ["All", "DSA", "Web Development", "Java", "Python", "AI/ML", "Blockchain", "Cyber Security"];
const tab = (on) => `border-b-2 px-1 pb-2 text-sm ${on ? "border-accent text-ink" : "border-transparent text-muted hover:text-ink"}`;
export default function Courses() {
    const [params, setParams] = useSearchParams();
    const tabName = params.get("tab");
    const mine = tabName === "path";
    const pl = tabName === "playlists";
    const cat = params.get("cat") ?? "All";
    const courses = useCoursesQuery();
    const path = usePathQuery();
    const [enroll] = useEnrollMutation();
    const [toggle] = useToggleMutation();
    const set = (k, v) => { const n = new URLSearchParams(params); n.set(k, v); setParams(n, { replace: true }); };
    const list = (courses.data?.courses ?? []).filter((c) => cat === "All" || c.category === cat);
    const items = path.data?.path ?? [];
    return (<div>
      <h1 className="font-serif text-3xl sm:text-4xl">Courses</h1>
      <div className="mt-6 flex gap-6 border-b border-line" role="tablist">
        <button role="tab" aria-selected={!mine && !pl} onClick={() => set("tab", "all")} className={tab(!mine && !pl)}>All courses</button>
        <button role="tab" aria-selected={mine} onClick={() => set("tab", "path")} className={tab(mine)}>My path ({items.length})</button>
        <button role="tab" aria-selected={pl} onClick={() => set("tab", "playlists")} className={tab(pl)}>Playlists</button>
      </div>

      {pl ? <Playlists /> : !mine ? (<>
          <div className="-mx-4 mt-5 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:px-0">
            {cats.map((c) => (<button key={c} onClick={() => set("cat", c)} aria-pressed={cat === c} className={`shrink-0 border px-3 py-1.5 text-sm ${cat === c ? "border-accent bg-accent text-paper" : "border-line hover:border-accent"}`}>{c}</button>))}
          </div>
          <div className="mt-4">
            {courses.isLoading ? <Skeleton /> : list.length === 0 ? <p className="py-10 text-muted">No courses in this category yet. Check back soon.</p> : (<ul className="divide-y divide-line border-y border-line">
                {list.map((c) => (<li key={c.id} className="flex flex-col gap-3 py-5 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
                    <div className="min-w-0">
                      <h2 className="font-semibold">{c.title}</h2>
                      <p className="mt-1 max-w-prose text-sm text-muted">{c.description}</p>
                      <p className="mt-2 text-xs text-muted">{c.category}, {c.lessonCount} lessons{c.ratings ? `, rated ${c.rating} out of 5 by ${c.ratings}` : ""}</p>
                      <a href={c.link} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-sm underline underline-offset-4">Open resource</a>
                    </div>
                    <button onClick={() => enroll({ id: c.id, on: !c.enrolled })} className={`h-10 shrink-0 px-4 text-sm font-semibold ${c.enrolled ? "border border-line hover:border-accent" : "bg-accent text-paper"}`}>
                      {c.enrolled ? "Remove from path" : "Add to my path"}
                    </button>
                  </li>))}
              </ul>)}
          </div>
        </>) : (<div className="mt-4">
          {path.isLoading ? <Skeleton rows={3}/> : items.length === 0 ? (<p className="py-10 text-muted">Nothing here yet. Add courses from the All courses tab to build your path.</p>) : (<ol className="divide-y divide-line border-y border-line">
              {items.map((p) => (<li key={p.id}>
                  <details className="group py-4" open>
                    <summary className="grid cursor-pointer list-none gap-2 sm:grid-cols-[1fr_12rem] sm:items-center sm:gap-6">
                      <span><span className="font-semibold">{p.title}</span><span className="block text-sm text-muted">{p.category}</span></span>
                      <span className="flex items-center gap-3"><Bar value={p.percent} label={p.title}/><span className="w-10 text-right text-sm">{p.percent}%</span></span>
                    </summary>
                    <ul className="mt-3 grid gap-1">
                      {p.lessons.map((l) => (<li key={l.id}>
                          <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm">
                            <input type="checkbox" checked={p.done.includes(l.id)} onChange={() => toggle({ id: p.id, lessonId: l.id })} className="size-4 accent-accent"/>
                            <span className={p.done.includes(l.id) ? "text-muted line-through" : ""}>{l.title}</span>
                          </label>
                        </li>))}
                    </ul>
                  </details>
                </li>))}
            </ol>)}
        </div>)}
    </div>);
}
