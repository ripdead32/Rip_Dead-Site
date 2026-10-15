/* Modrinth public API adapter. No API key required. */
(() => {
"use strict";
const API="https://api.modrinth.com/v2";
const loaders=["fabric","forge","neoforge","quilt"];
function projectUrl(hit){return "https://modrinth.com/mod/"+encodeURIComponent(hit.slug||hit.project_id)}
function mapHit(h){
 const cats=[...(h.categories||[]),...(h.display_categories||[])];
 return {key:"title:"+String(h.title||h.project_id).toLowerCase(),title:h.title||"Untitled mod",description:h.description||"",author:h.author||"Unknown author",icon:h.icon_url||"",downloads:Number(h.downloads)||0,updated:h.date_modified||"",categories:[...new Set(cats)],versions:h.versions||[],loaders:loaders.filter(l=>cats.includes(l)),platforms:{modrinth:{url:projectUrl(h),projectId:h.project_id,slug:h.slug}}};
}
async function search(opts){
 const facets=[["project_type:mod"]];
 if(opts.version)facets.push(["versions:"+opts.version]);
 if(opts.loader)facets.push(["categories:"+opts.loader]);
 if(opts.category)facets.push(["categories:"+opts.category]);
 const sortMap={relevance:"relevance",downloads:"downloads",updated:"updated"};
 const p=new URLSearchParams({query:opts.query||"",limit:String(opts.limit||24),offset:String(opts.offset||0),index:sortMap[opts.sort]||"relevance",facets:JSON.stringify(facets)});
 const response=await fetch(API+"/search?"+p.toString(),{headers:{"Accept":"application/json"}});
 if(!response.ok)throw new Error("Modrinth API returned HTTP "+response.status+".");
 const data=await response.json();
 return {mods:(data.hits||[]).map(mapHit),total:data.total_hits||0,hasMore:(opts.offset||0)+(data.hits||[]).length<(data.total_hits||0)};
}
window.RDModrinth={search};
})();
