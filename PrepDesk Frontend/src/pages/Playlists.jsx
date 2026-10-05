import { useState } from "react";
import Skeleton from "../components/Skeleton";
import Stars from "../components/Stars";
import { errMsg } from "../lib/err";
import { usePlaylistsQuery, useAddPlaylistMutation, useDelPlaylistMutation, useRateMutation } from "../store/dataApi";
const cats = ["DSA", "Web Development", "Java", "Python", "AI/ML", "Blockchain", "Cyber Security"];
const field = "h-11 border border-line bg-transparent px-3 text-sm outline-none focus:border-accent";
export default function Playlists() {
    const [cat, setCat] = useState("All");
    const [error, setError] = useState("");
    const { data, isLoading } = usePlaylistsQuery(cat);
    const [add, { isLoading: adding }] = useAddPlaylistMutation();
    const [del] = useDelPlaylistMutation();
    const [rate] = useRateMutation();
    const list = data?.playlists ?? [];
    async function submit(e) {
        e.preventDefault();
        const form = e.currentTarget;
        const f = new FormData(form);
        setError("");
        try {
            await add({ title: String(f.get("title")), url: String(f.get("url")), category: String(f.get("category")) }).unwrap();
            form.reset();
        }
        catch (err) {
            setError(errMsg(err));
        }
    }
    return (<div className="mt-5">
      <details className="border border-line bg-surface p-4">
        <summary className="cursor-pointer text-sm font-semibold">Share a YouTube playlist</summary>
        <form onSubmit={submit} className="mt-4 grid gap-3 sm:grid-cols-2">
          <input name="title" required maxLength={100} placeholder="Playlist title" aria-label="Playlist title" className={field}/>
          <select name="category" required defaultValue="" aria-label="Category" className={field}>
            <option value="" disabled>Choose a category</option>
            {cats.map((c) => <option key={c}>{c}</option>)}
          </select>
          <input name="url" required type="url" placeholder="https://www.youtube.com/playlist?list=..." aria-label="Playlist link" className={`${field} sm:col-span-2`}/>
          {error && <p role="alert" className="text-sm text-accent sm:col-span-2">{error}</p>}
          <button disabled={adding} className="h-11 bg-accent px-4 text-sm font-semibold text-paper disabled:opacity-60 sm:w-fit">Add playlist</button>
        </form>
      </details>

      <div className="-mx-4 mt-5 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:px-0">
        {["All", ...cats].map((c) => (<button key={c} onClick={() => setCat(c)} aria-pressed={cat === c} className={`shrink-0 border px-3 py-1.5 text-sm ${cat === c ? "border-accent bg-accent text-paper" : "border-line hover:border-accent"}`}>{c}</button>))}
      </div>

      <div className="mt-4">
        {isLoading ? <Skeleton /> : list.length === 0 ? (<p className="py-10 text-muted">No playlists here yet. Share one you have learned from and rate others.</p>) : (<ol className="divide-y divide-line border-y border-line">
            {list.map((p, i) => (<li key={p.id} className="grid gap-3 py-5 sm:grid-cols-[2rem_1fr_auto] sm:gap-5">
                <span className="hidden text-muted sm:block">{i + 1}</span>
                <div className="min-w-0">
                  <h2 className="font-semibold">{p.title}</h2>
                  <p className="mt-1 text-xs text-muted">{p.category}, {p.ratings ? `${p.rating} out of 5 from ${p.ratings} ${p.ratings === 1 ? "rating" : "ratings"}` : "not rated yet"}</p>
                  <div className="mt-2 flex gap-4 text-sm">
                    <a href={p.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">Watch on YouTube</a>
                    {p.canDelete && <button onClick={() => del(p.id)} className="text-muted hover:text-ink">Remove</button>}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted">{p.mine ? "Your rating" : "Rate it"}</p>
                  <Stars value={p.mine} label={`Rate ${p.title}`} onRate={(n) => rate({ kind: "playlist", target: p.id, rating: n })}/>
                </div>
              </li>))}
          </ol>)}
      </div>
    </div>);
}
