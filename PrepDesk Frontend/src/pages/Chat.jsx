import { useEffect, useRef, useState } from "react";
import Skeleton from "../components/Skeleton";
import Stars from "../components/Stars";
import { errMsg } from "../lib/err";
import { useMessagesQuery, useSendMutation, useDelMessageMutation, useReviewsQuery, useRateMutation, useDelReviewMutation, useCoursesQuery, } from "../store/dataApi";
const rooms = ["General", "DSA", "Web Development", "Java", "Python", "AI/ML", "Blockchain", "Cyber Security"];
const field = "h-11 border border-line bg-transparent px-3 text-sm outline-none focus:border-accent";
const tab = (on) => `border-b-2 px-1 pb-2 text-sm ${on ? "border-accent text-ink" : "border-transparent text-muted hover:text-ink"}`;
const time = (s) => new Date(s).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
function ChatTab() {
    const [room, setRoom] = useState("General");
    const [error, setError] = useState("");
    const { data } = useMessagesQuery(room, { pollingInterval: 4000, skipPollingIfUnfocused: true });
    const [send, { isLoading }] = useSendMutation();
    const [del] = useDelMessageMutation();
    const box = useRef(null);
    const stick = useRef(true);
    const msgs = data?.messages ?? [];
    useEffect(() => { stick.current = true; }, [room]);
    useEffect(() => { const el = box.current; if (el && stick.current)
        el.scrollTop = el.scrollHeight; }, [msgs.length, room, data]);
    async function submit(e) {
        e.preventDefault();
        const form = e.currentTarget;
        const text = String(new FormData(form).get("text") ?? "").trim();
        if (!text)
            return;
        setError("");
        try {
            await send({ room, text }).unwrap();
            form.reset();
            stick.current = true;
        }
        catch (err) {
            setError(errMsg(err));
        }
    }
    return (<div className="mt-5">
      <label className="text-sm text-muted" htmlFor="room">Room</label>
      <select id="room" value={room} onChange={(e) => setRoom(e.target.value)} className={`${field} ml-3`}>{rooms.map((r) => <option key={r}>{r}</option>)}</select>
      <div ref={box} role="log" aria-live="polite" aria-label={`${room} messages`} onScroll={(e) => { const el = e.currentTarget; stick.current = el.scrollHeight - el.scrollTop - el.clientHeight < 120; }} className="mt-4 h-[52dvh] min-h-72 overflow-y-auto border border-line bg-surface p-4">
        {!data ? <Skeleton rows={3}/> : msgs.length === 0 ? (<p className="text-muted">No messages yet. Say hello and ask what others are studying.</p>) : (<ul className="grid gap-4">
            {msgs.map((m) => (<li key={m.id}>
                <p className="text-sm"><span className="font-semibold">{m.mine ? "You" : m.user}</span> <span className="text-muted">{time(m.createdAt)}</span>
                  {m.mine && <button onClick={() => del(m.id)} className="ml-3 text-muted hover:text-ink" aria-label="Delete your message">Delete</button>}</p>
                <p className="mt-0.5 whitespace-pre-wrap break-words">{m.text}</p>
              </li>))}
          </ul>)}
      </div>
      <form onSubmit={submit} className="mt-3 flex gap-2">
        <input name="text" required maxLength={500} autoComplete="off" placeholder={`Message ${room}`} aria-label="Message" className={`${field} min-w-0 flex-1`}/>
        <button disabled={isLoading} className="h-11 bg-accent px-5 text-sm font-semibold text-paper disabled:opacity-60">Send</button>
      </form>
      {error && <p role="alert" className="mt-2 text-sm text-accent">{error}</p>}
    </div>);
}
function ReviewsTab() {
    const [filter, setFilter] = useState("");
    const [courseId, setCourseId] = useState("");
    const [stars, setStars] = useState(0);
    const [error, setError] = useState("");
    const courses = useCoursesQuery();
    const { data, isLoading } = useReviewsQuery(filter);
    const [rate, { isLoading: posting }] = useRateMutation();
    const [del] = useDelReviewMutation();
    const list = courses.data?.courses ?? [];
    async function submit(e) {
        e.preventDefault();
        const form = e.currentTarget;
        if (!courseId)
            return setError("Choose a course to review");
        if (!stars)
            return setError("Choose a star rating");
        setError("");
        try {
            await rate({ kind: "course", target: courseId, rating: stars, text: String(new FormData(form).get("text") ?? "") }).unwrap();
            form.reset();
            setStars(0);
        }
        catch (err) {
            setError(errMsg(err));
        }
    }
    return (<div className="mt-5">
      <form onSubmit={submit} className="grid gap-3 border border-line bg-surface p-4 sm:p-5">
        <h2 className="text-lg font-semibold">Review a course</h2>
        <select value={courseId} onChange={(e) => setCourseId(e.target.value)} aria-label="Course" className={field}>
          <option value="">Choose a course</option>
          {list.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
        </select>
        <Stars value={stars} label="Your rating" onRate={setStars} size={22}/>
        <textarea name="text" maxLength={500} rows={3} placeholder="What worked, what did not, who is it for?" aria-label="Your review" className="border border-line bg-transparent p-3 text-sm outline-none focus:border-accent"/>
        {error && <p role="alert" className="text-sm text-accent">{error}</p>}
        <button disabled={posting} className="h-11 bg-accent px-4 text-sm font-semibold text-paper disabled:opacity-60 sm:w-fit">Post review</button>
        <p className="text-xs text-muted">One review per course. Posting again replaces your earlier one.</p>
      </form>

      <div className="mt-8 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Recent reviews</h2>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Filter by course" className={field}>
          <option value="">All courses</option>
          {list.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
        </select>
      </div>
      <div className="mt-3">
        {isLoading ? <Skeleton rows={3}/> : (data?.reviews.length ?? 0) === 0 ? (<p className="py-8 text-muted">No reviews yet. Be the first to tell others what a course is like.</p>) : (<ul className="divide-y divide-line border-y border-line">
            {data.reviews.map((r) => (<li key={r.id} className="py-4">
                <div className="flex flex-wrap items-center justify-between gap-2"><span className="font-semibold">{r.targetTitle}</span><Stars value={r.rating} label={`${r.user}'s rating`} size={16}/></div>
                {r.text && <p className="mt-2 whitespace-pre-wrap break-words text-sm">{r.text}</p>}
                <p className="mt-2 text-xs text-muted">{r.mine ? "You" : r.user}, {new Date(r.createdAt).toLocaleDateString()}
                  {r.mine && <button onClick={() => del(r.id)} className="ml-3 hover:text-ink">Remove</button>}</p>
              </li>))}
          </ul>)}
      </div>
    </div>);
}
export default function Chat() {
    const [view, setView] = useState("chat");
    return (<div>
      <h1 className="font-serif text-3xl sm:text-4xl">Student chat</h1>
      <div className="mt-6 flex gap-6 border-b border-line" role="tablist">
        <button role="tab" aria-selected={view === "chat"} onClick={() => setView("chat")} className={tab(view === "chat")}>Chat</button>
        <button role="tab" aria-selected={view === "reviews"} onClick={() => setView("reviews")} className={tab(view === "reviews")}>Course reviews</button>
      </div>
      {view === "chat" ? <ChatTab /> : <ReviewsTab />}
    </div>);
}
