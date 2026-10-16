
const GAME_ID_MINECRAFT = 432;

const LOADER_TYPES = {
    forge: 1,
    fabric: 4,
    quilt: 5,
    neoforge: 6
};

const SORT_FIELDS = {
    relevance: 2,
    downloads: 6,
    updated: 3
};

export async function onRequestGet({ request, env }) {
    const apiKey = env.CURSEFORGE_API_KEY;

    if (!apiKey) {
        return json({
            error: "CurseForge API key is not configured on the server."
        }, 500);
    }

    const incoming = new URL(request.url);
    const query = incoming.searchParams;

    const searchFilter = (query.get("query") || "").trim().slice(0, 200);
    const gameVersion = (query.get("gameVersion") || "").trim();
    const loader = (query.get("loader") || "").toLowerCase();
    const sort = (query.get("sort") || "relevance").toLowerCase();

    const offset = Math.max(
        0,
        Math.min(9999, Number.parseInt(query.get("offset") || "0", 10) || 0)
    );

    const pageSize = Math.max(
        1,
        Math.min(50, Number.parseInt(query.get("limit") || "24", 10) || 24)
    );

    const params = new URLSearchParams({
        gameId: String(GAME_ID_MINECRAFT),
        classId: "6",
        index: String(offset),
        pageSize: String(pageSize),
        sortField: String(SORT_FIELDS[sort] || SORT_FIELDS.relevance),
        sortOrder: "desc"
    });

    if (searchFilter) {
        params.set("searchFilter", searchFilter);
    }

    if (gameVersion) {
        params.set("gameVersion", gameVersion);
    }

    if (LOADER_TYPES[loader]) {
        // CurseForge requires a game version for loader-specific searches.
        if (gameVersion) {
            params.set("modLoaderType", String(LOADER_TYPES[loader]));
        }
    }

    try {
        const upstream = await fetch(
            `https://api.curseforge.com/v1/mods/search?${params}`,
            {
                headers: {
                    "Accept": "application/json",
                    "x-api-key": apiKey
                }
            }
        );

        if (!upstream.ok) {
            const details = await upstream.text();

            console.error(
                "CurseForge API error:",
                upstream.status,
                details.slice(0, 500)
            );

            return json({
                error: upstream.status === 403
                    ? "CurseForge rejected the API key or the application is not authorized."
                    : `CurseForge API returned HTTP ${upstream.status}.`
            }, upstream.status === 429 ? 429 : 502);
        }

        const payload = await upstream.json();

        const mods = Array.isArray(payload.data) ? payload.data : [];

        return json({
            data: mods,
            pagination: payload.pagination || {
                index: offset,
                pageSize,
                resultCount: mods.length,
                totalCount: mods.length
            }
        });
    } catch (error) {
        console.error("CurseForge request failed:", error);

        return json({
            error: "Could not connect to CurseForge."
        }, 502);
    }
}

function json(data, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Cache-Control": "public, max-age=60",
            "X-Content-Type-Options": "nosniff"
        }
    });
}
