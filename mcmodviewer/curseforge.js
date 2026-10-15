/*
 * CurseForge API adapter.
 *
 * Configure a same-origin/server-side proxy in CURSEFORGE_PROXY below.
 * Your CurseForge API key must be stored on that server, never in this file.
 *
 * Expected proxy contract:
 * GET /api/curseforge/mods?query=&version=&loader=&category=&sort=&offset=&limit=
 * JSON response: { data: [CurseForge API mod objects], pagination: { totalCount: number } }
 * The proxy should apply Minecraft game ID 432 and the relevant search filters.
 */
(() => {
"use strict";
const CURSEFORGE_PROXY="/api/curseforge/mods";
const loaderIds={forge:1,fabric:4,neoforge:6,quilt:5};
function mapMod(m){
 const cats=(m.categories||[]).map(c=>c.name).filter(Boolean);
 const files=m.latestFilesIndexes||[];
 const versions=[...new Set(files.map(f=>f.gameVersion).filter(Boolean))];
 const loaders=[...new Set(files.map(f=>String(f.modLoader||"").toLowerCase()))].filter(x=>["fabric","forge","neoforge","quilt"].includes(x));
 return {key:"title:"+String(m.name||m.id).toLowerCase(),title:m.name||"Untitled mod",description:m.summary||"",author:m.authors?.[0]?.name||"Unknown author",icon:m.logo?.url||"",downloads:Number(m.downloadCount)||0,updated:m.dateModified||"",categories:cats,versions,loaders,platforms:{curseforge:{url:m.links?.websiteUrl||("https://www.curseforge.com/minecraft/mc-mods/"+encodeURIComponent(m.slug||m.id)),projectId:m.id,slug:m.slug}}};
}
async function search(opts){
 if(!CURSEFORGE_PROXY)throw new Error("CurseForge is not configured. Add a secure server-side proxy to enable it.");
 const p=new URLSearchParams({query:opts.query||"",version:opts.version||"",loader:opts.loader||"",category:opts.category||"",sort:opts.sort||"relevance",offset:String(opts.offset||0),limit:String(opts.limit||24)});
 const r=await fetch(CURSEFORGE_PROXY+"?"+p,{headers:{"Accept":"application/json"}});
 if(!r.ok)throw new Error("CurseForge proxy returned HTTP "+r.status+".");
 const body=await r.json(),mods=(body.data||[]).map(mapMod),total=Number(body.pagination?.totalCount)||mods.length;
 return {mods,total,hasMore:(opts.offset||0)+mods.length<total};
}
window.RDCurseForge={search};
})();
