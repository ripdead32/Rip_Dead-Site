
(() => {
    "use strict";

    const API_URL =
        "https://ripdead-curseforge-api.ripdead890.workers.dev/search";

    const LOADER_TYPES = {
        forge: 1,
        fabric: 4,
        quilt: 5,
        neoforge: 6
    };

    async function search(options = {}) {
        const params = new URLSearchParams({
            query: options.query || "",
            index: String(options.index ?? 0),
            pageSize: String(options.pageSize ?? 24)
        });

        if (options.gameVersion) {
            params.set("gameVersion", options.gameVersion);
        }

        const loader = String(options.loader || "").toLowerCase();

        if (LOADER_TYPES[loader] !== undefined) {
            params.set("modLoaderType", String(LOADER_TYPES[loader]));
        }

        const response = await fetch(`${API_URL}?${params}`);

        if (!response.ok) {
            throw new Error(
                `CurseForge request failed (${response.status})`
            );
        }

        const result = await response.json();

        if (!Array.isArray(result.data)) {
            throw new Error(
                result.error || "Invalid CurseForge API response"
            );
        }

        return {
            mods: result.data.map(mod => ({
                id: `curseforge:${mod.id}`,
                projectId: String(mod.id),
                title: mod.name || "Unknown mod",
                description: mod.summary || "",
                author: mod.authors?.[0]?.name || "Unknown",
                icon: mod.logo?.url || "",
                downloads: mod.downloadCount || 0,
                updated: mod.dateModified || "",
                url: mod.links?.websiteUrl ||
                    `https://www.curseforge.com/minecraft/mc-mods/${mod.slug}`,
                platform: "curseforge",
                source: "CurseForge",
                categories: (mod.categories || []).map(c => c.name),
                versions: (mod.latestFilesIndexes || [])
                    .map(f => f.gameVersion)
                    .filter(Boolean)
            })),
            total: result.pagination?.totalCount || 0
        };
    }

    window.CurseForgeAPI = { search };
})();
