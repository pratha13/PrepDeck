import { useState } from "react";
import { Link } from "react-router-dom";
import Seo from "../components/Seo";
import Skeleton from "../components/Skeleton";
import { errMsg } from "../lib/err";
import { useMyCoursesQuery, useRemoveCourseMutation } from "../store/dataApi";
export default function RemoveCourse() {
    const { data, isLoading } = useMyCoursesQuery();
    const [remove, { isLoading: removing }] = useRemoveCourseMutation();
    const [confirm, setConfirm] = useState("");
    const [error, setError] = useState("");
    const list = data?.courses ?? [];
    async function go(id) {
        setError("");
        try {
            await remove(id).unwrap();
            setConfirm("");
        }
        catch (err) {
            setError(errMsg(err));
        }
    }
    return (<div>
      <Seo title="Remove course | PrepDeck" noindex/>
      <h1 className="font-serif text-3xl sm:text-4xl">Remove a course</h1>
      <p className="mt-3 max-w-prose text-muted">You can remove courses you added. Starter courses are managed by PrepDeck.</p>
      {error && <p role="alert" className="mt-4 text-sm text-accent">{error}</p>}
      <div className="mt-6">
        {isLoading ? <Skeleton rows={3}/> : list.length === 0 ? (<p className="py-8 text-muted">You have not added any courses yet. <Link to="/educator/add" className="underline underline-offset-4">Add your first course</Link>.</p>) : (<ul className="divide-y divide-line border-y border-line">
            {list.map((c) => (<li key={c.id} className="py-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="font-semibold">{c.title}</h2>
                    <p className="mt-1 text-xs text-muted">{c.category}, {c.lessonCount} lessons, {c.students} {c.students === 1 ? "student" : "students"} following</p>
                  </div>
                  {confirm !== c.id && <button onClick={() => setConfirm(c.id)} className="h-10 border border-line px-4 text-sm hover:border-accent">Remove</button>}
                </div>
                {confirm === c.id && (<div className="mt-4 border border-accent p-4" role="alertdialog" aria-label={`Confirm removing ${c.title}`}>
                    <p className="text-sm">This deletes the course and its reviews, and students lose their progress in it. This cannot be undone.</p>
                    <div className="mt-3 flex gap-3">
                      <button autoFocus disabled={removing} onClick={() => go(c.id)} className="h-10 bg-accent px-4 text-sm font-semibold text-paper disabled:opacity-60">Remove for good</button>
                      <button onClick={() => setConfirm("")} className="h-10 border border-line px-4 text-sm">Keep course</button>
                    </div>
                  </div>)}
              </li>))}
          </ul>)}
      </div>
    </div>);
}
