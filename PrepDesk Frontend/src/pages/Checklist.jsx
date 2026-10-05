import { useState } from "react";
import Bar from "../components/Bar";
import Skeleton from "../components/Skeleton";
import { useChecklistQuery, useAddItemMutation, useSetItemMutation, useDelItemMutation, useAddTargetMutation, useBumpTargetMutation, useDelTargetMutation, } from "../store/dataApi";
const key = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
const field = "h-11 border border-line bg-transparent px-3 text-sm outline-none focus:border-accent";
const small = "h-11 min-w-11 border border-line px-3 text-sm hover:border-accent";
export default function Checklist() {
    const now = new Date();
    const [month, setMonth] = useState(key(now));
    const [week, setWeek] = useState(Math.min(Math.ceil(now.getDate() / 7), 5));
    const [y, m] = month.split("-").map(Number);
    const weeks = Math.ceil(new Date(y, m, 0).getDate() / 7);
    const shift = (n) => setMonth(key(new Date(y, m - 1 + n, 1)));
    const label = new Date(y, m - 1, 1).toLocaleDateString(undefined, { month: "long", year: "numeric" });
    const { data, isLoading } = useChecklistQuery(month);
    const [addItem] = useAddItemMutation();
    const [setItem] = useSetItemMutation();
    const [delItem] = useDelItemMutation();
    const [addTarget] = useAddTargetMutation();
    const [bump] = useBumpTargetMutation();
    const [delTarget] = useDelTargetMutation();
    const items = data?.items ?? [];
    const targets = data?.targets ?? [];
    const done = items.filter((i) => i.done).length;
    const pct = items.length ? Math.round((100 * done) / items.length) : 0;
    async function onItem(e) {
        e.preventDefault();
        const form = e.currentTarget;
        const text = String(new FormData(form).get("text") ?? "").trim();
        if (!text)
            return;
        await addItem({ text, month, week: Math.min(week, weeks) });
        form.reset();
    }
    async function onTarget(e) {
        e.preventDefault();
        const form = e.currentTarget;
        const f = new FormData(form);
        const title = String(f.get("title") ?? "").trim();
        const goal = Number(f.get("goal"));
        if (!title || !goal)
            return;
        await addTarget({ title, goal, month });
        form.reset();
    }
    return (<div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif text-3xl sm:text-4xl">Checklist</h1>
        <div className="flex items-center gap-2">
          <button onClick={() => shift(-1)} className={small} aria-label="Previous month">Prev</button>
          <span className="min-w-36 text-center text-sm font-semibold">{label}</span>
          <button onClick={() => shift(1)} className={small} aria-label="Next month">Next</button>
        </div>
      </div>

      <p className="mt-4 text-muted">{items.length ? `${done} of ${items.length} tasks done this month.` : "Nothing planned for this month yet."}</p>
      <div className="mt-3 max-w-md"><Bar value={pct} label="Month progress"/></div>

      <section className="mt-10" aria-labelledby="targets">
        <h2 id="targets" className="text-xl font-semibold">Monthly targets</h2>
        <form onSubmit={onTarget} className="mt-3 flex flex-wrap gap-2">
          <input name="title" required maxLength={100} placeholder="Solve DSA problems" aria-label="Target name" className={`${field} min-w-0 flex-1 basis-48`}/>
          <input name="goal" type="number" required min={1} max={10000} placeholder="Goal" aria-label="Goal number" className={`${field} w-24`}/>
          <button className="h-11 bg-accent px-4 text-sm font-semibold text-paper">Add target</button>
        </form>
        {isLoading ? <div className="mt-4"><Skeleton rows={2}/></div> : targets.length === 0 ? (<p className="mt-4 text-sm text-muted">Set a number to aim for, like 40 problems or 8 lessons, then count up as you go.</p>) : (<ul className="mt-4 divide-y divide-line border-y border-line">
            {targets.map((t) => (<li key={t.id} className="grid gap-3 py-4 sm:grid-cols-[1fr_auto] sm:items-center sm:gap-8">
                <div>
                  <div className="flex items-baseline justify-between gap-3"><span className="font-semibold">{t.title}</span><span className="text-sm">{t.current} / {t.goal}</span></div>
                  <div className="mt-2"><Bar value={Math.round((100 * t.current) / t.goal)} label={t.title}/></div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => bump({ id: t.id, delta: -1 })} className={small} aria-label={`Decrease ${t.title}`}>-1</button>
                  <button onClick={() => bump({ id: t.id, delta: 1 })} className={small} aria-label={`Increase ${t.title}`}>+1</button>
                  <button onClick={() => delTarget(t.id)} className={`${small} text-muted`} aria-label={`Remove ${t.title}`}>Remove</button>
                </div>
              </li>))}
          </ul>)}
      </section>

      <section className="mt-12" aria-labelledby="tasks">
        <h2 id="tasks" className="text-xl font-semibold">Weekly tasks</h2>
        <form onSubmit={onItem} className="mt-3 flex flex-wrap gap-2">
          <input name="text" required maxLength={140} placeholder="Finish binary trees" aria-label="Task" className={`${field} min-w-0 flex-1 basis-56`}/>
          <select value={Math.min(week, weeks)} onChange={(e) => setWeek(Number(e.target.value))} aria-label="Week" className={field}>
            {Array.from({ length: weeks }, (_, i) => <option key={i} value={i + 1}>Week {i + 1}</option>)}
          </select>
          <button className="h-11 bg-accent px-4 text-sm font-semibold text-paper">Add task</button>
        </form>

        {isLoading ? <div className="mt-4"><Skeleton rows={3}/></div> : Array.from({ length: weeks }, (_, i) => i + 1).map((w) => {
            const list = items.filter((x) => x.week === w);
            return (<div key={w} className="mt-8">
              <h3 className="flex items-baseline justify-between border-b border-line pb-2 font-semibold">
                <span>Week {w}</span><span className="text-sm font-normal text-muted">{list.filter((x) => x.done).length} of {list.length} done</span>
              </h3>
              {list.length === 0 ? <p className="py-4 text-sm text-muted">Nothing planned for this week.</p> : (<ul className="mt-3 grid gap-3">
                  {list.map((i) => (<li key={i.id} className={`flex items-center gap-3 border px-3 ${i.done ? "border-line" : "pending border-accent"}`}>
                      <label className="flex min-h-12 flex-1 cursor-pointer items-center gap-3">
                        <input type="checkbox" checked={i.done} onChange={() => setItem({ id: i.id, done: !i.done })} className="size-5 accent-accent"/>
                        <span className={i.done ? "text-muted line-through" : "font-medium"}>{i.text}</span>
                      </label>
                      <button onClick={() => delItem(i.id)} className="py-3 text-sm text-muted hover:text-ink" aria-label={`Remove ${i.text}`}>Remove</button>
                    </li>))}
                </ul>)}
            </div>);
        })}
      </section>
    </div>);
}
