import { initServerStatusPage } from "./main.js";

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

let cleanup = null;
async function navigate(path, push = true) {
    // 🔥 cleanup previous page (important)
    if (cleanup) {
        cleanup();
        cleanup = null;
    }

    const page = routes[path] || "main";
    const isPlay = path === "/play";

    // layout handling
    layout.style.display = isPlay ? "none" : "";
    document.body.classList.toggle("play-mode", isPlay);

    // ✅ wait for HTML to load
    await loadPage(page);

    // ✅ run page-specific init ONLY for "/"
    if (path === "/") {
        cleanup = initServerStatusPage();
    }

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

// reload /play to /
const isReload = performance.getEntriesByType("navigation")[0]?.type === "reload";
if (isReload && window.location.pathname === "/play") {
    history.replaceState({}, "", "/");
}