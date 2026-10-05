export default function Skeleton({ rows = 4 }) {
    return (<div className="divide-y divide-line border-y border-line" aria-busy="true" aria-label="Loading">
      {Array.from({ length: rows }, (_, i) => (<div key={i} className="grid animate-pulse gap-2 py-5">
          <div className="h-4 w-2/5 bg-line/60"/>
          <div className="h-3 w-4/5 bg-line/40"/>
          <div className="h-3 w-1/4 bg-line/40"/>
        </div>))}
    </div>);
}
