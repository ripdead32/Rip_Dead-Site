
"use strict";

window.RDModrinth = (() => {
    const API = "https://api.modrinth.com/v2";

    const LOADER_NAMES = {
        fabric: "Fabric",
        forge: "Forge",
        neoforge: "NeoForge",
        quilt: "Quilt"
    };

    const CATEGORY_NAMES = {
        adventure: "Adventure",
        cursed: "Cursed",
        decoration: "Decoration",
        economy: "Economy",
        equipment: "Equipment",
        food: "Food",
        game_mechanics: "Game Mechanics",
        library: "Library",
        magic: "Magic",
        management: "Management",
        minigame: "Minigame",
        mobs: "Mobs",
        optimization: "Optimization",
        social: "Social",
        storage: "Storage",
        technology: "Technology",
        transportation: "Transportation",
        utility: "Utility",
        worldgen: "World Generation"
    };

    function normalize(item) {
        const id = item.project_id || item.projectId || item.id;
        const slug = item.slug || id;

        return {
            key: "modrinth:" + id,
            id,
            title: item.title || item.name || "Untitled mod",
            author: item.author || "Unknown author",
            description: item.description || "",
            icon: item.icon_url || item.icon || "",
            downloads: Number(item.downloads) || 0,
            updated: item.date_modified || item.updated || "",
            categories: (item.display_categories || item.categories || [])
                .map(category => CATEGORY_NAMES[category] || category),
            versions: item.versions || [],
            loaders: item.loaders || [],
            platforms: {
                modrinth: {
                    url: "https://modrinth.com/mod/" + encodeURIComponent(slug)
                }
            }
        };
    }

    async function search(options = {}) {
        const query = String(options.query || "").trim();
        const version = String(options.version || options.gameVersion || "");
        const loader = String(options.loader || "").toLowerCase();
        const category = String(options.category || "");
        const sort = String(options.sort || "relevance");

        const offset = Math.max(0, Number(options.offset) || 0);
        const limit = Math.min(100, Math.max(1, Number(options.limit) || 24));

        const facets = [];

        if (loader && LOADER_NAMES[loader]) {
            facets.push([`categories:${loader}`]);
        }

        if (version) {
            facets.push([`versions:${version}`]);
        }

        if (category) {
            const rawCategory = Object.keys(CATEGORY_NAMES).find(
                key => CATEGORY_NAMES[key].toLowerCase() === category.toLowerCase()
            ) || category.toLowerCase().replace(/\s+/g, "_");

            facets.push([`categories:${rawCategory}`]);
        }

        const params = new URLSearchParams({
            limit: String(limit),
            offset: String(offset),
            index: sort === "downloads" ? "downloads"
                : sort === "updated" ? "updated"
                : "relevance"
        });

        if (query) params.set("query", query);
        if (facets.length) params.set("facets", JSON.stringify(facets));

        const response = await fetch(
            `${API}/search?${params.toString()}`,
            {
                headers: {
                    "Accept": "application/json"
                }
            }
        );

        if (!response.ok) {
            throw new Error(
                `Modrinth returned HTTP ${response.status}. Please try again.`
            );
        }

        const payload = await response.json();
        const hits = Array.isArray(payload.hits) ? payload.hits : [];

        return {
            mods: hits.map(normalize),
            total: Number(payload.total) || 0,
            hasMore: offset + hits.length < (Number(payload.total) || 0)
        };
    }

    return Object.freeze({
        search,
        normalize
    });
})();
