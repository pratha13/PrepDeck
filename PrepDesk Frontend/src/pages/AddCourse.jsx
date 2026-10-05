import { useState } from "react";
import Seo from "../components/Seo";
import { errMsg } from "../lib/err";
import { useAddCourseMutation } from "../store/dataApi";
const cats = ["DSA", "Web Development", "Java", "Python", "AI/ML", "Blockchain", "Cyber Security"];
const field = "w-full border border-line bg-transparent px-3 text-sm outline-none focus:border-accent";
export default function AddCourse() {
    const [add, { isLoading }] = useAddCourseMutation();
    const [error, setError] = useState("");
    const [done, setDone] = useState("");
    async function submit(e) {
        e.preventDefault();
        const form = e.currentTarget;
        const f = new FormData(form);
        setError("");
        setDone("");
        try {
            await add({
                title: String(f.get("title")), description: String(f.get("description")), category: String(f.get("category")),
                link: String(f.get("link")), lessons: String(f.get("lessons")).split("\n"),
            }).unwrap();
            form.reset();
            setDone("Course published. Students can find it under Courses.");
        }
        catch (err) {
            setError(errMsg(err));
        }
    }
    return (<div>
      <Seo title="Add course | PrepDeck" noindex/>
      <h1 className="font-serif text-3xl sm:text-4xl">Add a course</h1>
      <p className="mt-3 max-w-prose text-muted">Link to a free resource and break it into lessons. Students tick lessons off to track their progress.</p>
      <form onSubmit={submit} className="mt-8 grid max-w-xl gap-5">
        <label className="grid gap-1.5 text-sm font-semibold">Title
          <input name="title" required maxLength={120} className={`${field} h-11 font-normal`}/>
        </label>
        <label className="grid gap-1.5 text-sm font-semibold">Description
          <textarea name="description" required maxLength={400} rows={3} className={`${field} p-3 font-normal`}/>
        </label>
        <label className="grid gap-1.5 text-sm font-semibold">Category
          <select name="category" required defaultValue="" className={`${field} h-11 font-normal`}>
            <option value="" disabled>Choose a category</option>
            {cats.map((c) => <option key={c}>{c}</option>)}
          </select>
        </label>
        <label className="grid gap-1.5 text-sm font-semibold">Link to the free resource
          <input name="link" type="url" required placeholder="https://" className={`${field} h-11 font-normal`}/>
        </label>
        <label className="grid gap-1.5 text-sm font-semibold">Lessons, one per line
          <textarea name="lessons" required rows={6} placeholder={"Introduction\nArrays and strings\nRecursion"} className={`${field} p-3 font-normal`}/>
        </label>
        {error && <p role="alert" className="text-sm text-accent">{error}</p>}
        {done && <p role="status" className="text-sm">{done}</p>}
        <button disabled={isLoading} className="h-11 w-fit bg-accent px-5 text-sm font-semibold text-paper disabled:opacity-60">Publish course</button>
      </form>
    </div>);
}
