import { Link } from "react-router-dom";
import Seo from "../components/Seo";
import { SITE } from "../lib/site";
const UPDATED = "4 October 2026";
function Doc({ title, description, children }) {
    return (<main className="mx-auto max-w-2xl px-5 py-10 sm:py-14">
      <Seo title={`${title} | ${SITE.name}`} description={description}/>
      <Link to="/login" className="text-sm underline underline-offset-4">Back to sign in</Link>
      <h1 className="mt-6 font-serif text-4xl">{title}</h1>
      <p className="mt-2 text-sm text-muted">Last updated {UPDATED}</p>
      <div className="mt-8 grid gap-4 font-serif text-lg leading-8 [&_h2]:mt-6 [&_h2]:font-sans [&_h2]:text-xl [&_h2]:font-semibold [&_ul]:grid [&_ul]:list-disc [&_ul]:gap-1 [&_ul]:ps-6">{children}</div>
      <p className="mt-10 text-sm text-muted">Questions? Write to <a className="underline underline-offset-4" href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a>.</p>
    </main>);
}
export function Terms() {
    return (<Doc title="Terms of Service" description="The rules for using PrepDeck, a free placement preparation planner.">
      <p>{SITE.name} is a free study planner. By creating an account or using it, you agree to these terms. If you do not agree, please do not use it.</p>
      <h2>Your account</h2>
      <p>Give accurate details and keep your password private. You are responsible for what happens under your account. If you are under 18, use {SITE.name} with the knowledge of a parent or guardian.</p>
      <h2>Your content</h2>
      <p>Your diary, checklist and targets are visible only to you. Chat messages, course reviews and shared playlists are visible to other signed-in students, together with your name. You keep ownership of what you write, and you let us store and show it inside the app.</p>
      <p>Do not post anything unlawful, abusive, misleading or spammy, and do not share other people's private information. We may remove content or suspend accounts that break these rules.</p>
      <h2>Educators and outside resources</h2>
      <p>Educators are responsible for the courses they add and must have the right to link to what they share. Courses and playlists point to websites we do not control. We cannot promise they are accurate, free or always available.</p>
      <h2>No guarantees</h2>
      <p>{SITE.name} is provided as it is. It helps you organise your preparation, but we do not promise any placement, job or exam result, and we are not liable for losses that come from using it.</p>
      <h2>Ending your use</h2>
      <p>You can stop using {SITE.name} at any time and ask us to delete your account. We may change or end the service, and we will update this page when these terms change.</p>
    </Doc>);
}
export function Privacy() {
    return (<Doc title="Privacy Policy" description="What PrepDeck collects, why, who can see it, and how to have it deleted.">
      <p>This page explains what {SITE.name} collects and how it is used.</p>
      <h2>What we collect</h2>
      <ul>
        <li>Account details: your name, email address, whether you are a student or educator, and a hashed version of your password. We never store your password itself.</li>
        <li>If you sign in with Google, GitHub or LinkedIn: your name, verified email address and profile picture from that service.</li>
        <li>What you create: course progress, checklist items and targets, diary entries, chat messages, course reviews, playlist ratings and playlists you share.</li>
      </ul>
      <h2>How it is used</h2>
      <p>Only to run the app: sign you in, keep your progress, show shared content to other students, and send account emails such as email confirmation. We do not sell your data, and the app does not use advertising or analytics trackers.</p>
      <h2>Who can see it</h2>
      <p>Your diary, checklist, targets and progress are private to you. Messages, reviews, ratings and playlists you share are visible to signed-in students with your name. Service providers that host our servers, database and email handle data for us only to provide the service.</p>
      <h2>Cookies and browser storage</h2>
      <p>We use one sign-in cookie that scripts on the page cannot read, and browser storage to remember your light or dark theme and account type. Fonts load from Google Fonts, so Google receives your IP address when a page loads.</p>
      <h2>Keeping and deleting data</h2>
      <p>We keep your data while your account exists. To have your account and its content deleted, email us and we will do it.</p>
      <h2>Security</h2>
      <p>Passwords are hashed, the sign-in cookie is protected, and requests are rate limited. No system is perfectly secure, so please choose a strong, unique password.</p>
      <h2>Changes</h2>
      <p>If this policy changes, we will update the date at the top of this page.</p>
    </Doc>);
}