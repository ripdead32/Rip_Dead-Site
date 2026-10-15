/* In-page mod inspector and cross-platform listing comparison. */
(() => {
"use strict";
const $=s=>document.querySelector(s);
const names={modrinth:"Modrinth",curseforge:"CurseForge"};
const logo={modrinth:"./modrinth.png",curseforge:"./curseforge.png"};
function safeUrl(value){try{const u=new URL(value);return ["https:","http:"].includes(u.protocol)?u.href:"#"}catch{return "#"}}
function text(el,value){el.textContent=String(value||"")}
function addBadge(parent,label,platform){const b=document.createElement("span");b.className="badge"+(platform?" "+platform:"");if(platform){const img=document.createElement("img");img.src=logo[platform];img.alt="";b.append(img)}b.append(document.createTextNode(label));parent.append(b)}
function open(mod){
 const overlay=$("#details-overlay");overlay.hidden=false;document.body.style.overflow="hidden";
 const icon=$("#detail-icon");icon.src=mod.icon||"";icon.hidden=!mod.icon;icon.onerror=()=>icon.hidden=true;
 text($("#detail-title"),mod.title);text($("#detail-author"),"by "+(mod.author||"Unknown author"));text($("#detail-description"),mod.description||"No description supplied by the platform.");
 const badges=$("#detail-badges");badges.replaceChildren();for(const p of Object.keys(mod.platforms||{}))addBadge(badges,names[p]||p,p);
 const platforms=$("#detail-platforms");platforms.replaceChildren();
 for(const p of ["modrinth","curseforge"]){const item=mod.platforms?.[p];if(!item)continue;const row=document.createElement("div");row.className="platformrow";const left=document.createElement("div");const strong=document.createElement("strong");strong.textContent=names[p];const small=document.createElement("small");small.textContent=item.projectId?"Project ID: "+item.projectId:"Listing available";left.append(strong,small);const a=document.createElement("a");a.href=safeUrl(item.url);a.target="_blank";a.rel="noopener noreferrer";a.textContent="Open listing ↗";row.append(left,a);platforms.append(row)}
 const compare=$("#detail-compare");compare.replaceChildren();const table=document.createElement("table");table.className="compare";const thead=document.createElement("thead"),tr=document.createElement("tr");["Property","Value"].forEach(v=>{const th=document.createElement("th");th.textContent=v;tr.append(th)});thead.append(tr);const tbody=document.createElement("tbody");
 const rows=[["Downloads",(Number(mod.downloads)||0).toLocaleString()],["Last updated",mod.updated?new Date(mod.updated).toLocaleDateString():"Not supplied"],["Platforms",Object.keys(mod.platforms||{}).map(p=>names[p]).join(", ")||"None"]];
 rows.forEach(([k,v])=>{const tr=document.createElement("tr");const a=document.createElement("td"),b=document.createElement("td");a.textContent=k;b.textContent=v;tr.append(a,b);tbody.append(tr)});table.append(thead,tbody);compare.append(table);
 const compat=$("#detail-compat");const lines=[];lines.push("Minecraft versions: "+((mod.versions||[]).join(", ")||"Not supplied by search metadata"));lines.push("Loaders: "+((mod.loaders||[]).map(l=>l==="neoforge"?"NeoForge":l[0]?.toUpperCase()+l.slice(1)).join(", ")||"Not supplied by search metadata"));lines.push("Compatibility depends on the exact release file. Confirm the release details on the platform before installing.");text(compat,lines.join("\n"));
 const cats=$("#detail-categories");cats.replaceChildren();(mod.categories||[]).forEach(c=>addBadge(cats,c));
 $("#close-details").focus();
}
function close(){const overlay=$("#details-overlay");overlay.hidden=true;document.body.style.overflow=""}
window.RDModDetails={open,close};
})();
