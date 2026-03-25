const app = document.getElementById("app");
const layout = document.getElementById("layout"); // the wrapper we just added

const routes = {
    "/": "main",
    "/leaderboards": "leaderboards",
    "/news": "news",
    "/play": "play" // NEW route
};

async function loadPage(name) {
    const res = await fetch(`/pages/${name}.html`);
    app.innerHTML = await res.text();
}

function navigate(path, push = true) {
    const page = routes[path] || "main";

    const isPlay = path === "/play";

    // ✅ Step 2a: toggle layout visibility
    layout.style.display = isPlay ? "none" : "";

    // ✅ Step 2b: toggle fullscreen mode on #app
    document.body.classList.toggle("play-mode", isPlay);

    loadPage(page);

    if (push) {
        history.pushState({ page }, "", path);
    }

    setActiveLink(path);
}

function setActiveLink(path) {
    document.querySelectorAll(".nav a").forEach(a => {
        a.classList.toggle("active", a.getAttribute("href") === path);
    });
}

// click navigation
function setupNav() {
    document.querySelectorAll(".nav a").forEach(a => {
        a.addEventListener("click", (e) => {
            e.preventDefault();
            navigate(a.getAttribute("href"));
        });
    });
}

// back/forward support
window.addEventListener("popstate", () => {
    navigate(window.location.pathname, false);
});

// init
window.addEventListener("DOMContentLoaded", () => {
    setupNav();
    navigate(window.location.pathname || "/", false);
});