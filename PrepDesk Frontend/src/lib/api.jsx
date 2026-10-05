export async function api(path, init = {}) {
    const res = await fetch(`/api${path}`, { credentials: "include", headers: { "Content-Type": "application/json" }, ...init });
    const data = await res.json().catch(() => ({}));
    if (!res.ok)
        throw new Error(data.error || "Request failed");
    return data;
}
