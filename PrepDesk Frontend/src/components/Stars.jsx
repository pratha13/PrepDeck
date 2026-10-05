const pts = "12,2.5 14.9,8.9 21.8,9.6 16.6,14.3 18.1,21.2 12,17.7 5.9,21.2 7.4,14.3 2.2,9.6 9.1,8.9";
export default function Stars({ value, label, onRate, size = 18 }) {
    const shown = Math.round(value);
    return (<div className="flex items-center" role={onRate ? "group" : "img"} aria-label={onRate ? label : `${label}: ${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((n) => {
            const on = n <= shown;
            const star = <svg width={size} height={size} viewBox="0 0 24 24" fill={on ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" aria-hidden="true"><polygon points={pts}/></svg>;
            return onRate ? (<button key={n} type="button" onClick={() => onRate(n)} aria-label={`${n} ${n === 1 ? "star" : "stars"}`} aria-pressed={n === shown} className={`grid size-10 place-items-center hover:text-accent ${on ? "text-accent" : "text-muted"}`}>{star}</button>) : <span key={n} className={on ? "text-accent" : "text-muted"}>{star}</span>;
        })}
    </div>);
}
