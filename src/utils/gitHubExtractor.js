function headers() {
    const h = { Accept: "application/vnd.github.v3+json", "User-Agent": "top-langs-script" };
    if (process.env.GITHUB_TOKEN) h.Authorization = `token ${process.env.GITHUB_TOKEN}`;
    return h;
}

async function fetchJson(url) {
    const res = await fetch(url, { headers: headers() });
    if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText} for ${url}`);
    return res.json();
}

async function listUserRepos(username) {
    const perPage = 100;
    let page = 1;
    const all = [];
    while (true) {
        const url = `https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=${perPage}&page=${page}`;
        const data = await fetchJson(url);
        if (!Array.isArray(data) || data.length === 0) break;
        all.push(...data);
        if (data.length < perPage) break;
        page++;
    }
    return all;
}

async function getRepoLanguages(owner, repo) {
    const url = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/languages`;
    return fetchJson(url);
}

export const analyzeUser = async (username) => {
    const repos = await listUserRepos(username);
    if (repos.length === 0) return "";

    const allLangs = new Set();

    for (const r of repos) {
        try {
            const langs = await getRepoLanguages(r.owner.login, r.name);
            for (const lang of Object.keys(langs)) {
                allLangs.add(lang);
            }
        } catch {
            throw new Error(`Failed to fetch languages for ${r.owner.login}/${r.name}`);
        }
    }

    return Array.from(allLangs).join(", ");
}