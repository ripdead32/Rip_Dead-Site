// LOAD NAVBAR INTO EVERY PAGE
fetch("/components/navbar.html")
  .then(res => res.text())
  .then(data => {
    const nav = document.createElement("div");
    nav.innerHTML = data;
    document.body.prepend(nav);

    initNavbar(); // activate buttons AFTER load
  });


// THEME TOGGLE
function initNavbar(){
  const btn = document.getElementById("themeToggle");

  if(!btn) return;

  btn.addEventListener("click", () => {
    document.body.classList.toggle("light");
    btn.textContent = document.body.classList.contains("light") ? "🌙" : "☀️";
  });
}


// VOIDUI TRANSITIONS
window.addEventListener("DOMContentLoaded", () => {
  document.body.classList.add("void-enter");
});

document.addEventListener("click", function(e){
  const link = e.target.closest("a");

  if(link && link.href && link.target !== "_blank"){
    e.preventDefault();

    document.body.classList.add("void-exit");

    setTimeout(() => {
      window.location = link.href;
    }, 500);
  }
});

// CONSOLE WARNING
console.log(
  "%cSTOP! DO NOT INSERT ANYTHING HERE! IT COULD BREAK THE SITE!",
  "color:#fff; background:#a855f7; font-size:16px; padding:5px; border-radius:5px;"
);